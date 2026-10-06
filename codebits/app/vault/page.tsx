"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  Trash2,
  ExternalLink,
  FileText,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Resource, ResourceFilters, AcademicBranch, AcademicSemester, DocumentCategory } from "@/types/resources";
import { ResourceFiltersBar } from "@/components/resources/ResourceFilters";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { GooeyInput } from "@/components/ui/gooey-input";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";
import { getCurrentUser } from "@/lib/auth";

function VaultContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ResourceFilters>({
    branch: "ALL",
    semester: "ALL",
    category: "ALL",
    searchQuery: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalog" | "moderation">("catalog");
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Check user role
  useEffect(() => {
    const user = getCurrentUser();
    const adminCheck = user?.role === "admin";
    setIsAdmin(adminCheck);

    if (searchParams.get("tab") === "moderation" && adminCheck) {
      setActiveTab("moderation");
    }
  }, [searchParams]);

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

  // Fetch approved catalog
  const fetchApproved = () => {
    setLoading(true);
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.resources)) {
          setAllResources(data.resources);
        }
      })
      .catch((err) => {
        console.error("Error fetching resources:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch pending contributions for Admin
  const fetchPending = () => {
    fetch("/api/resources?status=pending")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.resources)) {
          setPendingResources(data.resources);
        }
      })
      .catch((err) => {
        console.error("Error fetching pending queue:", err);
      });
  };

  useEffect(() => {
    fetchApproved();
    if (isAdmin) {
      fetchPending();
    }
  }, [isAdmin]);

  // Admin Approve Handler
  const handleApprove = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingResources((prev) => prev.filter((r) => r.id !== id));
        fetchApproved();
        showNotice(`Approved & published: "${title}"`);
      }
    } catch {
      showNotice("Error approving resource. Please try again.");
    }
  };

  // Admin Reject Handler
  const handleReject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to reject and delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPendingResources((prev) => prev.filter((r) => r.id !== id));
        showNotice(`Removed: "${title}"`);
      }
    } catch {
      showNotice("Error deleting resource.");
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filter application for catalog
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
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0E1512] border border-[var(--brand-primary)] text-[var(--brand-primary)] text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>{actionNotice}</span>
        </div>
      )}

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

      {/* Admin View Switcher (Only visible to authenticated Admin/Faculty) */}
      {isAdmin && (
        <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-[var(--brand-primary)] text-black shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            📚 PUBLISHED CATALOG ({allResources.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("moderation");
              fetchPending();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "moderation"
                ? "bg-amber-400 text-black shadow-md"
                : "text-amber-400/80 hover:text-amber-300"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            FACULTY REVIEW QUEUE ({pendingResources.length})
          </button>
        </div>
      )}

      {activeTab === "moderation" ? (
        /* ========================================================= */
        /* FACULTY MODERATION QUEUE VIEW                              */
        /* ========================================================= */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase block">
              FACULTY DESK • PENDING CONTRIBUTIONS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Submissions Awaiting Verification
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Inspect uploaded student PDFs in the protected canvas viewer before approving them into the public vault.
            </p>
          </div>

          {pendingResources.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-3">
              <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Queue Clean</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                All submitted student question papers and reference notes have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-400/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 uppercase font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDING REVIEW
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {new Date(res.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] line-clamp-2">
                      {res.title}
                    </h3>

                    <div className="text-xs text-[var(--text-secondary)] space-y-1 font-sans">
                      <p>
                        <strong className="text-[var(--text-primary)]">Subject:</strong> {res.subject}
                      </p>
                      <p>
                        <strong className="text-[var(--text-primary)]">Branch & Semester:</strong> {res.branch} • Sem {res.semester} ({res.category.toUpperCase()})
                      </p>
                      <p className="text-[11px] font-mono text-[var(--brand-primary)]">
                        Submitted by: {res.uploader_name}
                      </p>
                    </div>
                  </div>

                  {/* Faculty Actions */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/viewer/${res.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PREVIEW PDF</span>
                      <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReject(res.id, res.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(res.id, res.title)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] text-black text-xs font-mono font-bold hover:bg-[var(--brand-dark,#00C269)] transition-all cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>APPROVE & PUBLISH</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* STANDARD PUBLIC CATALOG VIEW                              */
        /* ========================================================= */
        <>
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
        </>
      )}
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
