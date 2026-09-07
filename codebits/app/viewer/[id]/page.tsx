import React from "react";
import { Metadata } from "next";
import { ProtectedCanvasViewer } from "@/components/drm/ProtectedCanvasViewer";

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

  return (
    <div className="w-full min-h-screen">
      <ProtectedCanvasViewer documentId={id} />
    </div>
  );
}
