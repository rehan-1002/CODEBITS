"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
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
    // Simulated submission lifecycle for frontend verification
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="relative w-full space-y-8">
      {/* Background CodeBits Logo - Refracted and Blurred by the Liquid Glass Form */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -z-10 overflow-hidden">
        <div className="relative w-[340px] sm:w-[480px] md:w-[580px] aspect-square flex items-center justify-center animate-pulse duration-[7000ms]">
          {/* Ambient Emerald Backing Glow */}
          <div className="absolute inset-0 rounded-full bg-[var(--brand-primary,#00C269)]/15 dark:bg-[var(--brand-primary,#00C269)]/25 blur-3xl transform scale-90" />
          <Image
            src="/LOGO CB.png"
            alt="CodeBits Logo Backdrop"
            width={580}
            height={580}
            priority
            className="w-full h-full object-contain opacity-40 dark:opacity-30 drop-shadow-[0_0_40px_rgba(0,194,105,0.45)] pointer-events-none"
          />
        </div>
      </div>

      {submitted ? (
        /* Submitted Liquid Glass HUD Card */
        <div className="relative z-10 backdrop-blur-2xl bg-white/70 dark:bg-[#0B120E]/75 border border-white/60 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.5)] rounded-3xl p-8 sm:p-12 text-center space-y-6 overflow-hidden">
          {/* Top Specular Glare */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/30 dark:from-white/10 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          {/* HUD Corner Accents */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-[0_0_28px_rgba(0,194,105,0.25)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/35 text-[var(--brand-primary)] font-mono text-xs uppercase tracking-wider font-semibold backdrop-blur-md">
              <Clock className="w-3 h-3" />
              STATUS: PENDING FACULTY REVIEW
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Resource Queued for Moderation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Thank you for contributing to the CodeBits archive. In accordance with Mumbai University academic integrity standards, your document will be verified by faculty before being indexed in the public Vault.
            </p>
          </div>

          {/* Payload Summary HUD Panel */}
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] backdrop-blur-md max-w-md mx-auto text-left text-xs font-mono space-y-2 relative z-10 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10 text-[10px] text-[var(--text-muted)]">
              <span>PAYLOAD_RECEIPT</span>
              <span className="text-[var(--brand-primary)] font-semibold">VERIFIED_HASH</span>
            </div>
            <div><span className="text-[var(--text-muted)]">TITLE:</span> <span className="text-[var(--text-primary)] font-semibold">{title}</span></div>
            <div><span className="text-[var(--text-muted)]">SUBJECT:</span> <span className="text-[var(--text-primary)] font-semibold">{subject}</span></div>
            <div><span className="text-[var(--text-muted)]">BRANCH:</span> <span className="text-[var(--text-primary)] font-semibold">{branch} (SEM {semester})</span></div>
            <div><span className="text-[var(--text-muted)]">FILE:</span> <span className="text-[var(--text-primary)] font-semibold">{file?.name} ({(file?.size ? file.size / 1024 : 0).toFixed(1)} KB)</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSubject("");
              setTitle("");
              setFile(null);
            }}
            className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#0B0F0E] text-xs font-bold font-mono tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(0,194,105,0.35)] hover:shadow-[0_0_36px_rgba(0,194,105,0.65)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>SUBMIT ANOTHER DOCUMENT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Clear Liquid Glass HUD Form */
        <form
          onSubmit={handleSubmit}
          className="relative z-10 backdrop-blur-2xl bg-white/70 dark:bg-[#0B120E]/75 border border-white/60 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-10 space-y-7 overflow-hidden"
        >
          {/* Top Specular Glare */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/35 dark:from-white/10 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          {/* HUD Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />

          {/* HUD Header Strip */}
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--brand-primary)] font-semibold tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              SYS_NODE // ACADEMIC_INGESTION
            </div>
            <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest hidden sm:block">
              REV-2019 'C' SCHEME • VERIFIED VAULT
            </div>
          </div>

          {error && (
            <div className="relative z-10 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 backdrop-blur-md text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Document Title */}
          <div className="space-y-2 relative z-10">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              DOCUMENT TITLE <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. May 2024 University Question Paper with Full Solutions"
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] backdrop-blur-md text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/40 transition-all shadow-sm"
            />
          </div>

          {/* Course / Subject */}
          <div className="space-y-2 relative z-10">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              COURSE / SUBJECT NAME <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Applied Mathematics IV / Data Structures"
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] backdrop-blur-md text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/40 transition-all shadow-sm"
            />
          </div>

          {/* Branch & Semester Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
                ACADEMIC BRANCH <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as AcademicBranch)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#121A16]/80 backdrop-blur-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/40 transition-all cursor-pointer shadow-sm"
              >
                <option value="COMPS">Computer Engineering (COMPS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="AI-DS">Artificial Intelligence &amp; Data Science (AI-DS)</option>
                <option value="EXTC">Electronics &amp; Telecommunication (EXTC)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering (CIVIL)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
                SEMESTER (1–8) <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as AcademicSemester)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#121A16]/80 backdrop-blur-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/40 transition-all cursor-pointer shadow-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Category HUD Selector */}
          <div className="space-y-2 relative z-10">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              DOCUMENT CATEGORY <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono border backdrop-blur-md transition-all cursor-pointer text-center ${
                    category === c.id
                      ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border-[var(--brand-primary)]/70 font-semibold shadow-[0_0_16px_rgba(0,194,105,0.25)]"
                      : "bg-white/40 dark:bg-white/[0.03] text-[var(--text-secondary)] border-black/10 dark:border-white/10 hover:border-[var(--brand-primary)]/40 hover:text-[var(--text-primary)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* PDF File Dropzone */}
          <div className="space-y-2 relative z-10">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              ATTACH PDF PAYLOAD <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <div className="relative border-2 border-dashed border-black/15 dark:border-white/15 hover:border-[var(--brand-primary)] rounded-2xl p-7 text-center bg-white/40 dark:bg-white/[0.02] backdrop-blur-md transition-all group cursor-pointer hover:shadow-[0_0_25px_rgba(0,194,105,0.15)]">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Upload PDF document"
              />
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 text-xs font-mono text-[var(--brand-primary)] font-semibold">
                    <FileCheck className="w-4 h-4" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                      Drag &amp; drop PDF here, or click to browse files
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
                      PDF DOCUMENTS ONLY • MAXIMUM 50 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 relative z-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#0B0F0E] text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 disabled:opacity-50 shadow-[0_0_24px_rgba(0,194,105,0.35)] hover:shadow-[0_0_36px_rgba(0,194,105,0.65)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <span>{loading ? "TRANSMITTING TO MODERATION..." : "TRANSMIT TO FACULTY REVIEW"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Moderation Protocol Guide - Liquid Glass HUD Block */}
      <div className="relative rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-[#0C120F]/65 border border-black/10 dark:border-white/10 p-6 sm:p-7 space-y-4 shadow-sm overflow-hidden">
        {/* Subtle Specular Glare */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 dark:from-white/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 relative z-10">
          <ShieldAlert className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
            CODEBITS ACADEMIC MODERATION LIFECYCLE
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs relative z-10">
          <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 01</span>
            <div className="font-semibold text-[var(--text-primary)]">Student Submission</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
              Paper uploaded with branch and semester metadata. Assigned status: <code className="font-mono text-[var(--text-muted)]">pending</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 02</span>
            <div className="font-semibold text-[var(--text-primary)]">Faculty Verification</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
              Educators review PDF for scheme alignment (Rev-2019 'C') and pedagogical correctness.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md space-y-1">
            <span className="font-mono text-[10px] text-[var(--brand-primary)] font-bold">STAGE 03</span>
            <div className="font-semibold text-[var(--text-primary)]">Vault Publication</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
              Approved documents become searchable in public vault and cbAI with verified attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceUploadForm;
