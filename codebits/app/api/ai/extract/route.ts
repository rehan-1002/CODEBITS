import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth-server';
import { AnswerCacheModel } from '@/models/AnswerCache';
import {
  generateContentWithFailover,
  computeQuestionHash,
  MU_EXAMINER_SYSTEM_INSTRUCTION,
  sanitizeGeminiErrorMessage,
} from '@/lib/ai/gemini';

// Defensive Payload Schema
const ExtractPayloadSchema = z.object({
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  rawText: z.string().max(20000).optional(),
  fileName: z.string().max(255).optional(),
});

export const maxDuration = 60; // Next.js extended timeout for vision scanning

export async function POST(req: NextRequest) {
  try {
    // 1. Mandatory Authentication Gate
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to access the Question Bank Solver.' },
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

    // 2. Parse & Validate Payload
    const body = await req.json();
    const parsed = ExtractPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure.', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { base64, mimeType, rawText, fileName } = parsed.data;
    if (!base64 && !rawText) {
      return NextResponse.json(
        { error: 'Please provide either a document image/PDF or question text.' },
        { status: 400 }
      );
    }

    // 3. Connect to Database for Caching verification
    await connectToDatabase();

    // 4. Construct Gemini Vision or Text prompt

    const extractionPrompt = `
You are analyzing an academic document submitted by a Mumbai University engineering student.
The document may be a printed question paper, question bank, or handwritten notes/assignments (which may have rushed handwriting or slant).

TASK:
1. Determine if this is an academic/engineering document. If it is a meme, selfie, random non-academic photo, set "isAcademicDocument": false.
2. Extract all academic questions from the document accurately.
3. For handwritten text: decipher messy handwriting carefully using engineering context (e.g. Mathematics, DSA, Networks, Electronics, Mechanics).
4. Preserve and format all mathematical expressions, equations, formulas, integrals, and matrices using LaTeX ($...$ inline or $$...$$ block).
5. If an equation or question is visibly cut off at the edge/margin of the photo, set "status": "incomplete_at_margin". Otherwise set "status": "complete".
6. DIAGRAM & FIGURE DETECTION (MANDATORY):
   If any question contains, references, or has an accompanying diagram, electrical circuit, graph, tree, flowchart, waveform, or state machine:
   - Set "hasDiagram": true.
   - Set "diagramType": one of "graph", "circuit", "flowchart", "logic_gate", "state_diagram", "tree", "waveform", "mechanical".
   - Set "diagramContent": Provide a comprehensive, exact technical description of the diagram components drawn on the page. For graphs: list all vertices and every connecting edge for each graph shown (e.g., "Graph G1: Vertices {v1, v2, v3, v4}, Edges {(v1,v2), (v2,v3), (v3,v4), (v4,v1)}. Graph G2: ..."). For circuits: list all components, branch values, voltage/current sources, node labels.
   - Set "diagramVisual": Provide an ASCII art schematic or structured visual layout of the figure so students can see the exact diagram drawn on the paper.
   If no diagram is present for that question, set "hasDiagram": false, "diagramContent": "", "diagramVisual": "".
7. Extract the default marks if stated on the paper (e.g. [5M], 10 Marks). If unstated, set "defaultMarks": 5.

OUTPUT SPECIFICATION:
Respond ONLY with a valid JSON object strictly matching this structure:
{
  "isAcademicDocument": true,
  "paperTitle": "Course / Exam Paper Title (or 'Mumbai University Question Bank')",
  "subject": "Subject Name (e.g. Discrete Mathematics, Basic Electrical, etc.)",
  "totalQuestionsDetected": 5,
  "questions": [
    {
      "id": "q1_a",
      "qNum": "Q.1(a)",
      "text": "Exact text of the question with LaTeX math.",
      "defaultMarks": 5,
      "hasDiagram": true,
      "diagramType": "graph",
      "diagramContent": "Exact structural/component description of the figure shown on the paper",
      "diagramVisual": "ASCII art / text representation of the diagram",
      "module": "Module Name",
      "status": "complete"
    }
  ]
}
`;

    const parts: any[] = [{ text: extractionPrompt }];

    if (base64) {
      // Clean base64 string if data URL prefix exists
      const cleanData = base64.replace(/^data:[^;]+;base64,/, '');
      const validMime = mimeType || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType: validMime,
          data: cleanData,
        },
      });
    } else if (rawText) {
      parts.push({ text: `Raw Question Paper Text:\n${rawText}` });
    }

    const { text: aiResponseText } = await generateContentWithFailover({
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: MU_EXAMINER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    if (!aiResponseText) {
      return NextResponse.json(
        { error: 'No response generated from AI vision engine. Please ensure the document is clear.' },
        { status: 502 }
      );
    }

    // Robustly extract JSON object between first { and last }
    let jsonContent = aiResponseText.trim();
    const firstBrace = jsonContent.indexOf('{');
    const lastBrace = jsonContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(jsonContent);
    } catch (parseErr) {
      console.error('[AI EXTRACT] JSON parse error on response:', aiResponseText);
      return NextResponse.json(
        { error: 'Failed to parse structured questions. Please try uploading a clearer image.' },
        { status: 422 }
      );
    }

    if (!parsedResult.isAcademicDocument) {
      return NextResponse.json(
        {
          isAcademicDocument: false,
          error: 'No academic or engineering questions detected in this document. Please upload an exam paper, assignment, or syllabus question bank.',
        },
        { status: 422 }
      );
    }

    // 6. Batch MongoDB Cache Lookup for all extracted questions
    const questions = parsedResult.questions || [];
    const questionHashes = questions.map((q: any) => computeQuestionHash(q.text));

    // Find all cached answers for these questions
    const cachedEntries = await AnswerCacheModel.find({
      questionHash: { $in: questionHashes },
    }).select('questionHash marks viewCount').lean();

    // Map cached marks to each question
    const hashToCachedMarks = new Map<string, number[]>();
    for (const entry of cachedEntries) {
      const existing = hashToCachedMarks.get(entry.questionHash) || [];
      existing.push(entry.marks);
      hashToCachedMarks.set(entry.questionHash, existing);
    }

    const enrichedQuestions = questions.map((q: any) => {
      const hash = computeQuestionHash(q.text);
      const cachedMarks = hashToCachedMarks.get(hash) || [];
      return {
        ...q,
        hash,
        isCached: cachedMarks.length > 0,
        cachedMarks,
      };
    });

    return NextResponse.json({
      success: true,
      paperTitle: parsedResult.paperTitle || fileName || 'Mumbai University Question Paper',
      subject: parsedResult.subject || 'Mumbai University Engineering',
      totalQuestions: enrichedQuestions.length,
      questions: enrichedQuestions,
    });
  } catch (error: any) {
    console.error('Question Extraction Error:', error);
    const msg = sanitizeGeminiErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
