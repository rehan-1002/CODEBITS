"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface EntrancePaperItem {
  _id: string;
  examType: "HSC" | "MHT-CET" | "JEE-MAIN" | "JEE-ADVANCED";
  subject: string;
  year: number;
  session?: string;
  shift?: string;
  examDate?: string;
  questionCount: number;
  maxMarks: number;
  pdfUrl: string;
  solutionPdfUrl?: string;
  hasSolutions: boolean;
  title: string;
  source?: string;
  view_count: number;
}

const EXAM_CONFIG = {
  ALL: {
    label: "All Exams",
    color: "var(--brand-primary)",
    badgeBg: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/30",
  },
  HSC: {
    label: "Maharashtra HSC",
    tagline: "Class 12 Board Papers",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  "MHT-CET": {
    label: "MHT-CET",
    tagline: "State CET Cell (PCM & PCB)",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  "JEE-MAIN": {
    label: "JEE Main",
    tagline: "NTA All-India Shifts",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  "JEE-ADVANCED": {
    label: "JEE Advanced",
    tagline: "IIT Joint Admission Board",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

export default function EntrancePyqsTab() {
  const [papers, setPapers] = useState<EntrancePaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedExam, setSelectedExam] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [solutionsOnly, setSolutionsOnly] = useState(false);

  // Fetch entrance papers on mount
  useEffect(() => {
    async function fetchPapers() {
      try {
        setLoading(true);
        const res = await fetch("/api/entrance-papers");
        const json = await res.json();
        if (json.success) {
          setPapers(json.papers || []);
        } else {
          setError(json.error || "Failed to load papers");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load papers");
      } finally {
        setLoading(false);
      }
    }
    fetchPapers();
  }, []);

  // Compute distinct filter options based on current selection
  const availableSubjects = useMemo(() => {
    const pool = selectedExam === "ALL" ? papers : papers.filter((p) => p.examType === selectedExam);
    return Array.from(new Set(pool.map((p) => p.subject))).sort();
  }, [papers, selectedExam]);

  const availableYears = useMemo(() => {
    const pool = selectedExam === "ALL" ? papers : papers.filter((p) => p.examType === selectedExam);
    return Array.from(new Set(pool.map((p) => p.year))).sort((a, b) => b - a);
  }, [papers, selectedExam]);

  // Exam-level counts
  const examCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: papers.length };
    papers.forEach((p) => {
      counts[p.examType] = (counts[p.examType] || 0) + 1;
    });
    return counts;
  }, [papers]);

  const totalQuestions = useMemo(() => {
    return papers.reduce((sum, p) => sum + (p.questionCount || 0), 0);
  }, [papers]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      if (selectedExam !== "ALL" && p.examType !== selectedExam) return false;
      if (selectedSubject !== "ALL" && p.subject !== selectedSubject) return false;
      if (selectedYear !== "ALL" && p.year.toString() !== selectedYear) return false;
      if (solutionsOnly && !p.hasSolutions) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSub = p.subject.toLowerCase().includes(q);
        const matchSession = (p.session || "").toLowerCase().includes(q);
        const matchShift = (p.shift || "").toLowerCase().includes(q);
        const matchYear = p.year.toString().includes(q);
        if (!matchTitle && !matchSub && !matchSession && !matchShift && !matchYear) {
          return false;
        }
      }

      return true;
    });
  }, [papers, selectedExam, selectedSubject, selectedYear, solutionsOnly, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Top Intelligence Stats Banner */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            Total Papers
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--text-primary)]">
              {papers.length}
            </span>
            <span className="text-xs font-mono text-emerald-400">Indexed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Total PYQ Questions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--text-primary)]">
              {totalQuestions.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Questions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Year Coverage
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">
              2007 – 2026
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Archive</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verification
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              100% Authentic
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Verified</span>
          </div>
        </div>
      </div>

      {/* Exam Category Pills */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
        {(["ALL", "HSC", "MHT-CET", "JEE-MAIN", "JEE-ADVANCED"] as const).map((key) => {
          const cfg = EXAM_CONFIG[key];
          const isSelected = selectedExam === key;
          const count = examCounts[key] || 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedExam(key);
                setSelectedSubject("ALL");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-accent font-semibold tracking-wide transition-all border shrink-0 ${
                isSelected
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--text-primary)] shadow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span>{cfg.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-black font-bold"
                    : "bg-[var(--bg-base)] text-[var(--text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] flex flex-col lg:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, shift, session (e.g. Physics, July, Shift 1)..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
          />
        </div>

        {/* Subject Filter */}
        <div className="w-full lg:w-56">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
          >
            <option value="ALL">All Subjects ({availableSubjects.length})</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="w-full lg:w-36">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
          >
            <option value="ALL">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Solutions Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap">
          <input
            type="checkbox"
            checked={solutionsOnly}
            onChange={(e) => setSolutionsOnly(e.target.checked)}
            className="rounded border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--brand-primary)] focus:ring-0"
          />
          <span>Solutions Only</span>
        </label>
      </div>

      {/* Active Filter Summary */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-1">
        <span>
          Showing <strong className="text-[var(--text-primary)]">{filteredPapers.length}</strong> of{" "}
          {papers.length} question papers
        </span>
        {(selectedSubject !== "ALL" || selectedYear !== "ALL" || searchQuery || solutionsOnly) && (
          <button
            type="button"
            onClick={() => {
              setSelectedSubject("ALL");
              setSelectedYear("ALL");
              setSearchQuery("");
              setSolutionsOnly(false);
            }}
            className="text-[var(--brand-primary)] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-center">
          <RefreshCw className="w-6 h-6 text-[var(--brand-primary)] animate-spin" />
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
            Loading Entrance Question Papers...
          </span>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="w-full py-16 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] text-center flex flex-col items-center gap-2">
          <FileText className="w-10 h-10 text-[var(--text-muted)] stroke-1" />
          <h3 className="text-sm font-mono font-bold text-[var(--text-primary)]">
            No Question Papers Found
          </h3>
          <p className="text-xs font-mono text-[var(--text-secondary)] max-w-md">
            Try adjusting your search query, exam category, or subject filter to find relevant PYQs.
          </p>
        </div>
      ) : (
        /* Paper Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const examCfg = EXAM_CONFIG[paper.examType] || EXAM_CONFIG.ALL;

            return (
              <div
                key={paper._id}
                className="group p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4"
              >
                {/* Top Card Header */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${examCfg.badgeBg}`}
                    >
                      {paper.examType}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {paper.hasSolutions && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Soln Included
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                        {paper.year}
                      </span>
                    </div>
                  </div>

                  {/* Subject Title */}
                  <h3 className="text-base font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2 leading-tight">
                    {paper.title}
                  </h3>

                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
                    <span className="bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      {paper.subject}
                    </span>
                    {paper.session && (
                      <span className="bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                        {paper.session}
                      </span>
                    )}
                    {paper.shift && (
                      <span className="bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                        {paper.shift}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer & Actions */}
                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                  {/* Stats Specs */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-[var(--brand-primary)]" />
                      <strong className="text-[var(--text-primary)]">{paper.questionCount}</strong> Questions
                    </span>
                    {paper.maxMarks > 0 && (
                      <span>
                        Marks: <strong className="text-[var(--text-primary)]">{paper.maxMarks}</strong>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* View in Forensic Protected Viewer */}
                    <Link
                      href={`/viewer/${paper._id}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-semibold bg-[var(--brand-primary)] text-black hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Paper</span>
                    </Link>

                    {/* Direct PDF Link */}
                    <a
                      href={`/api/resources/${paper._id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-semibold bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Direct PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

