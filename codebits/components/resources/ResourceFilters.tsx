"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";
import { AcademicBranch, AcademicSemester, DocumentCategory, ResourceFilters } from "@/types/resources";

interface ResourceFiltersBarProps {
  filters: ResourceFilters;
  onChange: (newFilters: ResourceFilters) => void;
  totalCount: number;
}

const BRANCHES: (AcademicBranch | "ALL")[] = [
  "ALL",
  "COMPS",
  "IT",
  "AI-DS",
  "EXTC",
  "MECH",
  "CIVIL",
];

const CATEGORIES: { id: DocumentCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Types" },
  { id: "pyq", label: "Question Papers (PYQ)" },
  { id: "notes", label: "Lecture Notes" },
  { id: "syllabus", label: "Syllabus" },
  { id: "solution", label: "Verified Solutions" },
];

export function ResourceFiltersBar({
  filters,
  onChange,
  totalCount,
}: ResourceFiltersBarProps) {
  const handleBranchChange = (branch: AcademicBranch | "ALL") => {
    onChange({ ...filters, branch });
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filters,
      semester: val === "ALL" ? "ALL" : (Number(val) as AcademicSemester),
    });
  };

  const handleCategoryChange = (category: DocumentCategory | "ALL") => {
    onChange({ ...filters, category });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const clearAllFilters = () => {
    onChange({
      branch: "ALL",
      semester: "ALL",
      category: "ALL",
      searchQuery: "",
    });
  };

  const hasActiveFilters =
    (filters.branch && filters.branch !== "ALL") ||
    (filters.semester && filters.semester !== "ALL") ||
    (filters.category && filters.category !== "ALL") ||
    Boolean(filters.searchQuery?.trim());

  return (
    <div className="space-y-4 p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)]">
      {/* Top Row: Search Input + Semester Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery || ""}
            onChange={handleSearchChange}
            placeholder="Search by subject, module, or title (e.g. Applied Mathematics, DBMS)..."
            className="w-full pl-9 pr-8 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Semester Select Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
            SEMESTER:
          </span>
          <select
            value={filters.semester || "ALL"}
            onChange={handleSemesterChange}
            className="px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
          >
            <option value="ALL">ALL SEMESTERS (1–8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                SEMESTER {s}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* Second Row: Branch Selection Pills */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-mono text-[11px] text-[var(--text-muted)] mr-2 shrink-0">
            BRANCH:
          </span>
          {BRANCHES.map((b) => {
            const isSelected = (filters.branch || "ALL") === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => handleBranchChange(b)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-black font-bold"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>

        {/* Total catalog count */}
        <div className="font-mono text-xs text-[var(--text-muted)] shrink-0 self-end sm:self-auto">
          {totalCount} APPROVED {totalCount === 1 ? "DOCUMENT" : "DOCUMENTS"}
        </div>
      </div>

      {/* Third Row: Category Selector Tabs */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
        <span className="font-mono text-[11px] text-[var(--text-muted)] mr-2 self-center">
          DOCUMENT CATEGORY:
        </span>
        {CATEGORIES.map((c) => {
          const isSelected = (filters.category || "ALL") === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryChange(c.id)}
              className={`px-3 py-1 rounded text-xs font-sans transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[var(--badge-bg)] text-[var(--brand-primary)] border border-[var(--badge-border)] font-semibold"
                  : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
