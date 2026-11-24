import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth-server';
import { AnswerCacheModel } from '@/models/AnswerCache';
import {
  generateContentWithFailover,
  computeQuestionHash,
  checkUserRateLimit,
  recordUserUsage,
  coalesceSolve,
  MU_EXAMINER_SYSTEM_INSTRUCTION,
  sanitizeGeminiErrorMessage,
} from '@/lib/ai/gemini';

const SolvePayloadSchema = z.object({
  questionText: z.string().trim().min(3, 'Question text is too short').max(10000),
  marks: z.number().int().min(1, 'Marks must be at least 1').max(50, 'Marks cannot exceed 50'),
  subject: z.string().max(150).optional(),
  qNum: z.string().max(30).optional(),
  hasDiagram: z.boolean().optional(),
  diagramType: z.string().max(100).optional(),
  diagramContent: z.string().max(10000).optional(),
  forceRefresh: z.boolean().optional(),
});

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    // 1. Mandatory Authentication Gate
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to solve questions.' },
        { status: 401 }
      );
    }

    const user = await verifySessionToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Session expired or invalid token. Please log in again.' },
        { status: 401 }
      );
    }

    // 2. Validate Payload
    const body = await req.json();
    const parsed = SolvePayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid question parameters.', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { questionText, marks, subject, qNum, hasDiagram, diagramType, diagramContent, forceRefresh } = parsed.data;
    const questionHash = computeQuestionHash(questionText);

    // 3. Connect to Database
    await connectToDatabase();

    // 4. CHECK CACHE (Tier 1: Instant, $0 API Cost, No Rate Limit Penalty)
    const isValidCachedAnswer = (text?: string) => {
      if (!text || text.length < 1500) return false;
      const trimmed = text.trim();
      // Ensure answer doesn't end abruptly mid-sentence or mid-header or dangling markdown/math
      if (
        trimmed.endsWith('**') ||
        trimmed.endsWith(':') ||
        trimmed.endsWith('#') ||
        trimmed.endsWith('$') ||
        trimmed.endsWith('\\') ||
        trimmed.endsWith(',') ||
        trimmed.endsWith('An $n') ||
        trimmed.endsWith('instead of restoring') ||
        trimmed.endsWith('instead of restoring.')
      ) {
        return false;
      }
      if (marks >= 4 && !trimmed.toLowerCase().includes('key takeaways')) {
        return false;
      }
      return true;
    };

    if (forceRefresh) {
      await AnswerCacheModel.deleteMany({ questionHash, marks });
    } else {
      const cachedRecord = await AnswerCacheModel.findOne({
        questionHash,
        marks,
      }).lean();

      if (cachedRecord && isValidCachedAnswer(cachedRecord.answerMarkdown)) {
        // Asynchronously update view count
        AnswerCacheModel.updateOne({ _id: cachedRecord._id }, { $inc: { viewCount: 1 } }).exec();

        return NextResponse.json({
          success: true,
          cached: true,
          marks,
          qNum: qNum || 'Question',
          subject: cachedRecord.subject || subject,
          answerMarkdown: cachedRecord.answerMarkdown,
          keyTakeaways: cachedRecord.keyTakeaways || [],
          diagramDescription: cachedRecord.diagramDescription || '',
          modelUsed: cachedRecord.modelUsed || 'cache_hit',
          viewCount: (cachedRecord.viewCount || 0) + 1,
        });
      } else if (cachedRecord) {
        // Delete truncated or incomplete record so it gets freshly regenerated
        await AnswerCacheModel.deleteOne({ _id: cachedRecord._id });
      }
    }

    // 5. CACHE MISS: Enforce Sliding-Window Rate Limit
    const rateLimitCheck = checkUserRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit active. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before generating a fresh solution.`,
          retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
          remainingCalls: 0,
        },
        { status: 429 }
      );
    }

    // Record rate limit consumption only for fresh AI generation
    recordUserUsage(user.id);

    // 6. PROMISE COALESCING: If multiple students hit this new question simultaneously,
    // merge into 1 single Gemini call!
    const coalesceKey = `${questionHash}_${marks}`;

    const solutionResult = await coalesceSolve(coalesceKey, async () => {
      // Generous token headroom so answers are NEVER truncated mid-sentence
      const maxOutputTokens = 8192;

      const userPrompt = `
ACADEMIC CONTEXT: Mumbai University Engineering Curriculum (Rev-2019 'C' Scheme)
SUBJECT: ${subject || 'Engineering Subject'}
QUESTION NUMBER: ${qNum || 'Question'}
EVALUATION WEIGHTAGE: ${marks} MARKS

QUESTION:
"${questionText}"

${
  hasDiagram && diagramContent
    ? `DIAGRAM / FIGURE DATA DETECTED FROM DOCUMENT:
Type: ${diagramType || 'Engineering Diagram / Figure'}
Structure & Components:
"""
${diagramContent}
"""
CRITICAL SOLVING INSTRUCTION: The question relies on the figure described above. You MUST solve the problem specifically using these exact vertices, edges, circuit components, or numerical values! In your answer, include a dedicated, clean, clearly labeled diagrammatic specification showing the student exactly how to sketch and label it in the exam booklet (strictly no broken ASCII or raw SVG).`
    : hasDiagram
    ? `NOTE ON DIAGRAM: This question references an electrical circuit, graph, or flowchart. Include a dedicated section with clean, clearly labeled diagram components, node values, and drawing steps so the student knows exactly what to draw in the exam booklet (strictly no broken ASCII or raw SVG).`
    : ''
}

RUBRIC REQUIREMENT FOR ${marks} MARKS:
${
  marks <= 2
    ? `• State the standard formal definition or scientific law.
• Provide the exact mathematical equation / formula with standard SI units.
• State exactly 2 concise, high-yield bulleted points.`
    : marks === 3
    ? `• 1. Formal Definition & Working Principle.
• 2. Governing Equations / Invariant Conditions (all required conditions listed with mathematical expressions).
• 3. Relevant practical example or diagrammatic breakdown.`
    : marks <= 5
    ? `• 1. Definition and fundamental principle.
• 2. Clear step-by-step working / operational breakdown.
• 3. Mathematical derivation steps, execution table, or key equations.
• 4. Diagrammatic description / schematic / flowchart points.
• 5. Primary advantages or practical engineering applications.`
    : marks <= 8
    ? `• Detailed ${marks}-Mark Institutional Structure:
  1. Detailed Theoretical Background & Principle.
  2. Complete Circuit / Block / Flowchart Diagram breakdown with clearly labeled stages.
  3. Step-by-Step Derivation or Full Numerical / Algorithmic Execution (trace all iterations).
  4. Working Table / Trace / State Register values (if applicable).
  5. Practical Significance & Examiner Key Points.`
    : `• Comprehensive ${marks}-Mark Institutional Structure:
  1. Introduction & Theoretical Significance.
  2. Circuit / Block / Architectural / Flowchart Diagram breakdown.
  3. Full Step-by-Step Derivation or Detailed Algorithmic / Numerical Solution.
  4. Tabular comparison or Operating modes (if applicable).
  5. Conclusion & Examiner Key Points.`
}

CRITICAL FORMATTING & STRUCTURE INSTRUCTIONS:
1. Use clear, distinct markdown headings for each major section, e.g.:
   - ### 1. Formal Definition & Theory
   - ### 2. Flowchart & Architectural Design
   - ### 3. Step-by-Step Numerical Solution / Execution
   - ### 4. Examiner Remarks & Verification
2. For mathematical expressions, always use proper LaTeX ($...$ for inline or $$...$$ for centered blocks).
3. Number each key condition, step, or law clearly:
   1. **Condition Name**: Explanation with math.
   2. **Condition Name**: Explanation with math.
4. FLOWCHART & VISUAL DIAGRAM REQUIREMENT (MANDATORY):
   If the question asks to "Draw flowchart" or "Draw circuit" or references an algorithm:
   a) MANDATORY VISUAL MERMAID DIAGRAM: You MUST include an interactive visual diagram using a \`\`\`mermaid ... \`\`\` block with standard "flowchart TD" syntax.
      The diagram must include all stages:
      - Start and End rounded nodes
      - Initialization box
      - Decision diamond nodes with Yes / No branches
      - Operation and shift boxes
      - Loop back arrows
      This is required so the web application renders the interactive flowchart graphic on screen.
   b) OVERLEAF LATEX TIKZ CODE: Directly beneath the Mermaid diagram, provide the complete, compilable LaTeX TikZ code in a \`\`\`latex ... \`\`\` block using \\\\documentclass{standalone}, \\\\usepackage{tikz}, and \\\\usetikzlibrary{shapes.geometric, arrows} so students can copy it directly into Overleaf to compile into a PDF.
5. NUMERICAL ALGORITHM & REGISTER TRACE REQUIREMENT:
   If the question asks to solve an algorithm or arithmetic problem (e.g., non-restoring division, restoring division, Booth's algorithm, CPU scheduling):
   - Explicitly define all initial registers, lengths, and binary representations.
   - You MUST include a complete Markdown Table tracing EVERY step and cycle from start to finish.
   - Show final results (Quotient, Remainder, etc.) with decimal verification.
6. Ensure your answer is 100% COMPLETE. NEVER truncate mid-sentence.
7. At the very end of your response, add a section exactly named "### KEY TAKEAWAYS FOR EXAM" with 2-3 high-yield bullet points for scoring maximum marks in Mumbai University exams.
`;

      const { text: answerMarkdown, modelUsed } = await generateContentWithFailover({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: MU_EXAMINER_SYSTEM_INSTRUCTION,
          maxOutputTokens,
          temperature: 0.2, // Low temperature for high precision and zero hallucination
        },
      });

      // Extract takeaways if present
      const takeaways: string[] = [];
      const takeawaySplit = answerMarkdown.split(/### KEY TAKEAWAYS FOR EXAM/i);
      if (takeawaySplit.length > 1) {
        const rawTakeaways = takeawaySplit[1];
        const lines = rawTakeaways.split('\n');
        for (const line of lines) {
          const cleaned = line.replace(/^[*\-•\d.]+\s*/, '').trim();
          if (cleaned) takeaways.push(cleaned);
        }
      }

      // Save to MongoDB Cache only if the answer is structurally complete and valid
      if (isValidCachedAnswer(answerMarkdown)) {
        await AnswerCacheModel.findOneAndUpdate(
          { questionHash, marks },
          {
            questionHash,
            questionText,
            marks,
            subject: subject || 'Mumbai University Engineering',
            answerMarkdown,
            keyTakeaways: takeaways,
            diagramDescription: hasDiagram ? 'Circuit / Block Schematic Included' : '',
            source: 'ai_gemini',
            modelUsed: modelUsed || 'gemini-2.5-flash',
            viewCount: 1,
          },
          { upsert: true, new: true }
        );
      }

      return {
        answerMarkdown,
        keyTakeaways: takeaways,
        diagramDescription: hasDiagram ? 'Circuit / Block Schematic Included' : '',
      };
    });

    return NextResponse.json({
      success: true,
      cached: false,
      marks,
      qNum: qNum || 'Question',
      subject: subject || 'Mumbai University Engineering',
      answerMarkdown: solutionResult.answerMarkdown,
      keyTakeaways: solutionResult.keyTakeaways || [],
      diagramDescription: solutionResult.diagramDescription || '',
      modelUsed: 'gemini-2.5-flash',
      remainingCalls: rateLimitCheck.remainingCalls,
    });
  } catch (error: any) {
    console.error('Question Solver Error:', error);
    const msg = sanitizeGeminiErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
