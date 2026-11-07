import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { ResourceModel } from '@/models/Resource';
import { QuestionPaperModel, mapQpBranchToAcademicBranch } from '@/models/QuestionPaper';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth-server';
import { deleteResourcePdf } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    // Check if ID is a valid MongoDB ObjectId to prevent CastError / NoSQL injection
    let doc = null;
    if (isValidObjectId(id)) {
      doc = await ResourceModel.findByIdAndUpdate(
        id,
        { $inc: { view_count: 1 } },
        { returnDocument: 'after' }
      )
        .select('title subject branch semester scheme category file_url gridfs_id file_size page_count uploader_id uploader_name uploader_role status view_count createdAt')
        .lean();

      if (!doc) {
        const qp = await QuestionPaperModel.findByIdAndUpdate(
          id,
          { $inc: { view_count: 1 } },
          { returnDocument: 'after' }
        ).lean();

        if (qp) {
          const academicBranch = mapQpBranchToAcademicBranch(qp.branch, qp.semester);
          const title =
            qp.title ||
            `MU | ${qp.scheme || 'Rev-2019'} | ${qp.subject}${
              qp.year ? ` (${qp.session ? `${qp.session} ` : ''}${qp.year})` : ''
            }`;

          return NextResponse.json({
            success: true,
            resource: {
              id: qp._id.toString(),
              title,
              subject: qp.subject,
              branch: academicBranch,
              semester: qp.semester,
              scheme: qp.scheme || 'Mumbai University',
              category: 'pyq',
              file_url: `/api/resources/${qp._id.toString()}/file`,
              gridfs_id: null,
              file_size: 0,
              page_count: 1,
              uploader_id: 'system',
              uploader_name: 'Mumbai University Archives',
              uploader_role: 'admin',
              status: 'approved',
              view_count: qp.view_count || 1,
              created_at: qp.createdAt ? new Date(qp.createdAt).toISOString() : new Date().toISOString(),
            },
          });
        }
      }
    }

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resource: {
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
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH: Admin Moderation (Approve or Reject document)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify Admin authentication
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid moderation status value.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID.' }, { status: 400 });
    }

    const updated = await ResourceModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Document status updated to ${status}.`,
      resource: {
        id: updated._id.toString(),
        status: updated.status,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Admin Moderation (Remove spam or rejected document)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify Admin authentication
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid document ID.' }, { status: 400 });
    }

    const deletedDoc = await ResourceModel.findByIdAndDelete(id);
    if (deletedDoc) {
      await deleteResourcePdf(deletedDoc.gridfs_id, deletedDoc.file_url);
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
