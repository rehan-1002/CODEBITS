"use client";

import React from "react";
import { Sparkles, Layers, CheckCircle2 } from "lucide-react";

export function QuestionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60 flex flex-col gap-2 relative overflow-hidden"
        >
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          {/* Header pill & mark tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-14 rounded-md bg-[var(--brand-primary)]/15" />
              <div className="h-3 w-20 rounded bg-[var(--border-strong)]/50" />
            </div>
            <div className="h-4 w-8 rounded-full bg-[var(--border-subtle)]" />
          </div>

          {/* Question text lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-[var(--border-strong)]/60" />
            <div className="h-3.5 w-11/12 rounded bg-[var(--border-strong)]/40" />
            <div className="h-3.5 w-2/3 rounded bg-[var(--border-strong)]/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SolutionTerminalSkeleton({ marks = 5 }: { marks?: number }) {
  return (
    <div className="flex flex-col gap-5 w-full animate-pulse relative">
      {/* Status banner */}
      <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-[var(--brand-primary)] animate-spin" />
          <span className="text-xs font-mono font-bold text-[var(--brand-primary)] tracking-wide">
            FORMULATING {marks}-MARK CODEBITS AI SOLUTION...
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Verifying Anti-Hallucination</span>
      </div>

      {/* Shimmer Section 1: Definition Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60 space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[var(--brand-primary)]/20" />
          <div className="h-4 w-48 rounded bg-[var(--brand-primary)]/25" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-full rounded bg-[var(--border-strong)]/70" />
          <div className="h-3.5 w-11/12 rounded bg-[var(--border-strong)]/50" />
          <div className="h-3.5 w-4/5 rounded bg-[var(--border-strong)]/40" />
        </div>
      </div>

      {/* Shimmer Section 2: Mathematical / Conditions Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60 space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20" />
          <div className="h-4 w-56 rounded bg-emerald-500/25" />
        </div>
        
        {/* Math Block Shimmer */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2">
          <div className="h-4 w-3/4 mx-auto rounded bg-[var(--border-strong)]/60" />
          <div className="h-3.5 w-1/2 mx-auto rounded bg-[var(--border-strong)]/40" />
        </div>

        {/* Numbered Steps Shimmer */}
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/20 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-5/6 rounded bg-[var(--border-strong)]/60" />
                <div className="h-3 w-2/3 rounded bg-[var(--border-strong)]/30" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer Section 3: Examiner Takeaways Card */}
      <div className="p-4 rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 space-y-2.5 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] opacity-50" />
          <div className="h-3.5 w-44 rounded bg-[var(--brand-primary)]/30" />
        </div>
        <div className="space-y-1.5 pl-6">
          <div className="h-3 w-5/6 rounded bg-[var(--border-strong)]/40" />
          <div className="h-3 w-3/4 rounded bg-[var(--border-strong)]/30" />
        </div>
      </div>
    </div>
  );
}
