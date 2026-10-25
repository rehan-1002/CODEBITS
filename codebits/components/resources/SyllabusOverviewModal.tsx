"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  FlaskConical,
  Layers,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { SyllabusOverviewData, SyllabusSubject, SyllabusSubjectType } from "@/types/resources";

interface SyllabusOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  resourceId: string;
}

export function SyllabusOverviewModal({
  isOpen,
  onClose,
  documentTitle,
  resourceId,
}: SyllabusOverviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<SyllabusOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | SyllabusSubjectType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch or retrieve cached overview when opened
  React.useEffect(() => {
    if (!isOpen || !resourceId) return;

    // Reset state for new resource
    if (overview?.resourceId !== resourceId) {
      setOverview(null);
      setError(null);
      setLoading(true);

      fetch(`/api/resources/${resourceId}/syllabus-overview`)
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to load syllabus overview.");
          }
          setOverview(json.data);
        })
        .catch((err) => {
          console.error("Error loading syllabus overview:", err);
          setError(err.message || "An error occurred while analyzing the syllabus.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, resourceId, overview?.resourceId]);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    if (!overview?.subjects) return [];
    return overview.subjects.filter((sub) => {
      const matchesFilter =
        activeFilter === "all" ? true : sub.type === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [overview, activeFilter, searchQuery]);

  const copyAsTableText = () => {
    if (!overview) return;
    const lines = [
      `Syllabus Overview: ${documentTitle}`,
      `Scheme: ${overview.schemeTitle || "Mumbai University Engineering"}`,
      `Branch: ${overview.branch} | Semester: ${overview.semester}`,
      `Total Marks: ${overview.totalMarks} | Total Credits: ${overview.totalCredits}`,
      "",
      "Code\tSubject\tType\tLectures\tPracticals\tTutorials\tCredits\tIA(20)\tESE(80)\tTW\tPR/OR\tTotal",
      ...overview.subjects.map(
        (s) =>
          `${s.code}\t${s.name}\t${s.type.toUpperCase()}\t${s.teachingScheme.lectures}\t${s.teachingScheme.practicals}\t${s.teachingScheme.tutorials}\t${s.teachingScheme.credits}\t${s.examScheme.internalAssessment}\t${s.examScheme.endSemExam}\t${s.examScheme.termWork}\t${s.examScheme.practicalOral}\t${s.examScheme.totalMarks}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/95 dark:bg-[#0A120E]/95 border border-black/10 dark:border-white/15 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Glare Light Bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-4 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/35 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                AI CURRICULUM BLUEPRINT
              </span>
              {overview?.schemeTitle && (
                <span className="font-mono text-[11px] text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-0.5 rounded-full truncate max-w-xs">
                  {overview.schemeTitle}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug">
              {documentTitle}
            </h2>

            {overview && (
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Branch: <span className="text-[var(--brand-primary)] font-semibold">{overview.branch}</span> • Semester:{" "}
                <span className="text-[var(--brand-primary)] font-semibold">{overview.semester}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {overview && (
              <button
                onClick={copyAsTableText}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors"
                title="Copy structured table data"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy TSV</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,194,105,0.3)] animate-pulse">
                  <Sparkles className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Analyzing Syllabus Scheme with cbAI...
                </h3>
                <p className="text-xs font-mono text-[var(--text-muted)] max-w-sm">
                  Extracting Mumbai University examination tables, course credits, internal assessments, and lab schemes.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-300">Analysis Encountered an Issue</h4>
                <p className="text-xs text-red-200/80">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetch(`/api/resources/${resourceId}/syllabus-overview`)
                    .then(async (res) => {
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error);
                      setOverview(json.data);
                    })
                    .catch((err) => setError(err.message))
                    .finally(() => setLoading(false));
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loaded Content */}
          {overview && !loading && (
            <>
              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>SEMESTER MARKS</span>
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {overview.totalMarks}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">Total Tally</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>TOTAL CREDITS</span>
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  </div>
                  <p className="text-xl font-bold font-mono text-[var(--brand-primary)]">
                    {overview.totalCredits}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">University Credits</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>THEORY + PRACTICAL</span>
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xl font-bold font-mono text-emerald-400">
                    {overview.bothCount || overview.subjects.filter((s) => s.type === "both").length}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">Integrated Subjects</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>PURE LABS / SKILL</span>
                    <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-xl font-bold font-mono text-sky-400">
                    {overview.practicalLabsCount ||
                      overview.subjects.filter((s) => s.type === "practical").length}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">Practical Courses</p>
                </div>
              </div>

              {/* Filters and Search Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Subject Type Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                  {(
                    [
                      { id: "all", label: "All Subjects" },
                      { id: "both", label: "Theory + Lab" },
                      { id: "theory", label: "Theory Only" },
                      { id: "practical", label: "Practical Only" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activeFilter === tab.id
                          ? "bg-[var(--brand-primary)] text-[#04120B] font-bold shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subject or code..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              {/* TABULAR PRESENTATION */}
              <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden shadow-sm bg-white/40 dark:bg-white/[0.02] backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    {/* Multi-tiered Table Header */}
                    <thead>
                      <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 font-mono text-[11px] text-[var(--text-secondary)]">
                        <th rowSpan={2} className="py-3 px-4 font-bold tracking-wider">
                          COURSE CODE &amp; NAME
                        </th>
                        <th rowSpan={2} className="py-3 px-3 font-bold tracking-wider text-center">
                          TYPE
                        </th>
                        <th
                          colSpan={4}
                          className="py-1.5 px-3 font-bold tracking-wider text-center border-l border-r border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]"
                        >
                          TEACHING SCHEME (HRS/WK)
                        </th>
                        <th
                          colSpan={6}
                          className="py-1.5 px-3 font-bold tracking-wider text-center bg-black/[0.04] dark:bg-white/[0.04]"
                        >
                          EXAMINATION SCHEME (MARKS)
                        </th>
                      </tr>
                      <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 font-mono text-[10px] text-[var(--text-muted)]">
                        {/* Teaching sub-headers */}
                        <th className="py-1.5 px-2 text-center border-l border-black/10 dark:border-white/10">L</th>
                        <th className="py-1.5 px-2 text-center">P</th>
                        <th className="py-1.5 px-2 text-center">T</th>
                        <th className="py-1.5 px-2 text-center font-bold text-[var(--brand-primary)] border-r border-black/10 dark:border-white/10">
                          CR
                        </th>
                        {/* Exam sub-headers */}
                        <th className="py-1.5 px-2.5 text-center" title="Internal Assessment (Test 1 & 2 avg)">
                          IA (20)
                        </th>
                        <th className="py-1.5 px-2.5 text-center" title="End Semester Exam">
                          ESE (80)
                        </th>
                        <th className="py-1.5 px-2 text-center" title="Exam Duration">
                          TIME
                        </th>
                        <th className="py-1.5 px-2.5 text-center" title="Term Work">
                          TW
                        </th>
                        <th className="py-1.5 px-2.5 text-center" title="Practical / Oral Exam">
                          PR/OR
                        </th>
                        <th className="py-1.5 px-3 text-center font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/5">
                          TOTAL
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                      {filteredSubjects.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="py-8 text-center text-xs text-[var(--text-muted)]">
                            No subjects match the selected criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredSubjects.map((sub, idx) => {
                          const typeBadge = {
                            both: {
                              label: "THEORY + LAB",
                              badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                              icon: Layers,
                            },
                            theory: {
                              label: "THEORY ONLY",
                              badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
                              icon: BookOpen,
                            },
                            practical: {
                              label: "PRACTICAL / LAB",
                              badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                              icon: FlaskConical,
                            },
                            project: {
                              label: "PROJECT",
                              badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
                              icon: Award,
                            },
                          }[sub.type] || {
                            label: sub.type.toUpperCase(),
                            badge: "bg-white/10 text-white border-white/20",
                            icon: BookOpen,
                          };

                          const IconComponent = typeBadge.icon;

                          return (
                            <tr
                              key={sub.code || idx}
                              className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group"
                            >
                              {/* Subject Code & Name */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[var(--brand-primary)] text-xs block">
                                    {sub.code}
                                  </span>
                                  <span className="font-sans font-semibold text-[var(--text-primary)] text-xs block leading-tight">
                                    {sub.name}
                                  </span>
                                  {sub.summary && (
                                    <p className="font-sans text-[11px] text-[var(--text-muted)] line-clamp-1 group-hover:line-clamp-none transition-all">
                                      {sub.summary}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Type Badge */}
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeBadge.badge}`}
                                >
                                  <IconComponent className="w-3 h-3" />
                                  <span>{typeBadge.label}</span>
                                </span>
                              </td>

                              {/* Teaching Scheme: L, P, T, CR */}
                              <td className="py-3 px-2 text-center text-[var(--text-secondary)] border-l border-black/10 dark:border-white/10">
                                {sub.teachingScheme.lectures}
                              </td>
                              <td className="py-3 px-2 text-center text-[var(--text-secondary)]">
                                {sub.teachingScheme.practicals}
                              </td>
                              <td className="py-3 px-2 text-center text-[var(--text-secondary)]">
                                {sub.teachingScheme.tutorials}
                              </td>
                              <td className="py-3 px-2 text-center font-bold text-[var(--brand-primary)] border-r border-black/10 dark:border-white/10">
                                {sub.teachingScheme.credits}
                              </td>

                              {/* Exam Scheme: IA, ESE, Time, TW, PR/OR, Total */}
                              <td className="py-3 px-2.5 text-center text-[var(--text-secondary)]">
                                {sub.examScheme.internalAssessment}
                              </td>
                              <td className="py-3 px-2.5 text-center font-semibold text-[var(--text-primary)]">
                                {sub.examScheme.endSemExam}
                              </td>
                              <td className="py-3 px-2 text-center text-[var(--text-muted)] text-[10px]">
                                {sub.examScheme.examDurationHours || "-"}
                              </td>
                              <td className="py-3 px-2.5 text-center text-[var(--text-secondary)]">
                                {sub.examScheme.termWork}
                              </td>
                              <td className="py-3 px-2.5 text-center text-[var(--text-secondary)]">
                                {sub.examScheme.practicalOral}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/5">
                                {sub.examScheme.totalMarks}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Table Summary Footer */}
                    {overview.subjects.length > 0 && (
                      <tfoot>
                        <tr className="bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 font-mono font-bold text-xs">
                          <td colSpan={5} className="py-3 px-4 text-[var(--text-primary)]">
                            SEMESTER TALLY TOTAL
                          </td>
                          <td className="py-3 px-2 text-center text-[var(--brand-primary)] border-r border-black/10 dark:border-white/10">
                            {overview.totalCredits} CR
                          </td>
                          <td colSpan={5} className="py-3 px-3 text-right text-[var(--text-muted)] text-[11px]">
                            GRAND TOTAL MARKS:
                          </td>
                          <td className="py-3 px-3 text-center text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-sm">
                            {overview.totalMarks}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Passing Criteria & Scheme Directives */}
              {overview.passingRules && (
                <div className="p-4 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/25 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--brand-primary)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>MUMBAI UNIVERSITY EVALUATION &amp; PASSING CRITERIA</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    {overview.passingRules}
                  </p>
                </div>
              )}

              {/* Syllabus Scheme Guidelines */}
              {overview.notes && overview.notes.length > 0 && (
                <div className="space-y-1 text-xs text-[var(--text-muted)] font-mono">
                  <p className="font-semibold text-[var(--text-secondary)]">SCHEME DIRECTIVES:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {overview.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            Verified extraction via cbAI Gemini Engine • Mumbai University Engineering
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyllabusOverviewModal;
