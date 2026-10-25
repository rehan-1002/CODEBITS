import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
import { SyllabusOverviewModel } from '@/models/SyllabusOverview';
import { getGridFSDownloadStream } from '@/lib/storage';
import { getGeminiClient, GEMINI_MODEL_CASCADE, sanitizeGeminiErrorMessage } from '@/lib/ai/gemini';
import { SyllabusOverviewData } from '@/types/resources';

export const maxDuration = 60;

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource ID.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Check if the resource exists
    const resource = await ResourceModel.findById(id).lean();
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource document not found.' },
        { status: 404 }
      );
    }

    // 2. Check if overview is already cached in MongoDB
    const cachedOverview = await SyllabusOverviewModel.findOne({ resourceId: id }).lean();
    if (cachedOverview?.overview) {
      return NextResponse.json({
        success: true,
        data: cachedOverview.overview,
        cached: true,
      });
    }

    // 3. Fetch PDF buffer from GridFS or local disk
    let pdfBuffer: Buffer | null = null;

    if (resource.gridfs_id) {
      try {
        const streamData = await getGridFSDownloadStream(resource.gridfs_id);
        if (streamData) {
          const chunks: Buffer[] = [];
          for await (const chunk of streamData.stream) {
            chunks.push(Buffer.from(chunk));
          }
          pdfBuffer = Buffer.concat(chunks);
        }
      } catch (gridFsErr) {
        console.warn('GridFS stream read error:', gridFsErr);
      }
    }

    // Fallback: Check local disk or file_url if GridFS stream was not found
    if (!pdfBuffer && resource.file_url) {
      try {
        if (resource.file_url.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', resource.file_url);
          pdfBuffer = await fs.readFile(filePath);
        } else if (resource.file_url.startsWith('http')) {
          const res = await fetch(resource.file_url);
          if (res.ok) {
            const arr = await res.arrayBuffer();
            pdfBuffer = Buffer.from(arr);
          }
        }
      } catch (localErr) {
        console.warn('Local/URL buffer read error:', localErr);
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not access the PDF document payload to generate AI overview.',
        },
        { status: 404 }
      );
    }

    // 4. Extract first 12 pages using pdf-lib (where MU Teaching & Examination Schemes always reside)
    const { PDFDocument } = await import('pdf-lib');
    let schemeBuffer: Buffer = pdfBuffer;

    try {
      const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = sourcePdf.getPageCount();
      const pagesToCopy = Math.min(totalPages, 12);

      const schemeDoc = await PDFDocument.create();
      const copied = await schemeDoc.copyPages(
        sourcePdf,
        Array.from({ length: pagesToCopy }, (_, i) => i)
      );
      copied.forEach((page) => schemeDoc.addPage(page));
      const savedBytes = await schemeDoc.save({ useObjectStreams: true });
      schemeBuffer = Buffer.from(savedBytes);
    } catch (sliceErr) {
      console.warn('PDF slice extraction skipped, using full document:', sliceErr);
    }

    // 5. Query Gemini with RAG PDF payload for structured tabular extraction
    const base64Pdf = schemeBuffer.toString('base64');

    const prompt = `
You are a senior academic curriculum specialist for Mumbai University Engineering (Faculty of Science & Technology).
Carefully read the provided Mumbai University Syllabus document and examine the Teaching Scheme and Examination Scheme tables.

Extract the complete curriculum structure into a valid, strict JSON object following this EXACT schema:
{
  "schemeTitle": "e.g. University of Mumbai - Rev 2019 'C' Scheme / NEP 2024",
  "branch": "${resource.branch || 'Engineering'}",
  "semester": ${resource.semester || 3},
  "totalCredits": "e.g. 23",
  "totalMarks": "e.g. 750",
  "theorySubjectsCount": 5,
  "practicalLabsCount": 3,
  "bothCount": 3,
  "passingRules": "Detailed passing criteria (e.g. Minimum 40% in End Sem Exam & Internal Assessment, separate passing in Term Work / Oral)",
  "notes": [
    "Any important syllabus scheme guidelines or exam directives from the university"
  ],
  "subjects": [
    {
      "code": "e.g. CSC301",
      "name": "e.g. Applied Mathematics-III",
      "type": "theory" | "practical" | "both" | "project",
      "teachingScheme": {
        "lectures": 3,
        "practicals": "-",
        "tutorials": 1,
        "credits": 4
      },
      "examScheme": {
        "internalAssessment": 20,
        "endSemExam": 80,
        "examDurationHours": "3h",
        "termWork": "-",
        "practicalOral": "-",
        "totalMarks": 100
      },
      "summary": "1 concise sentence explaining the primary core modules covered in this subject"
    }
  ]
}

CRITICAL RULES FOR "type":
- "theory": Subject with lectures and an End Sem written theory exam (ESE), but NO dedicated practical/oral exam.
- "practical": Subject that is strictly a Laboratory, Workshop, Mini Project, or Skill Lab (usually has Term Work [TW] and/or Practical/Oral [PR/OR], NO written 80-mark theory exam).
- "both": Subject that has BOTH a formal End Semester theory exam (ESE) AND associated practical lab / oral sessions or termwork.
- "project": Mini-project or Major project course.

Return ONLY the raw JSON object. Do not wrap in markdown or backticks.
`;

    let extractedData: SyllabusOverviewData | null = null;
    let modelUsed = 'gemini-2.5-flash';

    for (const model of GEMINI_MODEL_CASCADE) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Pdf,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        if (response.text) {
          const cleanedText = response.text
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

          const parsed = JSON.parse(cleanedText);
          parsed.resourceId = id;
          parsed.generatedAt = new Date().toISOString();
          extractedData = parsed as SyllabusOverviewData;
          modelUsed = model;
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed for syllabus overview:`, err);
      }
    }

    if (!extractedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to extract structured curriculum tables from the syllabus PDF. Please try again.',
        },
        { status: 502 }
      );
    }

    // 6. Cache the extracted result in MongoDB so future clicks are 0ms
    try {
      await SyllabusOverviewModel.findOneAndUpdate(
        { resourceId: id },
        {
          resourceId: new mongoose.Types.ObjectId(id),
          overview: extractedData,
          modelUsed,
        },
        { upsert: true, new: true }
      );
    } catch (cacheErr) {
      console.warn('Failed to cache syllabus overview:', cacheErr);
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating syllabus overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: sanitizeGeminiErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
