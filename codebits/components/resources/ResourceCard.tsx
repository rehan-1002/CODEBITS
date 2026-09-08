"use client";

import React from "react";
import Link from "next/link";
import { FileText, Eye, ShieldCheck, User } from "lucide-react";
import { Resource } from "@/types/resources";

interface ResourceCardProps {
  resource: Resource;
  index?: number;
}

const BRANCH_GRADIENTS: Record<string, { from: string; to: string }> = {
  COMPS: { from: "#00e599", to: "#00b4d8" }, // Emerald to Electric Cyan
  IT: { from: "#03a9f4", to: "#ff0058" },    // Sky Blue to Rose Pink
  "AI-DS": { from: "#a855f7", to: "#ec4899" }, // Violet to Neon Magenta
  EXTC: { from: "#ffbc00", to: "#ff0058" },  // Amber to Crimson Red
  MECH: { from: "#f97316", to: "#ef4444" },  // Vibrant Orange to Flame
  CIVIL: { from: "#4dff03", to: "#00d0ff" }, // Lime Green to Cyan
};

const DEFAULT_GRADIENTS = [
  { from: "#00e599", to: "#00b4d8" },
  { from: "#ffbc00", to: "#ff0058" },
  { from: "#03a9f4", to: "#ff0058" },
  { from: "#4dff03", to: "#00d0ff" },
  { from: "#a855f7", to: "#ec4899" },
  { from: "#f97316", to: "#ef4444" },
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
    <div className="group relative w-full my-3 transition-all duration-500">
      {/* Skewed gradient panel 1 (crisp backdrop) */}
      <span
        className="absolute top-0 left-[35px] w-1/2 h-full rounded-xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[15px] group-hover:w-[calc(100%-40px)] opacity-75 dark:opacity-85"
        style={{
          background: `linear-gradient(315deg, ${gradient.from}, ${gradient.to})`,
        }}
      />

      {/* Skewed gradient panel 2 (diffuse luminous glow) */}
      <span
        className="absolute top-0 left-[35px] w-1/2 h-full rounded-xl transform skew-x-[15deg] blur-[26px] opacity-45 dark:opacity-70 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[15px] group-hover:w-[calc(100%-40px)] group-hover:opacity-65 dark:group-hover:opacity-90"
        style={{
          background: `linear-gradient(315deg, ${gradient.from}, ${gradient.to})`,
        }}
      />

      {/* Floating glassmorphic animated blobs on hover */}
      <span className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        <span className="absolute top-0 left-0 w-0 h-0 rounded-xl opacity-0 bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/15 backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.18)] transition-all duration-300 animate-blob group-hover:top-[-24px] group-hover:left-[24px] group-hover:w-[76px] group-hover:h-[76px] group-hover:opacity-100" />
        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-xl opacity-0 bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/15 backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.18)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-24px] group-hover:right-[24px] group-hover:w-[76px] group-hover:h-[76px] group-hover:opacity-100" />
      </span>

      {/* Main Glass Content Card - Theme Adaptive */}
      <div className="relative z-20 left-0 p-6 rounded-xl bg-white/90 dark:bg-[rgba(14,16,15,0.88)] backdrop-blur-[18px] border border-[var(--border-subtle)] dark:border-white/10 shadow-lg dark:shadow-2xl transition-all duration-500 group-hover:left-[-14px] flex flex-col justify-between space-y-4 min-h-[310px]">
        {/* Card Header & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-xs font-bold text-[var(--brand-primary)] bg-[var(--badge-bg)] border border-[var(--badge-border)] px-2.5 py-0.5 rounded-md shadow-xs">
                {resource.branch}
              </span>
              <span className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-md">
                SEM {resource.semester}
              </span>
            </div>

            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--surface-base)] px-2 py-0.5 rounded-md">
              {categoryLabels[resource.category] || resource.category.toUpperCase()}
            </span>
          </div>

          {/* Resource Title & Subject */}
          <div>
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
              <Eye className="w-3 h-3 text-[var(--text-muted)]" />
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
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-[var(--bg-base)] bg-[var(--text-primary)] dark:text-black dark:bg-white hover:bg-[var(--brand-primary)] hover:text-black dark:hover:bg-[var(--brand-primary)] hover:shadow-md transition-all duration-300 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-0.5" />
              <span>STUDY</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Animation Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translateY(8px); }
          50% { transform: translateY(-8px); }
        }
        .animate-blob {
          animation: blob 2s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: -1s;
        }
      `}</style>
    </div>
  );
}

export default ResourceCard;
