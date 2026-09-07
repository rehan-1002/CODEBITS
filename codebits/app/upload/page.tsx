import React from "react";
import { Metadata } from "next";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { ResourceUploadForm } from "@/components/upload/ResourceUploadForm";

export const metadata: Metadata = {
  title: "Community Upload | CodeBits Academic Vault",
  description:
    "Contribute verified Mumbai University engineering question papers, lecture notes, and solutions for faculty review and public vault indexing.",
};

export default function UploadPage() {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-[var(--border-subtle)]">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-mono">
          <UploadCloud className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span className="text-[var(--brand-primary)] font-semibold">COMMUNITY UPLOAD</span>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="text-[var(--text-secondary)]">ACADEMIC PROVENANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Contribute to the Mumbai University Vault
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl font-sans">
          Share high-quality engineering study materials with your peers. All student contributions are peer-moderated under faculty supervision before public publishing.
        </p>
      </div>

      {/* Upload Form Component */}
      <ResourceUploadForm />
    </div>
  );
}
