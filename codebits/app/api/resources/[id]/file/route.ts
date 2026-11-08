import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { Readable } from 'stream';
import path from 'path';
import { readFile } from 'fs/promises';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
import { QuestionPaperModel } from '@/models/QuestionPaper';
import { EntrancePaperModel } from '@/models/EntrancePaper';
import { getGridFSDownloadStream } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID.' }, { status: 400 });
    }

    const doc = await ResourceModel.findById(id).lean();
    if (doc) {
      // 1. If stored in MongoDB GridFS, stream directly
      if (doc.gridfs_id && isValidObjectId(doc.gridfs_id)) {
        const result = await getGridFSDownloadStream(doc.gridfs_id);
        if (result) {
          const webStream = Readable.toWeb(result.stream as any);
          return new NextResponse(webStream as any, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title || 'document')}.pdf"`,
              'Content-Length': result.file.length.toString(),
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            },
          });
        }
      }

      // 2. Fallback for legacy seeded files stored in /public/uploads/
      if (doc.file_url && doc.file_url.startsWith('/uploads/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', doc.file_url);
          const buffer = await readFile(localPath);
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title || 'document')}.pdf"`,
              'Content-Length': buffer.length.toString(),
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            },
          });
        } catch {
          // If file not found locally on disk, redirect to the public URL
          return NextResponse.redirect(new URL(doc.file_url, req.url));
        }
      }

      // 3. Fallback for external URLs in ResourceModel - proxy to avoid CORS in canvas viewer
      if (doc.file_url && (doc.file_url.startsWith('http://') || doc.file_url.startsWith('https://'))) {
        try {
          const extRes = await fetch(doc.file_url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeBits-Engine/1.0' },
          });
          if (extRes.ok && extRes.body) {
            const contentLength = extRes.headers.get('content-length');
            const headers: Record<string, string> = {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title || 'document')}.pdf"`,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            };
            if (contentLength) headers['Content-Length'] = contentLength;
            return new NextResponse(extRes.body as any, { status: 200, headers });
          }
        } catch (e) {
          console.error('Error proxying external PDF in ResourceModel:', e);
        }
        return NextResponse.redirect(new URL(doc.file_url));
      }
    }

    // 2. Try finding in QuestionPaperModel
    const qp = await QuestionPaperModel.findById(id).lean();
    if (qp && qp.pdfUrl) {
      try {
        const extRes = await fetch(qp.pdfUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeBits-Engine/1.0' },
        });
        if (extRes.ok && extRes.body) {
          const contentLength = extRes.headers.get('content-length');
          const title = qp.title || `MU_${qp.subject}_${qp.year || 'QP'}`;
          const headers: Record<string, string> = {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${encodeURIComponent(title)}.pdf"`,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          };
          if (contentLength) headers['Content-Length'] = contentLength;
          return new NextResponse(extRes.body as any, { status: 200, headers });
        }
      } catch (e) {
        console.error('Error fetching question paper PDF from source:', e);
      }
      return NextResponse.redirect(new URL(qp.pdfUrl));
    }

    // 3. Try finding in EntrancePaperModel
    const ep = await EntrancePaperModel.findById(id).lean();
    if (ep && ep.pdfUrl) {
      try {
        const extRes = await fetch(ep.pdfUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeBits-Engine/1.0' },
        });
        if (extRes.ok && extRes.body) {
          const contentLength = extRes.headers.get('content-length');
          const title = ep.title || `${ep.examType}_${ep.subject}_${ep.year || 'QP'}`;
          const headers: Record<string, string> = {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${encodeURIComponent(title)}.pdf"`,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          };
          if (contentLength) headers['Content-Length'] = contentLength;
          return new NextResponse(extRes.body as any, { status: 200, headers });
        }
      } catch (e) {
        console.error('Error fetching entrance paper PDF from source:', e);
      }
      return NextResponse.redirect(new URL(ep.pdfUrl));
    }

    return NextResponse.json({ success: false, error: 'Document file payload not available.' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
