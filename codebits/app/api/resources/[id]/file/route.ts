import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { Readable } from 'stream';
import path from 'path';
import { readFile } from 'fs/promises';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
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
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found in vault.' }, { status: 404 });
    }

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
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      } catch {
        // If file not found locally on disk, redirect to the public URL
        return NextResponse.redirect(new URL(doc.file_url, req.url));
      }
    }

    // 3. Fallback for external URLs
    if (doc.file_url && (doc.file_url.startsWith('http://') || doc.file_url.startsWith('https://'))) {
      return NextResponse.redirect(new URL(doc.file_url));
    }

    return NextResponse.json({ success: false, error: 'Document file payload not available.' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
