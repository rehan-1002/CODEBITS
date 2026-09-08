"use client";

import { X } from "lucide-react";
import { AcademicBranch, AcademicSemester, DocumentCategory, ResourceFilters } from "@/types/resources";
import { AnimatedFilterDropdown, FilterDropdownOption } from "@/components/ui/animated-filter-dropdown";
import { HoverButton } from "@/components/ui/hover-button";

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

const SEMESTER_OPTIONS: FilterDropdownOption[] = [
  { id: "ALL", label: "ALL SEMESTERS" },
  { id: 1, label: "SEMESTER 1" },
  { id: 2, label: "SEMESTER 2" },
  { id: 3, label: "SEMESTER 3" },
  { id: 4, label: "SEMESTER 4" },
  { id: 5, label: "SEMESTER 5" },
  { id: 6, label: "SEMESTER 6" },
  { id: 7, label: "SEMESTER 7" },
  { id: 8, label: "SEMESTER 8" },
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

  const handleCategoryChange = (category: DocumentCategory | "ALL") => {
    onChange({ ...filters, category });
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
      {/* Primary Filters: Branches & Semester */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Branch Selection Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="font-mono text-[11px] text-[var(--text-muted)] mr-1 shrink-0 font-medium">
            BRANCH:
          </span>
          {BRANCHES.map((b) => {
            const isSelected = (filters.branch || "ALL") === b;
            return (
              <HoverButton
                key={b}
                active={isSelected}
                onClick={() => handleBranchChange(b)}
                className="font-mono min-w-[52px] text-xs px-3 py-1.5"
              >
                {b}
              </HoverButton>
            );
          })}
        </div>

        {/* Right Controls: Semester Select + Reset Button */}
        <div className="flex items-center space-x-2.5 shrink-0 self-start lg:self-auto">
          <AnimatedFilterDropdown
            label="SEMESTER"
            selectedId={filters.semester || "ALL"}
            options={SEMESTER_OPTIONS}
            onSelect={(id) => {
              onChange({
                ...filters,
                semester: id === "ALL" ? "ALL" : (Number(id) as AcademicSemester),
              });
            }}
            searchPlaceholder="Search semester..."
            align="right"
          />

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <HoverButton
              onClick={clearAllFilters}
              icon={X}
              className="font-mono text-xs px-3 py-1.5 border-rose-500/40 text-rose-300 hover:border-rose-400 hover:bg-rose-500/20"
            >
              RESET
            </HoverButton>
          )}
        </div>
      </div>

      {/* Secondary Row: Category Selector Tabs & Catalog Count */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--text-muted)] mr-2 shrink-0 font-medium">
            CATEGORY:
          </span>
          {CATEGORIES.map((c) => {
            const isSelected = (filters.category || "ALL") === c.id;
            return (
              <HoverButton
                key={c.id}
                active={isSelected}
                onClick={() => handleCategoryChange(c.id)}
                className="font-sans text-xs px-3.5 py-1.5"
              >
                {c.label}
              </HoverButton>
            );
          })}
        </div>

        {/* Total catalog count */}
        <div className="font-mono text-xs text-[var(--text-muted)] shrink-0 self-end sm:self-auto">
          {totalCount} APPROVED {totalCount === 1 ? "DOCUMENT" : "DOCUMENTS"}
        </div>
      </div>
    </div>
  );
}
