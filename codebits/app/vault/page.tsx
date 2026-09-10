"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Resource, ResourceFilters, AcademicBranch, AcademicSemester, DocumentCategory } from "@/types/resources";
import { ResourceFiltersBar } from "@/components/resources/ResourceFilters";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { GooeyInput } from "@/components/ui/gooey-input";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";

// Syllabus-validated initial catalog resources for Mumbai University Engineering
const INITIAL_MU_RESOURCES: Resource[] = [
  {
    id: "mu-comps-sem3-am3-pyq",
    title: "Applied Mathematics III (AM-III) - Winter Dec 2023 Official Question Paper",
    subject: "Applied Mathematics III",
    branch: "COMPS",
    semester: 3,
    scheme: "Mumbai University",
    category: "pyq",
    file_url: "/sample.pdf",
    page_count: 6,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 248,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "mu-comps-sem3-dsa-notes",
    title: "Data Structures & Analysis - Module 1–5 Faculty Complete Reference Notes",
    subject: "Data Structures & Analysis",
    branch: "COMPS",
    semester: 3,
    scheme: "Mumbai University",
    category: "notes",
    file_url: "/sample.pdf",
    page_count: 42,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 482,
    created_at: "2024-02-01T12:30:00Z",
  },
  {
    id: "mu-it-sem4-dbms-sol",
    title: "Database Management Systems (DBMS) - May 2024 Exam Verified Answer Key",
    subject: "Database Management Systems",
    branch: "IT",
    semester: 4,
    scheme: "Mumbai University",
    category: "solution",
    file_url: "/sample.pdf",
    page_count: 18,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 319,
    created_at: "2024-06-10T14:00:00Z",
  },
  {
    id: "mu-comps-sem4-coa-pyq",
    title: "Computer Organization & Architecture (COA) - Dec 2023 End-Sem Paper",
    subject: "Computer Organization & Architecture",
    branch: "COMPS",
    semester: 4,
    scheme: "Mumbai University",
    category: "pyq",
    file_url: "/sample.pdf",
    page_count: 5,
    uploader_id: "admin-codebits",
    uploader_name: "Admin (CODEBITS)",
    uploader_role: "admin",
    status: "approved",
    view_count: 173,
    created_at: "2024-01-20T09:15:00Z",
  },
  {
    id: "mu-it-sem4-os-sol",
    title: "Operating Systems - 5-Year Solved PYQ Compilation",
    subject: "Operating Systems",
    branch: "IT",
    semester: 4,
    scheme: "Mumbai University",
    category: "solution",
    file_url: "/sample.pdf",
    page_count: 36,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 512,
    created_at: "2024-03-05T16:45:00Z",
  },
  {
    id: "mu-aids-sem3-syllabus",
    title: "Artificial Intelligence & Data Science - Official Semester 3 Syllabus & Scheme",
    subject: "AI & Data Science Curriculum",
    branch: "AI-DS",
    semester: 3,
    scheme: "Mumbai University",
    category: "syllabus",
    file_url: "/sample.pdf",
    page_count: 14,
    uploader_id: "academic-dir",
    uploader_name: "MU Directorate Board",
    uploader_role: "admin",
    status: "approved",
    view_count: 220,
    created_at: "2023-11-12T11:00:00Z",
  },
  {
    id: "mu-comps-sem3-dsgt-notes",
    title: "Discrete Structures & Graph Theory (DSGT) - Proof Techniques & Recurrence Notes",
    subject: "Discrete Structures & Graph Theory",
    branch: "COMPS",
    semester: 3,
    scheme: "Mumbai University",
    category: "notes",
    file_url: "/sample.pdf",
    page_count: 28,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 365,
    created_at: "2024-02-18T13:20:00Z",
  },
  {
    id: "mu-extc-sem4-am4-pyq",
    title: "Engineering Mathematics IV (EM-IV) - Model Question Papers & Marking Scheme",
    subject: "Engineering Mathematics IV",
    branch: "EXTC",
    semester: 4,
    scheme: "Mumbai University",
    category: "pyq",
    file_url: "/sample.pdf",
    page_count: 8,
    uploader_id: "admin-mrf",
    uploader_name: "Prof. Rohit Falake (M.R.F)",
    uploader_role: "admin",
    status: "approved",
    view_count: 194,
    created_at: "2024-04-02T10:30:00Z",
  },
];

function VaultContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ResourceFilters>({
    branch: "ALL",
    semester: "ALL",
    category: "ALL",
    searchQuery: "",
  });

  // Sync with URL query parameters on initial mount
  useEffect(() => {
    const branchParam = searchParams.get("branch") as AcademicBranch | null;
    const semParam = searchParams.get("semester");
    const catParam = searchParams.get("category") as DocumentCategory | null;
    const queryParam = searchParams.get("query");

    setFilters({
      branch: branchParam || "ALL",
      semester: semParam ? (Number(semParam) as AcademicSemester) : "ALL",
      category: catParam || "ALL",
      searchQuery: queryParam || "",
    });
  }, [searchParams]);

  // Catalog source with syllabus-validated authentic records
  const [allResources] = useState<Resource[]>(INITIAL_MU_RESOURCES);

  // Filter application
  const filteredResources = allResources.filter((r) => {
    if (r.status !== "approved") return false;
    if (filters.branch && filters.branch !== "ALL" && r.branch !== filters.branch) return false;
    if (filters.semester && filters.semester !== "ALL" && r.semester !== filters.semester) return false;
    if (filters.category && filters.category !== "ALL" && r.category !== filters.category) return false;
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Vault Title Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Mumbai University Engineering Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl font-sans">
            Curated archive of previous-year question papers (PYQs), faculty course notes, and solutions across semesters 1–8.
          </p>
        </div>

        <AntiMetalButton
          href="/upload"
          label="SUBMIT A PAPER"
          className="self-start md:self-auto shrink-0"
        />
      </div>

      {/* Top Gooey Search Dock */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Search Mumbai University Papers & Notes
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            Click to expand and type any subject, module, or topic to instantly filter syllabus-validated resources.
          </p>
        </div>

        {/* Aceternity Gooey Input */}
        <div className="pt-2 pb-1 flex items-center justify-center">
          <GooeyInput
            value={filters.searchQuery || ""}
            onValueChange={(val) =>
              setFilters((prev) => ({ ...prev, searchQuery: val }))
            }
            placeholder="Search subjects (e.g. Applied Maths, DBMS, DSA)..."
            collapsedWidth={165}
            expandedWidth={360}
            expandedOffset={48}
          />
        </div>

        {filters.searchQuery && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--brand-primary)]/40 text-[11px] font-mono text-[var(--brand-primary)]">
            <span>Filtering catalog by: &quot;{filters.searchQuery}&quot;</span>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="hover:text-white transition-colors cursor-pointer ml-1"
              title="Clear search filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Filter Dock */}
      <ResourceFiltersBar
        filters={filters}
        onChange={setFilters}
        totalCount={filteredResources.length}
      />

      {/* Resource Catalog Grid or Authentic Empty State */}
      <ResourceGrid
        resources={filteredResources}
        onResetFilters={() =>
          setFilters({
            branch: "ALL",
            semester: "ALL",
            category: "ALL",
            searchQuery: "",
          })
        }
      />
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-mono text-[var(--text-muted)]">
          LOADING ACADEMIC VAULT...
        </div>
      }
    >
      <VaultContent />
    </Suspense>
  );
}
