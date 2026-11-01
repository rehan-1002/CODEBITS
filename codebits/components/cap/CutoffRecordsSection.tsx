"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  MapPin,
  GraduationCap,
  Sparkles,
  TrendingDown,
  ArrowUpDown,
  Table2,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  Award,
} from "lucide-react";
import { COLLEGES, College, BranchCutoff } from "@/data/cap_data";
import {
  CUTOFF_CATEGORIES,
  extractCutoffsForBranch,
  generatePreparationInsight,
  CutoffRowData,
} from "@/lib/cap/cutoff-records";

const REGIONS = [
  { id: "all", label: "All Maharashtra" },
  { id: "mumbai", label: "Mumbai & MMR" },
  { id: "pune", label: "Pune & PCMC" },
  { id: "nagpur", label: "Nagpur" },
  { id: "nashik", label: "Nashik" },
  { id: "aurangabad", label: "Chh. Sambhajinagar" },
  { id: "amravati", label: "Amravati" },
];

const BRANCH_CATEGORIES = [
  { id: "all", label: "All Branches" },
  { id: "tech", label: "Computer / IT / AI / DS", filter: ["computer", "information technology", "artificial intelligence", "data science", "cyber"] },
  { id: "electronics", label: "ENTC & Electronics", filter: ["electronics", "telecommunication", "electrical and electronics"] },
  { id: "core", label: "Core (Mech, Civil, Elec)", filter: ["mechanical", "civil", "electrical"] },
  { id: "chemical", label: "Chemical & Allied", filter: ["chemical", "biotechnology", "textile", "petroleum"] },
];

const POPULAR_COLLEGES = [
  { code: "03012", label: "VJTI Mumbai" },
  { code: "06006", label: "COEP Tech Pune" },
  { code: "06271", label: "PICT Pune" },
  { code: "03014", label: "SPIT Mumbai" },
  { code: "06274", label: "Pune Vidyarthi Griha" },
  { code: "06175", label: "PCCOE Pune" },
  { code: "06156", label: "MMCOE Pune" },
  { code: "06177", label: "Sinhgad COE" },
];

interface CutoffRecordsSectionProps {
  initialCollegeCode?: string;
  initialCategory?: string;
  initialScore?: string;
}

export function CutoffRecordsSection({
  initialCollegeCode,
  initialCategory = "OPEN",
  initialScore = "92.50",
}: CutoffRecordsSectionProps) {
  // Search & Filters
  const [collegeSearch, setCollegeSearch] = useState<string>("");
  const [selectedCollegeCode, setSelectedCollegeCode] = useState<string>(
    initialCollegeCode || "03012"
  );
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [quotaFilter, setQuotaFilter] = useState<"all" | "general" | "ladies">("all");
  const [roundFilter, setRoundFilter] = useState<number | "all">("all");

  // Benchmark score
  const [benchmarkScoreInput, setBenchmarkScoreInput] = useState<string>(initialScore);

  // Expanded branch cards
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  const userScore = parseFloat(benchmarkScoreInput) || 0;

  // Filtered colleges list based on search/region/status
  const matchingColleges = useMemo(() => {
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

      if (collegeSearch) {
        const q = collegeSearch.toLowerCase();
        const matchName = col.n.toLowerCase().includes(q);
        const matchCode = col.c.includes(q);
        const matchCity = (col.ci || "").toLowerCase().includes(q);
        const matchUniv = (col.u || "").toLowerCase().includes(q);
        const matchBranch = col.br.some((b) => b.n.toLowerCase().includes(q));
        if (!matchName && !matchCode && !matchCity && !matchUniv && !matchBranch) {
          return false;
        }
      }

      return true;
    });
  }, [collegeSearch, regionFilter, statusFilter]);

  // Active college
  const currentCollege = useMemo(() => {
    const found = COLLEGES.find((c) => c.c === selectedCollegeCode);
    if (found) return found;
    return matchingColleges[0] || COLLEGES[0];
  }, [selectedCollegeCode, matchingColleges]);

  // Keep selectedCollegeCode synced if list changes
  useEffect(() => {
    if (initialCollegeCode && COLLEGES.some((c) => c.c === initialCollegeCode)) {
      setSelectedCollegeCode(initialCollegeCode);
    }
  }, [initialCollegeCode]);

  // Filtered branches inside the active college
  const filteredBranches = useMemo(() => {
    if (!currentCollege) return [];
    return currentCollege.br.filter((br) => {
      if (branchFilter === "all") return true;
      const bCat = BRANCH_CATEGORIES.find((bc) => bc.id === branchFilter);
      if (!bCat || !bCat.filter) return true;
      const brLower = br.n.toLowerCase();
      return bCat.filter.some((k) => brLower.includes(k));
    });
  }, [currentCollege, branchFilter]);

  const toggleBranchExpand = (branchName: string) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [branchName]: !prev[branchName],
    }));
  };

  const handleResetFilters = () => {
    setCollegeSearch("");
    setRegionFilter("all");
    setStatusFilter("all");
    setBranchFilter("all");
    setCategoryFilter("all");
    setQuotaFilter("all");
    setRoundFilter("all");
    setBenchmarkScoreInput("92.50");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner & Introduction */}
      <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                DTE &amp; State CET Cell Official Archive
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-1">
              College Cutoff Records &amp; Round Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Inspect comprehensive round-wise (CAP 1 to 4) and category-wise cutoffs for all 372 engineering institutes. Benchmark your percentile and plan your option preferences strategically.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-mono hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* STEP 1: College Selection & Search Bar */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Select College or Search by Name / Code</span>
            </label>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {matchingColleges.length} Institutes Found
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Live Search Input */}
            <div className="relative lg:col-span-5">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                placeholder="Search college name, code (e.g. 03012), or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
              />
            </div>

            {/* Quick College Select Dropdown */}
            <div className="relative lg:col-span-7">
              <select
                value={currentCollege?.c || ""}
                onChange={(e) => setSelectedCollegeCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors appearance-none cursor-pointer pr-10"
              >
                {matchingColleges.map((col) => (
                  <option key={col.c} value={col.c} className="bg-[var(--surface-base)] text-[var(--text-primary)]">
                    [{col.c}] {col.n} ({col.ci || col.r})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Popular Colleges Fast Selector */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">
              Popular Picks:
            </span>
            {POPULAR_COLLEGES.map((pop) => {
              const isSelected = currentCollege?.c === pop.code;
              return (
                <button
                  key={pop.code}
                  type="button"
                  onClick={() => setSelectedCollegeCode(pop.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {pop.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Filters Grid (Category, Quota, Round, Branch, & Benchmark Score) */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5 mb-3">
            <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Configure Cutoff Filters &amp; Benchmarks</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Category Filter
              </span>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:border-[var(--brand-primary)] transition-colors appearance-none cursor-pointer pr-8"
                >
                  <option value="all" className="bg-[var(--surface-base)]">All Categories (Full Matrix)</option>
                  {CUTOFF_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--surface-base)]">
                      {c.label} ({c.id})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Quota Type */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Quota Type
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "all", label: "Both" },
                  { id: "general", label: "General" },
                  { id: "ladies", label: "30% Ladies" },
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuotaFilter(q.id as "all" | "general" | "ladies")}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      quotaFilter === q.id
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Round Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Round Filter
              </span>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: 1, label: "R1" },
                  { id: 2, label: "R2" },
                  { id: 3, label: "R3" },
                  { id: 4, label: "R4" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoundFilter(r.id as number | "all")}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      roundFilter === r.id
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* My Score Benchmark */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  My Percentile Target
                </span>
                <span className="text-[10px] font-mono text-[var(--brand-primary)]">
                  Active Benchmark
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={benchmarkScoreInput}
                  onChange={(e) => setBenchmarkScoreInput(e.target.value)}
                  placeholder="e.g. 92.50"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-xs font-bold focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-semibold text-[var(--text-muted)]">
                  %tile
                </span>
              </div>
            </div>
          </div>

          {/* Branch Discipline Pills */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">
              Discipline:
            </span>
            {BRANCH_CATEGORIES.map((bc) => {
              const isSel = branchFilter === bc.id;
              return (
                <button
                  key={bc.id}
                  type="button"
                  onClick={() => setBranchFilter(bc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isSel
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {bc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected College Overview Header Card */}
      {currentCollege && (
        <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[var(--brand-primary)] px-2.5 py-0.5 rounded-md bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30">
                  CODE {currentCollege.c}
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  {currentCollege.ci}, {currentCollege.d || currentCollege.r}
                </span>
                {currentCollege.a === 1 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    Autonomous
                  </span>
                )}
                {currentCollege.st === "govt" && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Government
                  </span>
                )}
                {currentCollege.na && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                    NAAC {currentCollege.na}
                  </span>
                )}
                {currentCollege.h === 1 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Hostel Available
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1">
                {currentCollege.n}
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Affiliated to: {currentCollege.u}
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-1 shrink-0 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                Approved Annual Fee (FRA)
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-[var(--brand-primary)]">
                {currentCollege.f ? `₹${currentCollege.f.toLocaleString("en-IN")}/yr` : "Govt Regulated Fee"}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {currentCollege.br.length} Approved Engineering Disciplines
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">Approved Intake</span>
              <span className="text-[var(--text-primary)] font-bold text-sm">{currentCollege.i || "DTE Norms"} Seats</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">Average Placements</span>
              <span className="text-[var(--brand-primary)] font-bold text-sm">{currentCollege.p || "State Standards"}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">Minority Quota</span>
              <span className="text-[var(--text-secondary)] font-bold text-sm">
                {currentCollege.mi ? currentCollege.mi.toUpperCase() : "Non-Minority"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block">Matching Branches</span>
              <span className="text-[var(--text-primary)] font-bold text-sm">{filteredBranches.length} Courses</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Cutoff Matrix Display for Each Branch */}
      {filteredBranches.length === 0 ? (
        <div className="w-full py-16 px-4 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col items-center justify-center text-center">
          <Compass className="w-10 h-10 text-[var(--text-muted)] mb-3 animate-spin" />
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            No Branches Matched Current Filters
          </h4>
          <p className="text-xs font-mono text-[var(--text-secondary)] max-w-md mt-1">
            Try switching the branch discipline filter to &quot;All Branches&quot; or clearing your search term.
          </p>
          <button
            type="button"
            onClick={() => setBranchFilter("all")}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-black font-semibold text-xs font-mono hover:opacity-90 transition-opacity cursor-pointer"
          >
            Show All Branches in this College
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredBranches.map((branch, bIdx) => {
            const isExpanded = expandedBranches[branch.n] ?? true;
            const cutoffRows = extractCutoffsForBranch(branch, categoryFilter, quotaFilter);
            const prepInsight = generatePreparationInsight(
              currentCollege,
              branch,
              categoryFilter === "all" ? "OPEN" : categoryFilter,
              quotaFilter === "ladies",
              userScore
            );

            return (
              <div
                key={`${branch.n}_${bIdx}`}
                className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] overflow-hidden shadow-sm transition-all hover:border-[var(--brand-primary)]/40"
              >
                {/* Branch Header Strip */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[var(--brand-primary)] px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30">
                        COURSE #{bIdx + 1}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {cutoffRows.length} Category Cutoff Records
                      </span>
                    </div>
                    <h4 className="text-base sm:text-xl font-black text-[var(--text-primary)] tracking-tight mt-1">
                      {branch.n}
                    </h4>
                  </div>

                  {/* Quick Glance Key Percentiles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {branch["1g"] && (
                      <div className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono">
                        <span className="text-[var(--text-muted)] mr-1">R1 Open:</span>
                        <span className="font-bold text-[var(--text-primary)]">{branch["1g"]}%</span>
                      </div>
                    )}
                    {branch["4g"] && (
                      <div className="px-2.5 py-1 rounded-lg border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 text-xs font-mono">
                        <span className="text-[var(--brand-primary)] mr-1">R4 Open:</span>
                        <span className="font-bold text-[var(--brand-primary)]">{branch["4g"]}%</span>
                      </div>
                    )}
                    {branch["1tf"] && (
                      <div className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-400">
                        <span className="text-amber-400 mr-1">TFWS:</span>
                        <span className="font-bold">{branch["1tf"]}%</span>
                      </div>
                    )}
                    {branch["a1"] && (
                      <div className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-400">
                        <span className="text-blue-400 mr-1">JEE All India:</span>
                        <span className="font-bold">{branch["a1"]}%</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleBranchExpand(branch.n)}
                      className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer ml-auto lg:ml-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 flex flex-col gap-6">
                    {/* "Prepare Accordingly" Strategic Action Card */}
                    <div className="w-full rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase text-[var(--brand-primary)]">
                              Preparation &amp; Option Form Recommendation
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                              {prepInsight.optionFormRankGuide}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium mt-1">
                            {prepInsight.prepActionItem}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[var(--text-secondary)] flex-wrap">
                            {prepInsight.expectedDrop !== null && (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <TrendingDown className="w-3.5 h-3.5" />
                                R1 to R4 Relaxation: -{prepInsight.expectedDrop.toFixed(2)}% drop
                              </span>
                            )}
                            <span>·</span>
                            <span>Est. Net Fee: ₹{prepInsight.feeEstimated.toLocaleString("en-IN")}/yr ({prepInsight.feeNote})</span>
                            {prepInsight.categoryAdvantagePercent !== null && (
                              <>
                                <span>·</span>
                                <span className="text-amber-400 font-semibold">{prepInsight.categoryAdvantageNote}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {userScore > 0 && prepInsight.r4Target && (
                        <div className="flex flex-col items-start md:items-end shrink-0 pl-3 md:pl-0 border-l md:border-l-0 border-[var(--border-subtle)]">
                          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                            Margin vs Final Cutoff
                          </span>
                          <span
                            className={`text-base font-mono font-bold ${
                              userScore >= prepInsight.r4Target ? "text-[var(--brand-primary)]" : "text-amber-400"
                            }`}
                          >
                            {userScore >= prepInsight.r4Target
                              ? `+${(userScore - prepInsight.r4Target).toFixed(2)}% (Safe)`
                              : `${(userScore - prepInsight.r4Target).toFixed(2)}% (Target)`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category-wise & Round-wise Cutoff Records Table */}
                    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] uppercase">
                            <th className="py-3 px-4 font-semibold">Category &amp; Quota</th>
                            {(roundFilter === "all" || roundFilter === 1) && (
                              <th className="py-3 px-3 font-semibold text-center">Round 1 (%tile)</th>
                            )}
                            {(roundFilter === "all" || roundFilter === 2) && (
                              <th className="py-3 px-3 font-semibold text-center">Round 2 (%tile)</th>
                            )}
                            {(roundFilter === "all" || roundFilter === 3) && (
                              <th className="py-3 px-3 font-semibold text-center">Round 3 (%tile)</th>
                            )}
                            {(roundFilter === "all" || roundFilter === 4) && (
                              <th className="py-3 px-3 font-semibold text-center">Round 4 Final (%tile)</th>
                            )}
                            <th className="py-3 px-3 font-semibold text-center">Round Drop</th>
                            {userScore > 0 && (
                              <th className="py-3 px-4 font-semibold text-right">Target Score Status</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {cutoffRows.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-xs text-[var(--text-muted)]">
                                No specific category data recorded for this filter combination.
                              </td>
                            </tr>
                          ) : (
                            cutoffRows.map((row, rIdx) => {
                              const benchmarkTarget = row.effectiveCutoff || row.round4 || row.round1;
                              const scoreDiff = benchmarkTarget !== null && userScore > 0 ? userScore - benchmarkTarget : null;

                              let statusLabel = "";
                              let statusBadgeClass = "";
                              if (scoreDiff !== null) {
                                if (scoreDiff >= 2.0) {
                                  statusLabel = `Safe (+${scoreDiff.toFixed(2)}%)`;
                                  statusBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                                } else if (scoreDiff >= 0.0) {
                                  statusLabel = `Target (+${scoreDiff.toFixed(2)}%)`;
                                  statusBadgeClass = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                                } else if (scoreDiff >= -3.0) {
                                  statusLabel = `Ambitious (${scoreDiff.toFixed(2)}%)`;
                                  statusBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                                } else {
                                  statusLabel = `Reach (${scoreDiff.toFixed(2)}%)`;
                                  statusBadgeClass = "bg-purple-500/10 text-purple-400 border-purple-500/30";
                                }
                              }

                              return (
                                <tr
                                  key={rIdx}
                                  className="hover:bg-[var(--surface-elevated)]/50 transition-colors"
                                >
                                  {/* Category label & badge */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-[var(--text-primary)]">
                                        {row.categoryLabel}
                                      </span>
                                      {row.quotaType === "Ladies" && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30">
                                          LADIES
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Round 1 */}
                                  {(roundFilter === "all" || roundFilter === 1) && (
                                    <td className="py-3 px-3 text-center text-[var(--text-secondary)] font-medium">
                                      {row.round1 !== null ? `${row.round1.toFixed(2)}%` : "—"}
                                    </td>
                                  )}

                                  {/* Round 2 */}
                                  {(roundFilter === "all" || roundFilter === 2) && (
                                    <td className="py-3 px-3 text-center text-[var(--text-secondary)] font-medium">
                                      {row.round2 !== null ? `${row.round2.toFixed(2)}%` : "—"}
                                    </td>
                                  )}

                                  {/* Round 3 */}
                                  {(roundFilter === "all" || roundFilter === 3) && (
                                    <td className="py-3 px-3 text-center text-[var(--text-secondary)] font-medium">
                                      {row.round3 !== null ? `${row.round3.toFixed(2)}%` : "—"}
                                    </td>
                                  )}

                                  {/* Round 4 */}
                                  {(roundFilter === "all" || roundFilter === 4) && (
                                    <td className="py-3 px-3 text-center text-[var(--brand-primary)] font-bold">
                                      {row.round4 !== null
                                        ? `${row.round4.toFixed(2)}%`
                                        : row.round1 !== null
                                        ? `${row.round1.toFixed(2)}%*`
                                        : "—"}
                                    </td>
                                  )}

                                  {/* Drop Trend */}
                                  <td className="py-3 px-3 text-center">
                                    {row.relaxationDrop !== null && row.relaxationDrop > 0 ? (
                                      <span className="text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
                                        <TrendingDown className="w-3 h-3" />
                                        -{row.relaxationDrop.toFixed(2)}%
                                      </span>
                                    ) : row.relaxationDrop !== null && row.relaxationDrop < 0 ? (
                                      <span className="text-amber-400 font-semibold">
                                        +{Math.abs(row.relaxationDrop).toFixed(2)}%
                                      </span>
                                    ) : (
                                      <span className="text-[var(--text-muted)]">Steady</span>
                                    )}
                                  </td>

                                  {/* Benchmark Status */}
                                  {userScore > 0 && (
                                    <td className="py-3 px-4 text-right">
                                      {statusLabel ? (
                                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusBadgeClass}`}>
                                          {statusLabel}
                                        </span>
                                      ) : (
                                        <span className="text-[var(--text-muted)]">—</span>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Strategic Preparation Advice Box */}
                    <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Info className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span>
                          <strong>Option Strategy:</strong> Rank this course under your{" "}
                          <span className="text-[var(--brand-primary)] font-bold">{prepInsight.preferenceRecommendation.toUpperCase()}</span> tier.
                          {" "}Keep Round 4 cutoff as your realistic target for institutional spot and freeze decisions.
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                        * Denotes R1 cutoff carried forward
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Strategic Preparation Playbook Guide Footer */}
      <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-subtle)]">
          <GraduationCap className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            How Students Should Prepare Accordingly Using Cutoff Records
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold flex items-center justify-center text-xs font-mono mb-2.5">
              1
            </div>
            <h5 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
              Round 1 vs Round 4 Relaxation
            </h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Cutoffs typically drop by 1.0 to 3.5% between CAP Round 1 and Round 4. If your score is slightly below Round 1, do not abandon the choice—list it in your top 10 option form preferences.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold flex items-center justify-center text-xs font-mono mb-2.5">
              2
            </div>
            <h5 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
              30% Ladies Quota Benefit
            </h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Female candidates automatically compete in both General and Ladies quotas (LOPEN, LOBC, LSC, LST). Check the Ladies cutoff column: it is frequently 0.5 - 2.0% lower than General Open.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold flex items-center justify-center text-xs font-mono mb-2.5">
              3
            </div>
            <h5 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
              TFWS &amp; Category Fee Waivers
            </h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              TFWS provides 100% tuition waiver but requires higher percentiles. OBC, EWS, and SEBC candidates receive 50% waiver under the Rajarshi Shahu Maharaj Scheme if valid income and NCL certificates are verified.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold flex items-center justify-center text-xs font-mono mb-2.5">
              4
            </div>
            <h5 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
              The 3-Tier Option Form Formula
            </h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Construct your 300 CAP preference list using: Choices 1-10 Ambitious (0-3% above your score), Choices 11-25 Target (matches your score), Choices 26-40 Guaranteed Safe Harbors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CutoffRecordsSection;

