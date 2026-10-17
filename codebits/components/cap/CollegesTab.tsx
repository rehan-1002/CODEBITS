"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  MapPin,
  GraduationCap,
  Award,
  Wallet,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { COLLEGES, College } from "@/data/cap_data";

const REGIONS = [
  { id: "all", label: "All Regions" },
  { id: "mumbai", label: "Mumbai & Suburbs" },
  { id: "pune", label: "Pune & PCMC" },
  { id: "nagpur", label: "Nagpur" },
  { id: "nashik", label: "Nashik" },
  { id: "aurangabad", label: "Chhatrapati Sambhajinagar" },
  { id: "amravati", label: "Amravati" },
];

export function CollegesTab() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostelOnly, setHostelOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter((col) => {
      if (regionFilter !== "all") {
        const cr = (col.r || "").toLowerCase();
        const ci = (col.ci || "").toLowerCase();
        const rLower = regionFilter.toLowerCase();
        if (!cr.includes(rLower) && !ci.includes(rLower)) return false;
      }

      if (statusFilter === "autonomous" && col.a !== 1) return false;
      if (statusFilter === "govt" && col.st !== "govt") return false;
      if (statusFilter === "unaided" && col.st === "govt") return false;

      if (hostelOnly && col.h !== 1) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchName = col.n.toLowerCase().includes(q);
        const matchCode = col.c.includes(q);
        const matchCity = (col.ci || '').toLowerCase().includes(q);
        const matchUniv = (col.u || '').toLowerCase().includes(q);
        const matchBranch = col.br.some((b) => b.n.toLowerCase().includes(q));
        if (!matchName && !matchCode && !matchCity && !matchUniv && !matchBranch) {
          return false;
        }
      }

      return true;
    });
  }, [search, regionFilter, statusFilter, hostelOnly]);

  const displayedColleges = useMemo(() => {
    return filteredColleges.slice(0, visibleCount);
  }, [filteredColleges, visibleCount]);

  const toggleExpand = (code: string) => {
    setExpandedId((prev) => (prev === code ? null : code));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search and Filters Header */}
      <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Colleges Directory
          </h2>

          <span className="text-xs font-mono text-[var(--brand-primary)] px-3 py-1 rounded-md bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 self-start sm:self-auto">
            {filteredColleges.length} Institutes
          </span>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search college, code, or city..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          {/* Region */}
          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors appearance-none cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-[var(--surface-base)] text-[var(--text-primary)]">
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--surface-base)]">All Governance Types</option>
              <option value="autonomous" className="bg-[var(--surface-base)]">Autonomous Only</option>
              <option value="govt" className="bg-[var(--surface-base)]">Government Colleges</option>
              <option value="unaided" className="bg-[var(--surface-base)]">Private Unaided</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Hostel Toggle */}
          <button
            type="button"
            onClick={() => setHostelOnly(!hostelOnly)}
            className={`px-3.5 py-2.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
              hostelOnly
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold"
                : "border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{hostelOnly ? "Hostel Verified Only" : "Hostel: Any"}</span>
          </button>
        </div>
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {displayedColleges.map((col) => {
          const isExpanded = expandedId === col.c;

          return (
            <div
              key={col.c}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 transition-all hover:border-[var(--brand-primary)]/40"
            >
              {/* Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[var(--brand-primary)] px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30">
                    CODE {col.c}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {col.ci}, {col.d || col.r}
                  </span>
                  {col.a === 1 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      Autonomous
                    </span>
                  )}
                  {col.st === "govt" && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Government
                    </span>
                  )}
                  {col.na && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                      NAAC {col.na}
                    </span>
                  )}
                  {col.h === 1 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-emerald-400">
                      Hostel On-Campus
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                  {col.f ? `₹${col.f.toLocaleString("en-IN")}/yr (FRA)` : "Govt Prescribed Fee"}
                </span>
              </div>

              {/* Title & Affiliation */}
              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  {col.n}
                </h3>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                  Affiliation: {col.u}
                </p>
              </div>

              {/* Quick Details Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono">
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Total Intake</span>
                  <span className="text-[var(--text-primary)] font-semibold">{col.i || "Approved Intake"}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Avg Placements</span>
                  <span className="text-[var(--brand-primary)] font-semibold">{col.p || "State Norms"}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Offered Branches</span>
                  <span className="text-[var(--text-primary)] font-semibold">{col.br.length} Courses</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase">Minority Status</span>
                  <span className="text-[var(--text-secondary)] font-semibold">{col.mi ? col.mi.toUpperCase() : "Non-Minority"}</span>
                </div>
              </div>

              {/* Branch Expander Toggle */}
              <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpand(col.c)}
                  className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--brand-primary)] hover:underline"
                >
                  <span>{isExpanded ? "Hide Cutoff Matrix" : `Inspect ${col.br.length} Branch Cutoffs`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  CAP Round 1 &amp; Round 4 Data
                </span>
              </div>

              {/* Expanded Cutoffs Table */}
              {isExpanded && (
                <div className="mt-4 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase">
                        <th className="py-2 pr-4 font-semibold">Course / Branch Name</th>
                        <th className="py-2 px-3 font-semibold">R1 Open (%tile)</th>
                        <th className="py-2 px-3 font-semibold">R1 OBC (%tile)</th>
                        <th className="py-2 px-3 font-semibold">R4 Open (%tile)</th>
                        <th className="py-2 pl-3 font-semibold">TFWS Cutoff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {col.br.map((br, bIdx) => (
                        <tr key={bIdx} className="hover:bg-[var(--bg-base)]/50 transition-colors">
                          <td className="py-2.5 pr-4 text-[var(--text-primary)] font-semibold">
                            {br.n}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {br["1g"] ? `${br["1g"]}%` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {br["1b"] ? `${br["1b"]}%` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--brand-primary)] font-bold">
                            {br["4g"] ? `${br["4g"]}%` : br["1g"] ? `${br["1g"]}%` : "—"}
                          </td>
                          <td className="py-2.5 pl-3 text-amber-400">
                            {br["1tf"] ? `${br["1tf"]}%` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Pagination */}
      {visibleCount < filteredColleges.length && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 25)}
            className="px-6 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] text-xs font-mono font-semibold hover:border-[var(--brand-primary)] transition-all"
          >
            Load Next 25 Institutes ({visibleCount} of {filteredColleges.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default CollegesTab;
