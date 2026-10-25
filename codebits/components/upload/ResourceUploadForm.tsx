"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Loader2,
  Zap,
  Sparkles,
} from "lucide-react";
import { AcademicBranch, AcademicSemester, DocumentCategory } from "@/types/resources";
import { AnimatedFilterDropdown, FilterDropdownOption } from "@/components/ui/animated-filter-dropdown";
import { FlowHoverButton } from "@/components/ui/flow-hover-button";
import { HoverButton } from "@/components/ui/hover-button";
import { compressPdfFile, CompressionProgress } from "@/lib/pdf/compressor";

const BRANCH_OPTIONS: FilterDropdownOption[] = [
  { id: "ALL", label: "ALL BRANCHES (First Year Common)", sublabel: "Common Curriculum for Semesters 1 & 2", icon: GraduationCap },
  { id: "COMPS", label: "Computer Engineering (COMPS)", sublabel: "Department of Computer Engg", icon: GraduationCap },
  { id: "IT", label: "Information Technology (IT)", sublabel: "Department of Info Tech", icon: GraduationCap },
  { id: "AI-DS", label: "Artificial Intelligence & Data Science (AI-DS)", sublabel: "Department of AI & DS", icon: GraduationCap },
  { id: "EXTC", label: "Electronics & Telecommunication (EXTC)", sublabel: "Department of EXTC", icon: GraduationCap },
  { id: "MECH", label: "Mechanical Engineering (MECH)", sublabel: "Department of Mechanical", icon: GraduationCap },
  { id: "CIVIL", label: "Civil Engineering (CIVIL)", sublabel: "Department of Civil", icon: GraduationCap },
];

const SEMESTER_OPTIONS: FilterDropdownOption[] = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
  id: s,
  label: `Semester ${s}`,
  sublabel: `Mumbai University Engineering (Term ${s})`,
  icon: BookOpen,
}));


const CATEGORY_OPTIONS: { id: DocumentCategory; label: string }[] = [
  { id: "pyq", label: "Question Paper" },
  { id: "notes", label: "Lecture Notes" },
  { id: "syllabus", label: "Syllabus" },
  { id: "solution", label: "Solution" },
];

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

  // Auto-compression state
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    finalSize: number;
    savingsPct: number;
  } | null>(null);

  const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024; // 4.5 MB Vercel Serverless payload ceiling

  const processAndSetFile = async (selected: File) => {
    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF documents (.pdf) are accepted for the academic vault.");
      return;
    }

    setError(null);
    setCompressionStats(null);

    // If file exceeds the 4.5 MB limit, auto-compress it!
    if (selected.size > MAX_UPLOAD_BYTES) {
      setCompressing(true);
      setCompressionProgress({
        stage: `File is ${(selected.size / (1024 * 1024)).toFixed(1)} MB (limit 4.5 MB). Auto-compressing PDF...`,
        percent: 15,
      });

      try {
        const result = await compressPdfFile(selected, {
          maxBytes: MAX_UPLOAD_BYTES,
          onProgress: (p) => setCompressionProgress(p),
        });

        if (result.finalSize <= MAX_UPLOAD_BYTES) {
          setFile(result.file);
          setCompressionStats({
            originalSize: result.originalSize,
            finalSize: result.finalSize,
            savingsPct: result.savingsPct,
          });
          setError(null);
        } else {
          setError(
            `Auto-compression reduced document from ${(result.originalSize / (1024 * 1024)).toFixed(1)} MB to ${(result.finalSize / (1024 * 1024)).toFixed(1)} MB, which still exceeds the 4.5 MB ceiling. Please upload a smaller portion of the syllabus.`
          );
          setFile(null);
        }
      } catch (compErr: any) {
        console.error("Auto-compression error:", compErr);
        setError(
          `Document size (${(selected.size / (1024 * 1024)).toFixed(1)} MB) exceeds 4.5 MB. Auto-compression encountered an issue: ${compErr?.message || "Please compress your PDF."}`
        );
        setFile(null);
      } finally {
        setCompressing(false);
        setCompressionProgress(null);
      }
    } else {
      setFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `Document size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 4.5 MB limit. Please compress your PDF and try again.`
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Read file into memory via FileReader (bypasses mobile WebKit detached file stream bugs)
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Unable to read selected PDF from device storage. Please re-select the file."));
        reader.readAsDataURL(file);
      });

      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        branch,
        semester,
        category,
        fileName: file.name,
        fileBase64,
      };

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        if (res.status === 413) {
          setLoading(false);
          setError("Document payload is too large for upload (limit 4.5 MB). Please compress your PDF.");
          return;
        }
        setLoading(false);
        setError(`Server returned status ${res.status} (${res.statusText || "Communication error"}). Please try again.`);
        return;
      }

      setLoading(false);

      if (!res.ok || !json?.success) {
        setError(json?.error || "Failed to submit document to vault. Please verify your inputs.");
        return;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to upload document. Please check your connection and try again.";
      setError(msg);
    }
  };

  return (
    <div className="relative isolate w-full space-y-8">
      {/* 
        ========================================================================
        CODEBITS LOGO IN THE BACK OF THE FORM:
        Placed at z-0 inside an isolated stacking context.
        The liquid glass form sits at z-10 directly refracting and blurring this logo.
        ========================================================================
      */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-visible">
        {/* Ambient Emerald Glow Bloom */}
        <div className="absolute w-[440px] sm:w-[580px] h-[440px] sm:h-[580px] rounded-full bg-[radial-gradient(circle,rgba(0,194,105,0.35)_0%,rgba(52,238,153,0.15)_40%,transparent_70%)] blur-[60px]" />
        <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 blur-[70px] -translate-y-8" />

        {/* CodeBits Emblem - Positioned directly behind the form */}
        <div className="relative w-[320px] sm:w-[460px] md:w-[520px] aspect-square flex items-center justify-center animate-pulse duration-[6000ms]">
          <Image
            src="/LOGO CB.png"
            alt="CodeBits Logo"
            width={520}
            height={520}
            priority
            className="w-full h-full object-contain opacity-75 dark:opacity-85 drop-shadow-[0_0_45px_rgba(0,194,105,0.5)] pointer-events-none"
          />
        </div>
      </div>

      {submitted ? (
        /* Submitted Liquid Glass HUD Card */
        <div className="relative z-10 backdrop-blur-2xl bg-white/40 dark:bg-[#0B120E]/40 border border-white/60 dark:border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-8 sm:p-12 text-center space-y-6 overflow-hidden">
          {/* Top Specular Glare */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/30 dark:from-white/15 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          {/* HUD Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-[0_0_28px_rgba(0,194,105,0.3)]">
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
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/[0.04] backdrop-blur-md max-w-md mx-auto text-left text-xs font-mono space-y-2 relative z-10 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10 text-[10px] text-[var(--text-muted)]">
              <span>PAYLOAD_RECEIPT</span>
              <span className="text-[var(--brand-primary)] font-semibold">VERIFIED_HASH</span>
            </div>
            <div><span className="text-[var(--text-muted)]">TITLE:</span> <span className="text-[var(--text-primary)] font-semibold">{title}</span></div>
            <div><span className="text-[var(--text-muted)]">SUBJECT:</span> <span className="text-[var(--text-primary)] font-semibold">{subject}</span></div>
            <div><span className="text-[var(--text-muted)]">BRANCH:</span> <span className="text-[var(--text-primary)] font-semibold">{branch} (SEM {semester})</span></div>
            <div><span className="text-[var(--text-muted)]">FILE:</span> <span className="text-[var(--text-primary)] font-semibold">{file?.name} ({(file?.size ? file.size / 1024 : 0).toFixed(1)} KB)</span></div>
          </div>

          {/* 21st.dev FlowHoverButton for Reset Action */}
          <div className="pt-2 relative z-10 flex justify-center">
            <FlowHoverButton
              onClick={() => {
                setSubmitted(false);
                setSubject("");
                setTitle("");
                setFile(null);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              className="h-12 min-w-[260px]"
            >
              SUBMIT ANOTHER DOCUMENT
            </FlowHoverButton>
          </div>
        </div>
      ) : (
        /* Authentic Liquid Glass HUD Form */
        <form
          onSubmit={handleSubmit}
          className="relative z-10 backdrop-blur-2xl bg-white/40 dark:bg-[#0B120E]/40 border border-white/60 dark:border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-10 space-y-7"
        >
          {/* Top Specular Glass Reflection Sheen */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/35 dark:from-white/15 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          {/* HUD Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--brand-primary)]/80 pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--brand-primary)]/80 pointer-events-none" />

          {error && (
            <div className="relative z-10 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 backdrop-blur-md text-red-500 dark:text-red-300 text-xs flex items-center gap-2.5">
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
              className="w-full px-4 py-3.5 rounded-xl border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white/80 dark:focus:bg-white/[0.08] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all shadow-inner"
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
              className="w-full px-4 py-3.5 rounded-xl border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white/80 dark:focus:bg-white/[0.08] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all shadow-inner"
            />
          </div>

          {/* 
            Branch & Semester Grid:
            Elevated to z-40 so the spring-animated dropdown menu floats on top of
            subsequent form rows (Document Category and PDF Dropzone) with zero clipping or overlap!
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
                ACADEMIC BRANCH <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <AnimatedFilterDropdown
                selectedId={branch}
                options={BRANCH_OPTIONS}
                onSelect={(id) => setBranch(id as AcademicBranch)}
                fullWidth
                searchable={false}
                triggerClassName="h-11 rounded-xl border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl text-xs sm:text-sm text-[var(--text-primary)] hover:border-[var(--brand-primary)] shadow-inner"
                panelClassName="backdrop-blur-2xl bg-white/95 dark:bg-[#0E1612]/95 border border-black/10 dark:border-white/15 shadow-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
                SEMESTER (1–8) <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <AnimatedFilterDropdown
                selectedId={semester}
                options={SEMESTER_OPTIONS}
                onSelect={(id) => {
                  const sem = Number(id) as AcademicSemester;
                  setSemester(sem);
                  if (sem === 1 || sem === 2) {
                    setBranch("ALL");
                  }
                }}
                fullWidth
                searchable={false}
                triggerClassName="h-11 rounded-xl border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl text-xs sm:text-sm text-[var(--text-primary)] hover:border-[var(--brand-primary)] shadow-inner"
                panelClassName="backdrop-blur-2xl bg-white/95 dark:bg-[#0E1612]/95 border border-black/10 dark:border-white/15 shadow-2xl"
              />
            </div>
          </div>

          {/* Document Category Liquid Glass Selector with Academic Vault HoverButtons (z-20) */}
          <div className="space-y-2 relative z-20">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              DOCUMENT CATEGORY <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORY_OPTIONS.map((c) => (
                <HoverButton
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className="font-mono text-xs py-2.5 px-3 rounded-xl w-full justify-center h-10"
                >
                  {c.label}
                </HoverButton>
              ))}
            </div>
          </div>

          {/* PDF File Dropzone (z-10) */}
          <div className="space-y-2 relative z-10">
            <label className="block text-[11px] font-mono text-[var(--text-secondary)] tracking-wider">
              ATTACH PDF PAYLOAD <span className="text-[var(--brand-primary)]">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed ${
                compressing
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.04] shadow-[0_0_30px_rgba(0,194,105,0.25)]"
                  : "border-black/15 dark:border-white/20 hover:border-[var(--brand-primary)] bg-white/30 dark:bg-white/[0.03] hover:shadow-[0_0_30px_rgba(0,194,105,0.2)]"
              } rounded-2xl p-7 text-center backdrop-blur-xl transition-all group cursor-pointer`}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={compressing}
                className={`absolute inset-0 w-full h-full opacity-0 ${
                  compressing ? "cursor-not-allowed" : "cursor-pointer"
                } z-20`}
                aria-label="Upload PDF document"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                {compressing ? (
                  <>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center shadow-[0_0_25px_rgba(0,194,105,0.35)]">
                        <Zap className="w-6 h-6 animate-bounce text-[var(--brand-primary)]" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--brand-primary)]"></span>
                      </span>
                    </div>
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[var(--brand-primary)] font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          AUTO-COMPRESSING
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {compressionProgress?.percent || 15}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,194,105,0.5)]"
                          style={{ width: `${compressionProgress?.percent || 15}%` }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                        {compressionProgress?.stage || "Optimizing PDF payload below 4.5 MB ceiling..."}
                      </p>
                    </div>
                  </>
                ) : file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 text-xs font-mono text-[var(--brand-primary)] font-semibold">
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {file.name} (
                        {file.size / (1024 * 1024) >= 1
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(file.size / 1024).toFixed(1)} KB`}
                        )
                      </span>
                    </div>
                    {compressionStats && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>
                          Auto-Compressed:{" "}
                          {(compressionStats.originalSize / (1024 * 1024)).toFixed(1)} MB →{" "}
                          {(compressionStats.finalSize / (1024 * 1024)).toFixed(1)} MB (
                          {compressionStats.savingsPct}% saved)
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">
                      Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,194,105,0.2)]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                      Drag &amp; drop PDF here, or click to browse files
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
                      PDF DOCUMENTS ONLY • AUTO-COMPRESSED IF OVER 4.5 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action with 21st.dev FlowHoverButton (z-10) */}
          <div className="pt-2 relative z-10 flex justify-start">
            <FlowHoverButton
              type="submit"
              disabled={loading || compressing}
              icon={
                compressing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
              className="w-full sm:w-auto h-12 min-w-[280px]"
            >
              {compressing
                ? "AUTO-COMPRESSING PDF..."
                : loading
                ? "TRANSMITTING TO MODERATION..."
                : "TRANSMIT TO FACULTY REVIEW"}
            </FlowHoverButton>
          </div>
        </form>
      )}
    </div>
  );
}

export default ResourceUploadForm;
