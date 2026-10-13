"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SlidersHorizontal,
  Building2,
  Check,
  CheckCircle2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Compass,
  MapPin,
  Laptop,
  GraduationCap,
  Sliders,
  Settings2,
} from "lucide-react";
import { runPrediction, PredictionResult, MatchBand } from "@/lib/cap/predictor-engine";

const PRIMARY_CATEGORIES = [
  { id: "OPEN", label: "Open / General", note: "General merit seats (open to all candidates)" },
  { id: "OBC", label: "OBC", note: "Other Backward Classes (NCL required)" },
  { id: "EWS", label: "EWS (10%)", note: "Economically Weaker Section (10% state quota)" },
  { id: "TFWS", label: "TFWS", note: "100% Tuition Fee Waiver (Top 5% supernumerary seats)" },
  { id: "SC", label: "SC", note: "Scheduled Caste quota" },
  { id: "ST", label: "ST", note: "Scheduled Tribe quota" },
  { id: "SEBC", label: "SEBC", note: "Socially & Educationally Backward Class" },
];

const VJ_NT_SUBCATEGORIES = [
  { id: "VJ", label: "VJ / DT" },
  { id: "NT1", label: "NT-1 (NT-B)" },
  { id: "NT2", label: "NT-2 (NT-C)" },
  { id: "NT3", label: "NT-3 (NT-D)" },
];

const REGION_CLUSTERS = [
  { id: "all", label: "All Maharashtra" },
  { id: "mumbai", label: "Mumbai & MMR" },
  { id: "pune", label: "Pune & PCMC" },
  { id: "nagpur", label: "Nagpur" },
  { id: "nashik", label: "Nashik" },
  { id: "aurangabad", label: "Chh. Sambhajinagar" },
  { id: "amravati", label: "Amravati" },
];

const BRANCH_CLUSTERS = [
  { id: "Computer", label: "Computer Engineering", isTech: true },
  { id: "Information Technology", label: "Information Technology", isTech: true },
  { id: "Artificial Intelligence", label: "AI & Machine Learning", isTech: true },
  { id: "Data Science", label: "Data Science", isTech: true },
  { id: "Electronics", label: "Electronics & Telecommunication", isTech: false },
  { id: "Mechanical", label: "Mechanical Engineering", isTech: false },
  { id: "Civil", label: "Civil Engineering", isTech: false },
  { id: "Electrical", label: "Electrical Engineering", isTech: false },
  { id: "Chemical", label: "Chemical Engineering", isTech: false },
];

const MINORITIES = [
  { id: "", label: "No Minority (General)" },
  { id: "hindi", label: "Hindi Linguistic" },
  { id: "gujarati", label: "Gujarati Linguistic" },
  { id: "sindhi", label: "Sindhi Linguistic" },
  { id: "muslim", label: "Muslim Religious" },
  { id: "christian", label: "Christian Religious" },
  { id: "jain", label: "Jain Religious" },
];

export function PredictorTab() {
  // Input states
  const [scoreInput, setScoreInput] = useState<string>("92.50");
  const [category, setCategory] = useState<string>("OPEN");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [region, setRegion] = useState<string>("all");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [minority, setMinority] = useState<string>("");
  const [targetRound, setTargetRound] = useState<number>(4);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Advanced filters drawer
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Search filter on results
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [bandFilter, setBandFilter] = useState<string>("all");
  const [expandedColleges, setExpandedColleges] = useState<Record<string, boolean>>({});

  // Progressive rendering: Show initial 25 to keep DOM lightweight and instant
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const scoreNum = parseFloat(scoreInput) || 0;

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [scoreInput, category, gender, region, selectedBranches, minority, statusFilter, targetRound, bandFilter, searchTerm]);

  // Active advanced filters counter
  const advancedCount = useMemo(() => {
    let count = 0;
    if (gender !== "male") count++;
    if (targetRound !== 4) count++;
    if (statusFilter !== "all") count++;
    if (minority !== "") count++;
    return count;
  }, [gender, targetRound, statusFilter, minority]);

  // Run prediction
  const allResults = useMemo(() => {
    if (scoreNum <= 0 || isNaN(scoreNum)) return [];
    return runPrediction({
      score: scoreNum,
      category,
      gender,
      region,
      selectedBranches,
      minority,
      status: statusFilter,
      targetRound,
    });
  }, [scoreNum, category, gender, region, selectedBranches, minority, statusFilter, targetRound]);

  // Filtered by local search and band
  const displayedResults = useMemo(() => {
    return allResults.filter((item) => {
      if (bandFilter !== "all" && item.band.toLowerCase() !== bandFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesCol =
          item.college.n.toLowerCase().includes(q) ||
          item.college.c.includes(q) ||
          (item.college.ci || "").toLowerCase().includes(q);
        const matchesBr = item.branch.n.toLowerCase().includes(q);
        if (!matchesCol && !matchesBr) return false;
      }
      return true;
    });
  }, [allResults, bandFilter, searchTerm]);

  // Paginated chunk for zero lag
  const paginatedResults = useMemo(() => {
    return displayedResults.slice(0, visibleCount);
  }, [displayedResults, visibleCount]);

  // Band counts
  const counts = useMemo(() => {
    const res = { safe: 0, target: 0, ambitious: 0, reach: 0 };
    for (const r of allResults) {
      if (r.band === "Safe") res.safe++;
      else if (r.band === "Target") res.target++;
      else if (r.band === "Ambitious") res.ambitious++;
      else res.reach++;
    }
    return res;
  }, [allResults]);

  const toggleBranch = (br: string) => {
    setSelectedBranches((prev) =>
      prev.includes(br) ? prev.filter((b) => b !== br) : [...prev, br]
    );
  };

  const selectTechBranches = () => {
    const techBranches = BRANCH_CLUSTERS.filter((b) => b.isTech).map((b) => b.id);
    setSelectedBranches(techBranches);
  };

  const toggleExpand = (id: string) => {
    setExpandedColleges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReset = () => {
    setScoreInput("92.50");
    setCategory("OPEN");
    setGender("male");
    setRegion("all");
    setSelectedBranches([]);
    setMinority("");
    setTargetRound(4);
    setStatusFilter("all");
    setSearchTerm("");
    setBandFilter("all");
  };

  const isVjNtActive = ["VJ", "NT1", "NT2", "NT3"].includes(category);

  // Active category note
  const activeCategoryNote = useMemo(() => {
    const foundPrimary = PRIMARY_CATEGORIES.find((c) => c.id === category);
    if (foundPrimary) return foundPrimary.note;
    if (isVjNtActive) return "VJ / NT categories have reserved quota in CAP rounds";
    return "";
  }, [category, isVjNtActive]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Redesigned Streamlined Predictor Form */}
      <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                CAP 2026-27 College Predictor
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-1">
              Find Your Eligible Engineering Colleges
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Select your percentile, category, and preferred branches to calculate reachable colleges instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs font-mono hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>

        {/* STEP 1: Percentile Input & Quick Ticks */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Your MHT-CET / JEE Percentile</span>
            </label>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Score from 0 to 100.00
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="e.g. 92.50"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-lg font-bold focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-[var(--text-muted)]">
                %tile
              </span>
            </div>

            {/* Quick Score Preset Ticks */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1 hidden sm:inline">
                Quick:
              </span>
              {[98, 95, 90, 85, 75, 60].map((preset) => {
                const isActive = Math.abs(scoreNum - preset) < 0.05;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setScoreInput(preset.toFixed(2))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                      isActive
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 text-[var(--brand-primary)]" />}
                    <span>{preset}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 2: Category Cluster Ticks */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Reservation Category</span>
            </label>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {activeCategoryNote}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRIMARY_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      isSelected
                        ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                        : "border-[var(--border-strong)]"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* VJ / NT Cluster Trigger */}
            <button
              type="button"
              onClick={() => {
                if (!isVjNtActive) setCategory("NT1");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isVjNtActive
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                  : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                  isVjNtActive
                    ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                    : "border-[var(--border-strong)]"
                }`}
              >
                {isVjNtActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>VJ / NT Categories</span>
            </button>
          </div>

          {/* Sub-cluster for VJ / NT when selected */}
          {isVjNtActive && (
            <div className="mt-2.5 p-2.5 rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--text-secondary)] mr-1">
                Select NT / VJ Group:
              </span>
              {VJ_NT_SUBCATEGORIES.map((sub) => {
                const isSubSelected = category === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCategory(sub.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                      isSubSelected
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-black font-bold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {isSubSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3: Geographic Region Cluster Ticks */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Preferred Region / City</span>
            </label>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {region === "all" ? "Searching state-wide" : `Filtered to ${region.toUpperCase()}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {REGION_CLUSTERS.map((reg) => {
              const isSelected = region === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => setRegion(reg.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      isSelected
                        ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                        : "border-[var(--border-strong)]"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span>{reg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Engineering Branches Multi-select Cluster Ticks */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-[11px] font-bold">4</span>
              <span>Engineering Branches</span>
              {selectedBranches.length > 0 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] font-mono font-bold">
                  {selectedBranches.length} Selected
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] font-mono font-normal">
                  All branches included
                </span>
              )}
            </label>

            {/* Quick Stream Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectTechBranches}
                className="text-xs font-mono text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Select Technical Branches (CS, IT, AI, DS)</span>
              </button>
              {selectedBranches.length > 0 && (
                <>
                  <span className="text-[var(--text-muted)]">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBranches([])}
                    className="text-xs font-mono text-[var(--text-secondary)] hover:text-rose-400 cursor-pointer"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
            {BRANCH_CLUSTERS.map((branch) => {
              const isSelected = selectedBranches.includes(branch.id);
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => toggleBranch(branch.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border shrink-0 ${
                      isSelected
                        ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                        : "border-[var(--border-strong)]"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span className="truncate">{branch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 5: Collapsible Advanced Settings (Kept Simple & Uncluttered) */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                Advanced Preferences
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                (Gender Quota, CAP Round, Autonomy &amp; Minority)
              </span>
              {advancedCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-black font-bold">
                  {advancedCount} active
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
              <span>{showAdvanced ? "Hide" : "Show"}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Gender Quota */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
                  Gender Quota
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      gender === "male"
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)]"
                    }`}
                  >
                    General (Open)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      gender === "female"
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)]"
                    }`}
                  >
                    Ladies (30%)
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {gender === "female" ? "Evaluates LOPEN/LOBC quota" : "Competes in general quota"}
                </p>
              </div>

              {/* CAP Allotment Round */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
                  CAP Allotment Round
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRound(r)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        targetRound === r
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                          : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)]"
                      }`}
                    >
                      R{r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {targetRound === 4 ? "Round IV (Final official cutoff)" : `Round ${targetRound} cutoff`}
                </p>
              </div>

              {/* Institute Autonomy */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
                  Institute Governance
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "govt", label: "Govt." },
                    { id: "autonomous", label: "Autonomous" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        statusFilter === s.id
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                          : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Filter by institute type
                </p>
              </div>

              {/* Minority Quota */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
                  Minority Status
                </label>
                <div className="relative">
                  <select
                    value={minority}
                    onChange={(e) => setMinority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] text-xs font-medium focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer appearance-none"
                  >
                    {MINORITIES.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[var(--surface-base)] text-[var(--text-primary)]">
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  51% reserved in minority colleges
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spectrum Results Header & Search Bar */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Predicted Allotments
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                {displayedResults.length} Available
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
              Based on official State CET Cell cutoffs · Round {targetRound} · {category} Quota
            </p>
          </div>

          {/* Spectrum Filter Pills with Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All", count: allResults.length, color: "var(--text-primary)" },
              { id: "safe", label: "Safe", count: counts.safe, color: "#00C269" },
              { id: "target", label: "Target", count: counts.target, color: "#38BDF8" },
              { id: "ambitious", label: "Ambitious", count: counts.ambitious, color: "#F59E0B" },
              { id: "reach", label: "Reach", count: counts.reach, color: "#A855F7" },
            ].map((b) => {
              const isSel = bandFilter === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBandFilter(b.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSel
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 font-bold text-[var(--brand-primary)] shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isSel && <Check className="w-3 h-3 text-[var(--brand-primary)]" />}
                  <span>{b.label}</span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                    style={{ backgroundColor: `${b.color}20`, color: b.color }}
                  >
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by college name, code (e.g. 03012), city (e.g. Pune, Mumbai), or branch name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
          />
        </div>
      </div>

      {/* Results Cards List */}
      {displayedResults.length === 0 ? (
        <div className="w-full py-16 px-4 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col items-center justify-center text-center">
          <Compass className="w-10 h-10 text-[var(--text-muted)] mb-3 animate-spin" />
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            No Allotments Found for Current Filter
          </h4>
          <p className="text-xs font-mono text-[var(--text-secondary)] max-w-md mt-1">
            Try adjusting your score percentile, clearing branch filters, or setting region to &quot;All Maharashtra&quot;.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-black font-semibold text-xs font-mono hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset Filters to Default
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedResults.map((item, idx) => {
            const collegeKey = `${item.college.c}_${item.branch.n}`;
            const isExpanded = expandedColleges[collegeKey] || false;

            return (
              <div
                key={`${item.college.c}_${item.branch.n}_${idx}`}
                className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 transition-all hover:border-[var(--brand-primary)]/50 hover:shadow-md"
              >
                {/* Top Meta Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--brand-primary)] px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30">
                      CODE {item.college.c}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                      {item.college.ci} · {item.college.r}
                    </span>
                    {item.college.a === 1 && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        Autonomous
                      </span>
                    )}
                    {item.college.st === "govt" && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        Government
                      </span>
                    )}
                    {item.college.na && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                        NAAC {item.college.na}
                      </span>
                    )}
                  </div>

                  {/* Match Band Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border"
                      style={{
                        backgroundColor: item.bandBg,
                        borderColor: item.bandBorder,
                        color: item.bandColor,
                      }}
                    >
                      {item.band === "Target"
                        ? "TARGET MATCH"
                        : item.band === "Safe"
                        ? "SAFE HARBOR"
                        : item.band === "Ambitious"
                        ? "AMBITIOUS"
                        : "REACH OPTION"}
                    </span>
                  </div>
                </div>

                {/* College & Branch Core Title */}
                <div className="mt-3.5">
                  <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {item.college.n}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-[var(--brand-primary)]">
                      {item.branch.n}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      ({item.appliedQuota})
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                  <div>
                    <span className="block text-[11px] font-mono text-[var(--text-muted)] uppercase">
                      Cutoff %tile (R{targetRound})
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {item.cutoff.toFixed(2)}%
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-mono text-[var(--text-muted)] uppercase">
                      Score Margin
                    </span>
                    <span
                      className={`font-mono text-sm sm:text-base font-bold ${
                        item.diff >= 0 ? "text-[var(--brand-primary)]" : "text-amber-400"
                      }`}
                    >
                      {item.diff >= 0 ? `+${item.diff.toFixed(2)}%` : `${item.diff.toFixed(2)}%`}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-mono text-[var(--text-muted)] uppercase">
                      Official FRA Fee
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {item.college.f ? `₹${item.college.f.toLocaleString("en-IN")}/yr` : "Govt Fee"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-mono text-[var(--text-muted)] uppercase">
                      Net Fee ({category})
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                      {item.netFee ? `₹${item.netFee.toLocaleString("en-IN")}/yr` : "Nominal"}
                    </span>
                  </div>
                </div>

                {/* 4-Round Shift Progression */}
                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)]">Progression:</span>
                  <span className={targetRound === 1 ? "text-[var(--brand-primary)] font-bold" : ""}>
                    R1: {item.roundCutoffs.round1 ? `${item.roundCutoffs.round1.toFixed(2)}%` : "N/A"}
                  </span>
                  <span>→</span>
                  <span className={targetRound === 2 ? "text-[var(--brand-primary)] font-bold" : ""}>
                    R2: {item.roundCutoffs.round2 ? `${item.roundCutoffs.round2.toFixed(2)}%` : "N/A"}
                  </span>
                  <span>→</span>
                  <span className={targetRound === 3 ? "text-[var(--brand-primary)] font-bold" : ""}>
                    R3: {item.roundCutoffs.round3 ? `${item.roundCutoffs.round3.toFixed(2)}%` : "N/A"}
                  </span>
                  <span>→</span>
                  <span className={targetRound === 4 ? "text-[var(--brand-primary)] font-bold" : ""}>
                    R4: {item.roundCutoffs.round4 ? `${item.roundCutoffs.round4.toFixed(2)}%` : "N/A"}
                  </span>

                  <span className="ml-auto text-[11px] text-[var(--text-muted)] italic">
                    {item.feeSavingsNote}
                  </span>
                </div>

                {/* Expand Details Trigger */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpand(collegeKey)}
                    className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Other Branches" : "View All Branches in Institute"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Affiliation: {item.college.u}
                  </span>
                </div>

                {/* Expanded Branches List */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      All Registered Branches in {item.college.n}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {item.college.br.map((otherBr, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs font-mono"
                        >
                          <span className="text-[var(--text-primary)] truncate max-w-[70%]">
                            {otherBr.n}
                          </span>
                          <span className="text-[var(--brand-primary)] font-semibold">
                            R4: {otherBr["4g"] ? `${otherBr["4g"]}%` : otherBr["1g"] ? `${otherBr["1g"]}%` : "Govt Pool"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Progressive Load More button */}
          {displayedResults.length > visibleCount && (
            <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-6 py-3 rounded-xl border border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-mono text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-black transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                Load Next 24 Colleges (Showing {visibleCount} of {displayedResults.length})
              </button>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {displayedResults.length - visibleCount} more colleges match your profile
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PredictorTab;
