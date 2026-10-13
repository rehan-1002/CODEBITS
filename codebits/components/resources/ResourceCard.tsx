"use client";

import React from "react";
import Link from "next/link";
import { FileText, Eye, ShieldCheck, User } from "lucide-react";
import { Resource } from "@/types/resources";

interface ResourceCardProps {
  resource: Resource;
  index?: number;
}

const BRANCH_GRADIENTS: Record<string, { from: string; to: string; border: string }> = {
  ALL: { from: "#00e599", to: "#38bdf8", border: "rgba(0, 229, 153, 0.35)" },
  COMPS: { from: "#00e599", to: "#00b4d8", border: "rgba(0, 180, 216, 0.35)" },
  IT: { from: "#03a9f4", to: "#ff0058", border: "rgba(3, 169, 244, 0.35)" },
  "AI-DS": { from: "#a855f7", to: "#ec4899", border: "rgba(168, 85, 247, 0.35)" },
  EXTC: { from: "#ffbc00", to: "#ff0058", border: "rgba(255, 188, 0, 0.35)" },
  MECH: { from: "#f97316", to: "#ef4444", border: "rgba(249, 115, 22, 0.35)" },
  CIVIL: { from: "#4dff03", to: "#00d0ff", border: "rgba(77, 255, 3, 0.35)" },
};

const DEFAULT_GRADIENTS = [
  { from: "#00e599", to: "#00b4d8", border: "rgba(0, 180, 216, 0.35)" },
  { from: "#ffbc00", to: "#ff0058", border: "rgba(255, 188, 0, 0.35)" },
  { from: "#03a9f4", to: "#ff0058", border: "rgba(3, 169, 244, 0.35)" },
  { from: "#4dff03", to: "#00d0ff", border: "rgba(77, 255, 3, 0.35)" },
  { from: "#a855f7", to: "#ec4899", border: "rgba(168, 85, 247, 0.35)" },
  { from: "#f97316", to: "#ef4444", border: "rgba(249, 115, 22, 0.35)" },
];

export function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const categoryLabels: Record<string, string> = {
    pyq: "QUESTION PAPER",
    notes: "LECTURE NOTES",
    syllabus: "OFFICIAL SYLLABUS",
    solution: "VERIFIED SOLUTION",
  };

  const gradient =
    BRANCH_GRADIENTS[resource.branch] ||
    DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];

  return (
    <div className="group relative w-full my-2 transition-transform duration-300 transform-gpu hover:-translate-y-1">
      {/* Ambient glow on hover - hardware accelerated, zero layout thrashing */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm"
        style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
        }}
      />

      {/* Main Content Card */}
      <div className="relative z-10 p-5 sm:p-6 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] group-hover:border-[var(--border-strong)] transition-colors duration-300 shadow-md flex flex-col justify-between space-y-4 min-h-[290px]">
        {/* Card Header & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-xs font-bold text-[var(--brand-primary)] bg-[var(--badge-bg)] border border-[var(--badge-border)] px-2.5 py-0.5 rounded-md shadow-xs">
                {resource.branch === "ALL" ? "ALL BRANCH" : resource.branch}
              </span>
              <span className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-md">
                SEM {resource.semester}
              </span>
            </div>

            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-md">
              {categoryLabels[resource.category] || resource.category.toUpperCase()}
            </span>
          </div>

          {/* Resource Title & Subject */}
          <div className="pt-1">
            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-xs font-mono text-[var(--brand-primary)] mt-1 font-medium">
              {resource.subject}
            </p>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span className="truncate">
              {resource.page_count ? `${resource.page_count} pages` : "Official PDF"}
            </span>
            <span className="shrink-0 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{resource.view_count} views</span>
            </span>
          </div>

          {/* Uploader Provenance Attribution + Study Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center space-x-1.5 text-[var(--text-secondary)] text-[11px]">
              {resource.uploader_role === "admin" ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              )}
              <span className="truncate max-w-[130px]">
                {resource.uploader_name}
              </span>
            </div>

            {/* Read / Study Action Link */}
            <Link
              href={`/viewer/${resource.id}`}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient)] transition-colors duration-200 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 mr-0.5" />
              <span>STUDY</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceCard;
