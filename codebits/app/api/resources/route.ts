import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth-server';
import { AcademicBranch, AcademicSemester, DocumentCategory } from '@/types/resources';
import { saveResourcePdf } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Escape regex special characters to prevent ReDoS / Regex Injection
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// GET: Filtered Search of Academic Vault
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim();

    const statusParam = searchParams.get('status');
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    // By default, public visitors only see approved documents.
    // If the caller is an authenticated admin and requests status=pending, allow it.
    let statusFilter: string = 'approved';
    if (user?.role === 'admin' && statusParam && ['approved', 'pending', 'rejected'].includes(statusParam)) {
      statusFilter = statusParam;
    }

    // Defensive query construction (type-safe, strictly sanitized)
    const filter: Record<string, unknown> = { status: statusFilter };

    const validBranches = ['ALL', 'COMPS', 'IT', 'AI-DS', 'EXTC', 'MECH', 'CIVIL'];
    if (branch && branch !== 'ALL' && validBranches.includes(branch)) {
      // First year subjects uploaded as 'ALL' are common to all branches
      filter.branch = { $in: [branch, 'ALL'] };
    }

    if (semester && semester !== 'ALL') {
      const semNum = parseInt(semester, 10);
      if (!isNaN(semNum) && semNum >= 1 && semNum <= 8) {
        filter.semester = semNum as AcademicSemester;
      }
    }

    const validCategories = ['pyq', 'notes', 'syllabus', 'solution'];
    if (category && category !== 'ALL' && validCategories.includes(category)) {
      filter.category = category as DocumentCategory;
    }

    if (search && search.length > 0 && search.length <= 100) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { subject: { $regex: escaped, $options: 'i' } },
      ];
    }

    const docs = await ResourceModel.find(filter)
      .select('title subject branch semester scheme category file_url gridfs_id file_size page_count uploader_id uploader_name uploader_role status view_count createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const resources = docs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      subject: doc.subject,
      branch: doc.branch,
      semester: doc.semester,
      scheme: doc.scheme,
      category: doc.category,
      file_url: doc.file_url,
      gridfs_id: doc.gridfs_id,
      file_size: doc.file_size,
      page_count: doc.page_count,
      uploader_id: doc.uploader_id,
      uploader_name: doc.uploader_name,
      uploader_role: doc.uploader_role,
      status: doc.status,
      view_count: doc.view_count,
      created_at: doc.createdAt?.toISOString() || new Date().toISOString(),
    }));

    const response = NextResponse.json({ success: true, resources });

    // Prevent stale caching on Edge CDN and browser so new uploads appear immediately
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, max-age=0, must-revalidate'
    );

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Secure Resource Contribution & PDF File Validation (Supports JSON Base64 and FormData)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let subject = '';
    let branch: AcademicBranch = 'COMPS';
    let semester: AcademicSemester = 3;
    let category: DocumentCategory = 'pyq';
    let fileName = '';
    let fileSize = 0;
    let buffer: Buffer;

    if (contentType.includes('application/json')) {
      const json = await req.json();
      title = (json.title || '').toString().trim();
      subject = (json.subject || '').toString().trim();
      branch = (json.branch || 'COMPS').toString().trim() as AcademicBranch;
      semester = parseInt(json.semester?.toString() || '3', 10) as AcademicSemester;
      category = (json.category || 'pyq').toString().trim() as DocumentCategory;
      fileName = (json.fileName || 'document.pdf').toString().trim();

      const rawB64 = (json.fileBase64 || '').toString();
      const cleanB64 = rawB64.replace(/^data:[^;]+;base64,/, '').trim();
      if (!cleanB64) {
        return NextResponse.json({ success: false, error: 'A valid PDF document is required.' }, { status: 400 });
      }

      buffer = Buffer.from(cleanB64, 'base64');
      fileSize = buffer.length;
    } else {
      const formData = await req.formData();
      title = formData.get('title')?.toString().trim() || '';
      subject = formData.get('subject')?.toString().trim() || '';
      branch = formData.get('branch')?.toString().trim() as AcademicBranch;
      semester = parseInt(formData.get('semester')?.toString() || '3', 10) as AcademicSemester;
      category = formData.get('category')?.toString().trim() as DocumentCategory;
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'A PDF file is required.' }, { status: 400 });
      }

      fileName = file.name;
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // 1. Field validation
    if (!title || !subject || title.length > 200 || subject.length > 120) {
      return NextResponse.json(
        { success: false, error: 'Title and subject are required and must be within length limits.' },
        { status: 400 }
      );
    }

    // 2. File size check (Max 4.5MB for Serverless compatibility)
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5 MB platform limit
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)} MB) exceeds the 4.5 MB serverless limit. Please compress your PDF before uploading.`,
        },
        { status: 413 }
      );
    }

    // 3. Name check
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF documents (.pdf) are allowed.' },
        { status: 400 }
      );
    }

    // 4. Magic Byte Verification (%PDF- header verification)
    const magicHeader = buffer.subarray(0, 4).toString('ascii');
    if (magicHeader !== '%PDF') {
      return NextResponse.json(
        { success: false, error: 'Security rejection: Uploaded file is not a valid PDF document.' },
        { status: 400 }
      );
    }

    // 5. Store File permanently in MongoDB GridFS with resilient local disk caching
    const saved = await saveResourcePdf(buffer, fileName);

    // 6. Check user session for moderation status
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    const isAdmin = user?.role === 'admin';
    const status = isAdmin ? 'approved' : 'pending';

    const validBranches = ['ALL', 'COMPS', 'IT', 'AI-DS', 'EXTC', 'MECH', 'CIVIL'];
    const safeBranch = branch && validBranches.includes(branch) ? branch : (semester <= 2 ? 'ALL' : 'COMPS');

    const validCategories = ['pyq', 'notes', 'syllabus', 'solution'];
    const safeCategory = category && validCategories.includes(category) ? category : 'pyq';

    const newResourceId = new mongoose.Types.ObjectId();
    const fileUrl = `/api/resources/${newResourceId.toString()}/file`;

    const newResource = await ResourceModel.create({
      _id: newResourceId,
      title,
      subject,
      branch: safeBranch,
      semester: semester || (safeBranch === 'ALL' ? 1 : 3),
      scheme: 'Mumbai University',
      category: safeCategory,
      file_url: fileUrl,
      gridfs_id: saved.gridfsId,
      file_size: fileSize,
      page_count: 1,
      uploader_id: user?.id || 'guest-contributor',
      uploader_name: user?.full_name || 'Student Contributor',
      uploader_role: isAdmin ? 'admin' : 'student',
      status,
      view_count: 0,
    });

    return NextResponse.json({
      success: true,
      message: isAdmin
        ? 'Resource published directly to academic vault.'
        : 'Resource submitted for faculty verification.',
      resource: {
        id: newResource._id.toString(),
        title: newResource.title,
        status: newResource.status,
      },
    });
  } catch (err: unknown) {
    console.error('Resource upload failure in /api/resources:', err);
    const message = err instanceof Error ? err.message : 'Server error occurred while submitting document.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
