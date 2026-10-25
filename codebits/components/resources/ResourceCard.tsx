"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Eye, ShieldCheck, User, ArrowUpRight, Sparkles } from "lucide-react";
import { Resource } from "@/types/resources";
import { SyllabusOverviewModal } from "@/components/resources/SyllabusOverviewModal";

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
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

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
    <div className="group relative w-full my-3 transition-transform duration-500 transform-gpu hover:-translate-y-1.5">
      {/* 
        ========================================================================
        KINETIC SKEWCARDS GLOW PANELS (Option 2)
        15° skewed multi-tier gradient panels that straighten into a full halo on hover
        ========================================================================
      */}
      {/* Skewed Panel 1: Crisp Glow */}
      <span
        className="absolute top-0 left-[20px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] blur-[16px] opacity-30 dark:opacity-50 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-75 pointer-events-none"
        style={{
          background: `linear-gradient(315deg, ${gradient.from}, ${gradient.to})`,
        }}
      />

      {/* Skewed Panel 2: Diffuse Ambient Glow */}
      <span
        className="absolute top-0 left-[35px] w-1/2 h-full rounded-2xl transform skew-x-[15deg] blur-[28px] opacity-25 dark:opacity-40 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-65 pointer-events-none"
        style={{
          background: `linear-gradient(315deg, ${gradient.from}, ${gradient.to})`,
        }}
      />

      {/* 
        ========================================================================
        FLOATING BLURRED GLASS BLOBS (Option 2)
        Emerge smoothly on hover with floating physics
        ========================================================================
      */}
      <span className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        <span className="absolute top-0 left-0 w-0 h-0 rounded-2xl opacity-0 bg-white/60 dark:bg-white/10 border border-black/5 dark:border-white/15 backdrop-blur-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all duration-300 animate-blob group-hover:top-[-16px] group-hover:left-[16px] group-hover:w-[56px] group-hover:h-[56px] group-hover:opacity-100" />
        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-2xl opacity-0 bg-white/60 dark:bg-white/10 border border-black/5 dark:border-white/15 backdrop-blur-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-16px] group-hover:right-[16px] group-hover:w-[56px] group-hover:h-[56px] group-hover:opacity-100" />
      </span>

      {/* 
        ========================================================================
        MAIN LIQUID GLASS HUD CHASSIS (Option 1)
        Transparent frosted glass, HUD corner ticks, and specular reflection sheen
        ========================================================================
      */}
      <div className="relative z-20 p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#0B120E]/85 backdrop-blur-2xl border border-black/10 dark:border-white/10 group-hover:border-[var(--brand-primary)]/70 transition-all duration-500 shadow-md group-hover:shadow-[0_14px_45px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between space-y-4 min-h-[300px] overflow-hidden">
        {/* Top Specular Glare Reflection */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/45 dark:from-white/12 via-white/5 to-transparent pointer-events-none rounded-t-2xl" />

        {/* HUD Corner Bracket Accents (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[var(--brand-primary)]/70 group-hover:border-[var(--brand-primary)] transition-colors duration-300 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[var(--brand-primary)]/70 group-hover:border-[var(--brand-primary)] transition-colors duration-300 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[var(--brand-primary)]/70 group-hover:border-[var(--brand-primary)] transition-colors duration-300 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[var(--brand-primary)]/70 group-hover:border-[var(--brand-primary)] transition-colors duration-300 pointer-events-none" />

        {/* Card Header & Academic Badges */}
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-xs font-bold text-[var(--brand-primary)] bg-[var(--badge-bg,#e6fcf1)] dark:bg-[#0f241a] border border-[var(--brand-primary)]/40 px-2.5 py-0.5 rounded-md shadow-xs">
                {resource.branch === "ALL" ? "ALL BRANCH" : resource.branch}
              </span>
              <span className="font-mono text-xs text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-0.5 rounded-md">
                SEM {resource.semester}
              </span>
            </div>

            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] px-2 py-0.5 rounded-md">
              {categoryLabels[resource.category] || resource.category.toUpperCase()}
            </span>
          </div>

          {/* Resource Title & Subject */}
          <div className="pt-1">
            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors duration-300 line-clamp-2 leading-snug">
              {resource.title}
            </h3>
            <p className="text-xs font-mono text-[var(--brand-primary)] mt-1.5 font-semibold tracking-wide">
              {resource.subject}
            </p>
          </div>
        </div>

        {/* Metadata Footer & Study Action */}
        <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3 text-xs relative z-10">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span className="truncate">
              {resource.page_count ? `${resource.page_count} pages` : "Official PDF"}
            </span>
            <span className="shrink-0 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{resource.view_count} views</span>
            </span>
          </div>

          {/* Uploader Provenance Attribution + Study Button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center space-x-1.5 text-[var(--text-secondary)] text-[11px]">
              {resource.uploader_role === "admin" ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              )}
              <span className="truncate max-w-[130px] font-medium">
                {resource.uploader_name}
              </span>
            </div>

            {/* Kinetic HUD Actions: Syllabus Overview or Solve with cbAI + Study Document */}
            <div className="flex items-center gap-1.5 shrink-0">
              {resource.category === "syllabus" ? (
                <button
                  type="button"
                  onClick={() => setShowSyllabusModal(true)}
                  title="View AI Syllabus Overview & Marks Distribution"
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/15 hover:bg-[var(--brand-primary)]/25 border border-[var(--brand-primary)]/45 hover:border-[var(--brand-primary)] shadow-xs hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[var(--brand-primary)] animate-pulse" />
                  <span>OVERVIEW</span>
                </button>
              ) : (
                <Link
                  href={`/solver?docId=${resource.id}&title=${encodeURIComponent(resource.title)}`}
                  title="Extract and solve questions with cbAI"
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/35 hover:border-[var(--brand-primary)]/70 shadow-xs hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
                  <span>cbAI</span>
                </Link>
              )}

              <Link
                href={`/viewer/${resource.id}`}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#05130D] bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient,#34EE99)] shadow-[0_0_16px_rgba(0,194,105,0.3)] hover:shadow-[0_0_24px_rgba(0,194,105,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>STUDY</span>
                <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Tabular Overview Modal */}
      {resource.category === "syllabus" && (
        <SyllabusOverviewModal
          isOpen={showSyllabusModal}
          onClose={() => setShowSyllabusModal(false)}
          documentTitle={resource.title}
          resourceId={resource.id}
        />
      )}

      {/* Floating Blob Physics Keyframes */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translateY(6px); }
          50% { transform: translateY(-6px); }
        }
        .animate-blob {
          animation: blob 2.4s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: -1.2s;
        }
      `}</style>
    </div>
  );
}

export default ResourceCard;
