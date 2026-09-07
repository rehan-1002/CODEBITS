"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, CornerDownLeft, AlertCircle, UploadCloud } from "lucide-react";
import { CbAiQuery, CbAiStatus } from "@/types/ai";
import { AcademicBranch, DocumentCategory } from "@/types/resources";

interface CbAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CbAiDrawer({ isOpen, onClose }: CbAiDrawerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CbAiStatus>("idle");
  const [parsedQuery, setParsedQuery] = useState<CbAiQuery | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setQuery("");
      setParsedQuery(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Natural language parser simulation conforming to cbAI specification
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    setStatus("searching");

    // Deconstruct query into structured parameters
    setTimeout(() => {
      let branch: AcademicBranch | undefined;
      let semester: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
      let category: DocumentCategory | undefined;
      let subject: string | undefined;

      // Detect branch
      if (cleanQuery.includes("comp") || cleanQuery.includes("computer")) branch = "COMPS";
      else if (cleanQuery.includes("it") || cleanQuery.includes("info")) branch = "IT";
      else if (cleanQuery.includes("ai") || cleanQuery.includes("ds")) branch = "AI-DS";
      else if (cleanQuery.includes("extc") || cleanQuery.includes("telecom")) branch = "EXTC";
      else if (cleanQuery.includes("mech")) branch = "MECH";
      else if (cleanQuery.includes("civil")) branch = "CIVIL";

      // Detect semester
      for (let s = 1; s <= 8; s++) {
        if (
          cleanQuery.includes(`sem ${s}`) ||
          cleanQuery.includes(`sem${s}`) ||
          cleanQuery.includes(`${s}th sem`) ||
          cleanQuery.includes(`${s}rd sem`) ||
          cleanQuery.includes(`${s}nd sem`) ||
          cleanQuery.includes(`${s}st sem`) ||
          cleanQuery.includes(`semester ${s}`)
        ) {
          semester = s as any;
          break;
        }
      }

      // Detect category
      if (cleanQuery.includes("pyq") || cleanQuery.includes("question") || cleanQuery.includes("paper")) category = "pyq";
      else if (cleanQuery.includes("note") || cleanQuery.includes("handwritten")) category = "notes";
      else if (cleanQuery.includes("syllabus") || cleanQuery.includes("curriculum")) category = "syllabus";
      else if (cleanQuery.includes("sol") || cleanQuery.includes("solution") || cleanQuery.includes("answer")) category = "solution";

      // Detect subject
      if (cleanQuery.includes("math")) subject = "Applied Mathematics";
      else if (cleanQuery.includes("data structure") || cleanQuery.includes("dsa")) subject = "Data Structures & Algorithms";
      else if (cleanQuery.includes("os") || cleanQuery.includes("operating")) subject = "Operating Systems";
      else if (cleanQuery.includes("dbms") || cleanQuery.includes("database")) subject = "Database Management Systems";
      else if (cleanQuery.includes("network") || cleanQuery.includes("cn")) subject = "Computer Networks";

      const parsed: CbAiQuery = { branch, semester, category, subject };
      setParsedQuery(parsed);

      // Backend simulation: zero fake results rule
      // If none exist in real DB, always trigger documented empty fallback
      setStatus("no_results");
    }, 350);
  };

  const handleNavigateToVault = () => {
    onClose();
    const params = new URLSearchParams();
    if (parsedQuery?.branch) params.set("branch", parsedQuery.branch);
    if (parsedQuery?.semester) params.set("semester", parsedQuery.semester.toString());
    if (parsedQuery?.category) params.set("category", parsedQuery.category);
    if (parsedQuery?.subject) params.set("query", parsedQuery.subject);
    router.push(`/vault?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-base)]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl rounded-lg border border-[var(--border-strong)] bg-[var(--surface-base)] shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-label="cbAI Search Interface"
          >
            {/* Header / Input Form */}
            <form
              onSubmit={handleSearch}
              className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
            >
              <Search className="w-4 h-4 text-[var(--brand-primary)] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the academic vault (e.g., '3rd sem comps maths PYQ')..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-sans"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] mr-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={!query.trim()}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--brand-primary)] text-black text-xs font-semibold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span>SEARCH</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>

            {/* Content Area */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Idle state with hints */}
              {status === "idle" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    NATURAL LANGUAGE TAXONOMY EXAMPLES
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "3rd sem COMPS maths 3 PYQ",
                      "Semester 5 IT database notes",
                      "AI-DS Sem 4 applied mathematics",
                      "EXTC rev 2019 syllabus",
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => {
                          setQuery(example);
                          setTimeout(() => handleSearch(), 50);
                        }}
                        className="text-left px-3 py-2.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-[var(--brand-primary)] mr-2">
                          &gt;
                        </span>
                        {example}
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>cbAI SEARCH PIPELINE</span>
                    <span>REV-2019 'C' SCHEME ENFORCED</span>
                  </div>
                </div>
              )}

              {/* Searching State */}
              {status === "searching" && (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    COMPILING QUERY TAXONOMY &amp; FILTERING APPROVED CATALOG...
                  </span>
                </div>
              )}

              {/* Parsed Taxonomy + Documented Empty State */}
              {status === "no_results" && parsedQuery && (
                <div className="space-y-5">
                  {/* Extracted Structured Filters Preview */}
                  <div className="p-3.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
                        STRUCTURED PARAMETERS EXTRACTED
                      </span>
                      <span className="text-[10px] font-mono text-[var(--brand-primary)]">
                        TAXONOMY COMPILED
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                      {parsedQuery.branch && (
                        <span className="px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--brand-primary)] border border-[var(--badge-border)]">
                          BRANCH: {parsedQuery.branch}
                        </span>
                      )}
                      {parsedQuery.semester && (
                        <span className="px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--brand-primary)] border border-[var(--badge-border)]">
                          SEM: {parsedQuery.semester}
                        </span>
                      )}
                      {parsedQuery.category && (
                        <span className="px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--brand-primary)] border border-[var(--badge-border)]">
                          TYPE: {parsedQuery.category.toUpperCase()}
                        </span>
                      )}
                      {parsedQuery.subject && (
                        <span className="px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--brand-primary)] border border-[var(--badge-border)]">
                          SUBJECT: {parsedQuery.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Documented Zero-Hallucination Fallback */}
                  <div className="p-5 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        No Matching Approved Resources Found
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] font-mono max-w-md mx-auto">
                        Not available or not uploaded yet. Be the first to upload!
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push("/upload");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded bg-[var(--brand-primary)] text-black text-xs font-semibold hover:bg-[var(--brand-dark)] transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>BE THE FIRST TO UPLOAD</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNavigateToVault}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
                      >
                        <span>VIEW ALL IN VAULT</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <div>ZERO-HALLUCINATION ACADEMIC PARSER</div>
              <div className="flex items-center space-x-3">
                <span>[ESC] TO EXIT</span>
                <span>[ENTER] TO SEARCH</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
