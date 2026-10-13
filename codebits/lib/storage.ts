import path from 'path';
import crypto from 'crypto';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';

export interface SavedPdfResult {
  gridfsId: string;
  fileName: string;
  fileSize: number;
}

/**
 * Returns the GridFS Bucket instance attached to the MongoDB connection.
 */
export async function getGridFSBucket(): Promise<mongoose.mongo.GridFSBucket> {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not ready for GridFS operations.');
  }
  return new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'uploads',
  });
}

/**
 * Persists a PDF document to MongoDB GridFS (permanent, cloud-compatible, Vercel-ready).
 * Also performs best-effort local filesystem caching when running in an environment
 * with a writable disk (e.g. localhost), while safely ignoring EROFS on serverless (Vercel).
 */
export async function saveResourcePdf(
  buffer: Buffer,
  originalFileName: string
): Promise<SavedPdfResult> {
  const bucket = await getGridFSBucket();

  const safeFileName = `doc_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.pdf`;

  // 1. Upload into MongoDB GridFS
  const gridfsId = await new Promise<string>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(safeFileName, {
      metadata: {
        contentType: 'application/pdf',
        originalName: originalFileName,
        uploadedAt: new Date(),
      },
    });

    const readable = Readable.from(buffer);
    readable
      .pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve(uploadStream.id.toString()));
  });

  // 2. Best-effort local file write for local development speed / cache (skipped on Vercel)
  if (!process.env.VERCEL) {
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, safeFileName), buffer);
    } catch (fsErr) {
      console.warn(
        'Notice: Local filesystem write skipped (file is safely stored in MongoDB GridFS):',
        fsErr instanceof Error ? fsErr.message : fsErr
      );
    }
  }

  return {
    gridfsId,
    fileName: safeFileName,
    fileSize: buffer.length,
  };
}

/**
 * Retrieves a download stream and file info from MongoDB GridFS by ID.
 */
export async function getGridFSDownloadStream(id: string) {
  const bucket = await getGridFSBucket();
  const objId = new mongoose.Types.ObjectId(id);

  const files = await bucket.find({ _id: objId }).toArray();
  if (!files || files.length === 0) {
    return null;
  }

  const file = files[0];
  const stream = bucket.openDownloadStream(objId);

  return {
    stream,
    file,
  };
}

/**
 * Deletes a file from GridFS and optionally removes any local copy.
 */
export async function deleteResourcePdf(gridfsId?: string, fileName?: string): Promise<void> {
  if (gridfsId && mongoose.isValidObjectId(gridfsId)) {
    try {
      const bucket = await getGridFSBucket();
      await bucket.delete(new mongoose.Types.ObjectId(gridfsId));
    } catch (err) {
      console.warn('GridFS delete error (safely handled):', err);
    }
  }

  if (fileName) {
    try {
      const safeName = path.basename(fileName);
      const filePath = path.join(process.cwd(), 'public', 'uploads', safeName);
      await unlink(filePath);
    } catch {
      // Ignored if file doesn't exist on disk
    }
  }
}
