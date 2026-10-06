import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth-server';
import { AcademicBranch, AcademicSemester, DocumentCategory } from '@/types/resources';

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

    const validBranches = ['COMPS', 'IT', 'AI-DS', 'EXTC', 'MECH', 'CIVIL'];
    if (branch && branch !== 'ALL' && validBranches.includes(branch)) {
      filter.branch = branch as AcademicBranch;
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
      file_size: doc.file_size,
      page_count: doc.page_count,
      uploader_id: doc.uploader_id,
      uploader_name: doc.uploader_name,
      uploader_role: doc.uploader_role,
      status: doc.status,
      view_count: doc.view_count,
      created_at: doc.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, resources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Secure Resource Contribution & PDF File Validation
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const title = formData.get('title')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const branch = formData.get('branch')?.toString().trim() as AcademicBranch;
    const semester = parseInt(formData.get('semester')?.toString() || '3', 10) as AcademicSemester;
    const category = formData.get('category')?.toString().trim() as DocumentCategory;
    const file = formData.get('file') as File | null;

    // 1. Field validation
    if (!title || !subject || title.length > 200 || subject.length > 120) {
      return NextResponse.json(
        { success: false, error: 'Title and subject are required and must be within length limits.' },
        { status: 400 }
      );
    }

    // 2. File existence and size check (Max 25MB)
    if (!file) {
      return NextResponse.json({ success: false, error: 'A PDF file is required.' }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 25MB.' },
        { status: 400 }
      );
    }

    // 3. Name check
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF documents (.pdf) are allowed.' },
        { status: 400 }
      );
    }

    // 4. Magic Byte Verification (%PDF- header verification)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const magicHeader = buffer.subarray(0, 4).toString('ascii');

    if (magicHeader !== '%PDF') {
      return NextResponse.json(
        { success: false, error: 'Security rejection: Uploaded file is not a valid PDF document.' },
        { status: 400 }
      );
    }

    // 5. Store File securely in /public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeFileName = `doc_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.pdf`;
    const filePath = path.join(uploadsDir, safeFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    // 6. Check user session for moderation status
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    const isAdmin = user?.role === 'admin';
    const status = isAdmin ? 'approved' : 'pending';

    const newResource = await ResourceModel.create({
      title,
      subject,
      branch: branch || 'COMPS',
      semester: semester || 3,
      scheme: 'Mumbai University',
      category: category || 'pyq',
      file_url: fileUrl,
      file_size: file.size,
      page_count: 1,
      uploader_id: user?.id || 'guest-contributor',
      uploader_name: user?.full_name || 'Student Contributor',
      uploader_role: isAdmin ? 'admin' : 'student',
      status,
      view_count: 0,
    });

    return NextResponse.json({
      success: true,
      message: isAdmin ? 'Resource published directly to vault.' : 'Resource queued for faculty review.',
      resource: {
        id: newResource._id.toString(),
        title: newResource.title,
        status: newResource.status,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
