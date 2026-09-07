import React from "react";
import Link from "next/link";
import { FolderArchive, UploadCloud, RefreshCw } from "lucide-react";
import { Resource } from "@/types/resources";
import { ResourceCard } from "./ResourceCard";

interface ResourceGridProps {
  resources: Resource[];
  onResetFilters?: () => void;
}

export function ResourceGrid({ resources, onResetFilters }: ResourceGridProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
