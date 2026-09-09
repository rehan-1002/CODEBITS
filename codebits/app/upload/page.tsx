import React from "react";
import { Metadata } from "next";
import { ResourceUploadForm } from "@/components/upload/ResourceUploadForm";

export const metadata: Metadata = {
  title: "Contribute | CodeBits Academic Vault",
  description:
    "Contribute verified Mumbai University engineering question papers, lecture notes, and solutions for faculty review and public vault indexing.",
};

export default function UploadPage() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Minimal Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)]">
          Contribute
        </h1>
      </div>

      {/* Upload Form Component */}
      <ResourceUploadForm />
    </div>
  );
}
