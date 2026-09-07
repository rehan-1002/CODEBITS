"use client";

import React, { useState } from "react";
import { UploadCloud, FileCheck, AlertCircle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { AcademicBranch, AcademicSemester, DocumentCategory } from "@/types/resources";

export function ResourceUploadForm() {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [branch, setBranch] = useState<AcademicBranch>("COMPS");
  const [semester, setSemester] = useState<AcademicSemester>(3);
  const [category, setCategory] = useState<DocumentCategory>("pyq");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF documents (.pdf) are accepted for the academic vault.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !title.trim()) {
      setError("Please specify both the document title and the Mumbai University course subject.");
      return;
    }

    if (!file) {
      setError("Please attach a valid PDF document to submit.");
      return;
    }

    setLoading(true);

    // Backend-ready boundary:
    // In this phase, confirm frontend validation and simulate submission lifecycle
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="space-y-8">
      {submitted ? (
        <div className="p-8 rounded-lg border border-[var(--badge-border)] bg-[var(--surface-base)] text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
              STATUS: PENDING FACULTY REVIEW
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Resource Queued for Moderation
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Thank you for contributing to the CodeBits archive. In accordance with Mumbai University academic integrity policies, all student-submitted documents are verified by faculty before being indexed in the public Vault.
            </p>
          </div>

          <div className="p-4 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] max-w-md mx-auto text-left text-xs font-mono space-y-1.5">
            <div><span className="text-[var(--text-muted)]">TITLE:</span> {title}</div>
            <div><span className="text-[var(--text-muted)]">SUBJECT:</span> {subject}</div>
            <div><span className="text-[var(--text-muted)]">BRANCH:</span> {branch} (SEM {semester})</div>
            <div><span className="text-[var(--text-muted)]">FILE:</span> {file?.name} ({(file?.size ? file.size / 1024 : 0).toFixed(1)} KB)</div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSubject("");
              setTitle("");
              setFile(null);
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors cursor-pointer"
          >
            <span>SUBMIT ANOTHER DOCUMENT</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Submit Academic Resource
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Mumbai University Rev-2019 'C' Scheme engineering papers and notes.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              DOCUMENT TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. May 2023 University Question Paper with Step Solutions"
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              COURSE / SUBJECT NAME *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Applied Mathematics IV"
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          {/* Branch & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                ACADEMIC BRANCH *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as AcademicBranch)}
                className="w-full px-3 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
              >
                <option value="COMPS">Computer Engineering (COMPS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="AI-DS">Artificial Intelligence &amp; Data Science (AI-DS)</option>
                <option value="EXTC">Electronics &amp; Telecommunication (EXTC)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering (CIVIL)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                SEMESTER (1–8) *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as AcademicSemester)}
                className="w-full px-3 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              DOCUMENT CATEGORY *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "pyq", label: "Question Paper" },
                { id: "notes", label: "Lecture Notes" },
                { id: "syllabus", label: "Syllabus" },
                { id: "solution", label: "Solution" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as DocumentCategory)}
                  className={`py-2 px-3 rounded text-xs font-mono border transition-colors cursor-pointer ${
                    category === c.id
                      ? "bg-[var(--badge-bg)] text-[var(--brand-primary)] border-[var(--badge-border)] font-semibold"
                      : "bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* PDF File Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              ATTACH PDF FILE *
            </label>
            <div className="relative border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand-primary)] rounded-lg p-6 text-center bg-[var(--bg-base)] transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload PDF document"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[var(--brand-primary)]" />
                {file ? (
                  <div className="flex items-center space-x-2 text-xs font-mono text-[var(--brand-primary)]">
                    <FileCheck className="w-4 h-4" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[var(--text-primary)] font-medium">
                      Drag &amp; drop PDF here, or click to browse files
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">
                      PDF DOCUMENTS ONLY • MAXIMUM 50 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "SUBMITTING TO MODERATION..." : "SUBMIT FOR PEER MODERATION"}</span>
          </button>
        </form>
      )}

      {/* Moderation Protocol Guide */}
      <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
            CODEBITS ACADEMIC MODERATION LIFECYCLE
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 01</span>
            <div className="font-semibold text-[var(--text-primary)]">Student Submission</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Paper uploaded with branch and semester metadata. Assigned status: <code className="font-mono text-[var(--text-muted)]">pending</code>.
            </p>
          </div>

          <div className="p-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 02</span>
            <div className="font-semibold text-[var(--text-primary)]">Faculty Verification</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Educators review PDF for scheme alignment (Rev-2019 'C') and mathematical correctness.
            </p>
          </div>

          <div className="p-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 03</span>
            <div className="font-semibold text-[var(--text-primary)]">Vault Publication</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Approved documents become searchable in public vault and cbAI with verified attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
