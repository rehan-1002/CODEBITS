"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderArchive, UploadCloud, RefreshCw, ChevronDown } from "lucide-react";
import { Resource } from "@/types/resources";
import { ResourceCard } from "./ResourceCard";

interface ResourceGridProps {
  resources: Resource[];
  onResetFilters?: () => void;
}

const PAGE_SIZE = 36;

export function ResourceGrid({ resources, onResetFilters }: ResourceGridProps) {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Reset pagination window when filtered results change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [resources.length]);

  if (resources.length === 0) {
    return (
      <div className="py-16 md:py-24 px-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--brand-primary)]">
          <FolderArchive className="w-6 h-6" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
            ZERO MATCHING RECORDS
          </span>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            No Approved Resources Match These Filters
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
            Adjust the semester, branch, or category filters above, or be the first student to submit an authentic question paper or solution for moderation.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>CONTRIBUTE THIS RESOURCE</span>
          </Link>

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>CLEAR ALL FILTERS</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const displayedResources = resources.slice(0, visibleCount);
  const hasMore = visibleCount < resources.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2 px-2">
        {displayedResources.map((resource, index) => (
          <ResourceCard key={resource.id} resource={resource} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-3 border-t border-[var(--border-subtle)]">
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Showing {displayedResources.length} of {resources.length} approved academic papers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 48, resources.length))}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--brand-primary)]/50 bg-[var(--surface-elevated)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-black font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              <span>LOAD MORE PAPERS (+48)</span>
            </button>
            {resources.length - visibleCount > 48 && (
              <button
                type="button"
                onClick={() => setVisibleCount(resources.length)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                SHOW ALL ({resources.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
