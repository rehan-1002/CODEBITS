import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ProtectedCanvasViewer } from "@/components/drm/ProtectedCanvasViewer";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/db";
import { ResourceModel } from "@/models/Resource";
import { QuestionPaperModel } from "@/models/QuestionPaper";

interface ViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ViewerPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Protected Document Viewer [${id}] | CodeBits`,
    description: "Authenticated protected canvas document reading environment with dynamic forensic watermark.",
  };
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { id } = await params;

  // 1. Strict Authentication Gate: User MUST be logged in to view/study PDFs
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/login?redirect=${encodeURIComponent(`/viewer/${id}`)}`);
  }

  const user = await verifySessionToken(token);
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/viewer/${id}`)}`);
  }

  // 2. Fetch document record from MongoDB Atlas
  let resource: {
    id: string;
    title: string;
    subject?: string;
    scheme?: string;
    category?: string;
    file_url: string;
  } | null = null;

  try {
    await connectToDatabase();
    if (isValidObjectId(id)) {
      const dbDoc = await ResourceModel.findByIdAndUpdate(
        id,
        { $inc: { view_count: 1 } },
        { returnDocument: 'after' }
      ).lean();

      if (dbDoc) {
        resource = {
          id: dbDoc._id.toString(),
          title: dbDoc.title,
          subject: dbDoc.subject,
          scheme: dbDoc.scheme,
          category: dbDoc.category,
          file_url: dbDoc.file_url || `/api/resources/${id}/file`,
        };
      } else {
        const qp = await QuestionPaperModel.findByIdAndUpdate(
          id,
          { $inc: { view_count: 1 } },
          { returnDocument: 'after' }
        ).lean();

        if (qp) {
          const title =
            qp.title ||
            `MU | ${qp.scheme || 'Rev-2019'} | ${qp.subject}${
              qp.year ? ` (${qp.session ? `${qp.session} ` : ''}${qp.year})` : ''
            }`;
          resource = {
            id: qp._id.toString(),
            title,
            subject: qp.subject,
            scheme: qp.scheme || 'Mumbai University',
            category: 'pyq',
            file_url: `/api/resources/${id}/file`,
          };
        }
      }
    }
  } catch (err) {
    console.error("Error fetching resource from database:", err);
  }

  return (
    <div className="w-full min-h-screen">
      <ProtectedCanvasViewer
        documentId={id}
        fileUrl={resource?.file_url || `/api/resources/${id}/file`}
        documentTitle={resource?.title || "Mumbai University Engineering Document"}
        subject={resource?.subject || "Mumbai University Engineering"}
        scheme={resource?.scheme || "Mumbai University Engineering"}
        studentName={user.full_name.toUpperCase()}
        studentPhone={user.phone ? `+91 ${user.phone}` : undefined}
        category={resource?.category}
      />
    </div>
  );
}
