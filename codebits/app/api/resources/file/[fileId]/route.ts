import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { Readable } from 'stream';
import { connectToDatabase } from '@/lib/db';
import { getGridFSDownloadStream } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    await connectToDatabase();

    if (!isValidObjectId(fileId)) {
      return NextResponse.json({ success: false, error: 'Invalid file ID.' }, { status: 400 });
    }

    const result = await getGridFSDownloadStream(fileId);
    if (!result) {
      return NextResponse.json({ success: false, error: 'File payload not found in storage.' }, { status: 404 });
    }

    const webStream = Readable.toWeb(result.stream as any);
    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(result.file.filename || 'document.pdf')}"`,
        'Content-Length': result.file.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
