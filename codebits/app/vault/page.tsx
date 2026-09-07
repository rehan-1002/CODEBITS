"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Database, ShieldCheck, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Resource, ResourceFilters, AcademicBranch, AcademicSemester, DocumentCategory } from "@/types/resources";
import { ResourceFiltersBar } from "@/components/resources/ResourceFilters";
import { ResourceGrid } from "@/components/resources/ResourceGrid";

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

  // Catalog source adhering to NO MOCK PRODUCTION DATA policy.
  // When real approved database records are empty, renders the authentic empty state.
  const [allResources] = useState<Resource[]>([]);

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
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span className="text-[var(--brand-primary)] font-semibold">ACADEMIC VAULT</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">REV-2019 'C' SCHEME REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Mumbai University Engineering Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl font-sans">
            Curated archive of previous-year question papers (PYQs), faculty course notes, and solutions across semesters 1–8.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors self-start md:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>SUBMIT A PAPER</span>
        </Link>
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

      {/* Academic Compliance Footer Banner */}
      <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[var(--text-muted)] font-mono gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
          <span>ALL PUBLIC CATALOG ENTRIES REQUIRE PRIOR FACULTY VERIFICATION</span>
        </div>
        <div>MUMBAI UNIVERSITY REV-2019 COMPLIANT</div>
      </div>
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
