import React from "react";
import Link from "next/link";
import { FileText, Eye, ShieldCheck, User } from "lucide-react";
import { Resource } from "@/types/resources";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const categoryLabels: Record<string, string> = {
    pyq: "QUESTION PAPER",
    notes: "LECTURE NOTES",
    syllabus: "OFFICIAL SYLLABUS",
    solution: "VERIFIED SOLUTION",
  };

  return (
    <div className="group rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] p-5 transition-all flex flex-col justify-between space-y-4">
      {/* Card Header & Badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-xs font-bold text-[var(--brand-primary)] bg-[var(--badge-bg)] border border-[var(--badge-border)] px-2 py-0.5 rounded">
              {resource.branch}
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
              SEM {resource.semester}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-subtle)] px-2 py-0.5 rounded">
            {categoryLabels[resource.category] || resource.category.toUpperCase()}
          </span>
        </div>

        {/* Resource Title & Subject */}
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-xs font-mono text-[var(--brand-primary)] mt-1">
            {resource.subject}
          </p>
        </div>
      </div>

      {/* Metadata & Scheme Footer */}
      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3 text-xs">
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span className="truncate">{resource.scheme}</span>
          <span className="shrink-0 flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{resource.view_count} views</span>
          </span>
        </div>

        {/* Uploader Provenance Attribution */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-[var(--text-secondary)] text-[11px]">
            {resource.uploader_role === "admin" ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            ) : (
              <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
            <span className="truncate max-w-[140px]">
              {resource.uploader_name}
            </span>
          </div>

          {/* Action Link */}
          <Link
            href={`/viewer/${resource.id}`}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            <span>STUDY</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
