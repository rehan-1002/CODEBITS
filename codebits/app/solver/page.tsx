"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  Zap,
  ShieldCheck,
  Edit3,
  Layers,
  FileCheck2,
  FileX,
  ChevronRight,
  Maximize2,
  Trash2,
  ArrowRightLeft,
  Download,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SolutionRenderer } from "@/components/ai/SolutionRenderer";
import { MathRenderer } from "@/components/ai/MathRenderer";
import { QuestionListSkeleton, SolutionTerminalSkeleton } from "@/components/ai/SolverSkeletons";

interface ExtractedQuestion {
  id: string;
  qNum: string;
  text: string;
  defaultMarks: number;
  hasDiagram?: boolean;
  diagramType?: string;
  diagramContent?: string;
  diagramVisual?: string;
  module?: string;
  status: "complete" | "incomplete_at_margin";
  hash?: string;
  isCached?: boolean;
  cachedMarks?: number[];
}

interface SolvedResult {
  answerMarkdown: string;
  marks: number;
  qNum: string;
  subject: string;
  cached: boolean;
  modelUsed?: string;
  keyTakeaways?: string[];
  diagramDescription?: string;
}

function QuestionBankSolverContent() {
  const searchParams = useSearchParams();
  const autoLoadedRef = useRef(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<"docx" | "pdf">("docx");
  const [isConvertingDoc, setIsConvertingDoc] = useState(false);
  const [conversionSuccessMsg, setConversionSuccessMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [paperTitle, setPaperTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ExtractedQuestion | null>(null);
  const [selectedMarks, setSelectedMarks] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Solving states
  const [isSolving, setIsSolving] = useState(false);
  const [solvedResult, setSolvedResult] = useState<SolvedResult | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Load auth state
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Client-Side Image Resizer & Canvas Downsampler (<400KB WebP)
  const processImageFile = async (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 2000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ base64: e.target?.result as string, mimeType: file.type });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
          resolve({ base64: compressedDataUrl, mimeType: "image/webp" });
        };
        img.onerror = () => reject(new Error("Failed to render image canvas"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
    });
  };

  // Handle file ingestion
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setErrorNotice(null);
    setConversionSuccessMsg(null);
    setFileName(file.name);
    setUploadedFileObj(file);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx");

    if (isPdf) {
      setTargetFormat("docx");
    } else if (isDocx) {
      setTargetFormat("pdf");
    }

    try {
      setIsScanning(true);
      let base64 = "";
      let mimeType = file.type;

      if (file.type.startsWith("image/")) {
        const processed = await processImageFile(file);
        base64 = processed.base64;
        mimeType = processed.mimeType;
        setFilePreview(base64);
      } else if (isPdf) {
        // PDF read as base64
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read PDF"));
          reader.readAsDataURL(file);
        });
        setFilePreview("/file.svg");
      } else if (isDocx) {
        setFilePreview("/file.svg");
        try {
          const ab = await file.arrayBuffer();
          const mammoth = await import("mammoth");
          const extracted = await mammoth.extractRawText({ arrayBuffer: ab });
          const rawText = extracted.value || "";
          if (rawText.trim()) {
            const response = await fetch("/api/ai/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rawText,
                fileName: file.name,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              setPaperTitle(data.paperTitle);
              setSubject(data.subject);
              setQuestions(data.questions);
              if (data.questions.length > 0) {
                setSelectedQuestion(data.questions[0]);
                setSelectedMarks(data.questions[0].defaultMarks || 5);
              }
            }
          }
        } catch (docxErr) {
          console.warn("Could not extract questions from docx:", docxErr);
        }
        setIsScanning(false);
        return;
      } else {
        throw new Error("Unsupported file type. Please upload a PDF, Word document (.docx), or image.");
      }

      // Execute AI OCR Scan
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          mimeType,
          fileName: file.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to scan questions from document.");
      }

      setPaperTitle(data.paperTitle);
      setSubject(data.subject);
      setQuestions(data.questions);
      if (data.questions.length > 0) {
        setSelectedQuestion(data.questions[0]);
        setSelectedMarks(data.questions[0].defaultMarks || 5);
      }
    } catch (err: any) {
      console.error("Scanning Error:", err);
      let cleanMsg = err?.message || "Failed to scan document.";
      if (cleanMsg.includes("503") || cleanMsg.includes("high demand") || cleanMsg.includes("UNAVAILABLE")) {
        cleanMsg = "Google AI is experiencing a brief traffic spike. Please tap below to retry.";
      }
      setErrorNotice(cleanMsg);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan document if redirected from Academic Vault or Canvas Viewer with ?docId=...
  useEffect(() => {
    const docId = searchParams?.get("docId") || searchParams?.get("resourceId");
    if (!docId || autoLoadedRef.current) return;
    autoLoadedRef.current = true;

    async function loadVaultDoc() {
      try {
        setIsScanning(true);
        setErrorNotice(null);
        const titleParam = searchParams?.get("title");
        const docName = titleParam ? `${titleParam}.pdf` : `vault-document-${docId}.pdf`;
        setFileName(docName);

        const res = await fetch(`/api/resources/${docId}/file`);
        if (!res.ok) {
          throw new Error("Could not retrieve document from Academic Vault.");
        }
        const blob = await res.blob();
        const file = new File([blob], docName, { type: "application/pdf" });
        await handleFileUpload(file);
      } catch (err: any) {
        console.error("Vault doc load error:", err);
        setErrorNotice(err?.message || "Failed to load document from Vault.");
        setIsScanning(false);
      }
    }

    loadVaultDoc();
  }, [searchParams]);

  // Convert uploaded PDF to DOCX or DOCX to PDF
  const handleInlineConvert = async () => {
    if (!uploadedFileObj) return;
    setIsConvertingDoc(true);
    setConversionSuccessMsg(null);
    setErrorNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFileObj);
      formData.append("targetFormat", targetFormat);

      const res = await fetch("/api/converter", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to convert document.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const baseName = uploadedFileObj.name.substring(0, uploadedFileObj.name.lastIndexOf(".")) || uploadedFileObj.name;
      const finalName = `${baseName}.${targetFormat}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setConversionSuccessMsg(`Downloaded ${finalName}`);
      setTimeout(() => setConversionSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Inline conversion error:", err);
      setErrorNotice(err.message || "Failed to convert document.");
    } finally {
      setIsConvertingDoc(false);
    }
  };

  // Clipboard Paste Support (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileUpload(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Drag & drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Solve the currently selected question
  const handleSolveQuestion = async (marksToSolve?: number, forceRefresh = false) => {
    if (!selectedQuestion) return;
    const marks = marksToSolve || selectedMarks;

    setErrorNotice(null);
    setIsSolving(true);
    if (forceRefresh) {
      setSolvedResult(null);
    }

    try {
      const response = await fetch("/api/ai/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: selectedQuestion.text,
          marks,
          subject: subject || "Mumbai University Engineering",
          qNum: selectedQuestion.qNum,
          hasDiagram: selectedQuestion.hasDiagram,
          diagramType: selectedQuestion.diagramType,
          diagramContent: selectedQuestion.diagramContent,
          forceRefresh,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setCooldownSeconds(data.retryAfterSeconds || 30);
        setErrorNotice(data.error || "Rate limit reached. Please wait before generating another solution.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to solve question.");
      }

      setSolvedResult(data);

      // Update cached badges on the question card
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === selectedQuestion.id) {
            const currentCachedMarks = q.cachedMarks || [];
            if (!currentCachedMarks.includes(marks)) {
              currentCachedMarks.push(marks);
            }
            return {
              ...q,
              isCached: true,
              cachedMarks: currentCachedMarks,
            };
          }
          return q;
        })
      );
    } catch (err: any) {
      console.error("Solve Error:", err);
      let cleanMsg = err?.message || "Failed to generate solution. Please try again.";
      if (cleanMsg.includes("503") || cleanMsg.includes("high demand") || cleanMsg.includes("UNAVAILABLE")) {
        cleanMsg = "Google AI is experiencing temporary high traffic. Automatic fallback armed; please tap 'SOLVE' again to retry.";
      }
      setErrorNotice(cleanMsg);
    } finally {
      setIsSolving(false);
    }
  };

  // Save manual edit on question text
  const handleSaveEdit = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return { ...q, text: editedText, status: "complete" as const };
        }
        return q;
      })
    );
    if (selectedQuestion?.id === qId) {
      setSelectedQuestion((prev) => (prev ? { ...prev, text: editedText, status: "complete" } : null));
    }
    setEditingQuestionId(null);
  };

  // Filter questions by search query
  const filteredQuestions = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.qNum.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col transition-colors">
      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Clean Header Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Question Bank <span className="text-[var(--brand-primary)]">Solver</span>
          </h1>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-mono flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 ml-2 cursor-pointer font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 2-Column Split Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Document Ingestion Dropzone & Question List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Liquid Glass Dropzone Chassis */}
            <div
              ref={dropzoneRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl ${
                isDragging
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 scale-[1.01]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />

              {isScanning ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
                  <p className="text-xs font-mono font-bold text-[var(--brand-primary)] tracking-wide">
                    SCANNING DOCUMENT...
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    Deciphering equations, diagrams & questions
                  </p>
                </div>
              ) : filePreview && !filePreview.endsWith(".svg") ? (
                <div className="space-y-3">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                    <Image
                      src={filePreview}
                      alt="Uploaded Document Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span className="truncate max-w-[200px]">{fileName}</span>
                    <span className="text-[var(--brand-primary)] font-bold">CLICK TO CHANGE</span>
                  </div>
                </div>
              ) : uploadedFileObj ? (
                <div className="py-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-xs mx-auto">
                      {fileName}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                      {(uploadedFileObj.size / 1024).toFixed(1)} KB • Document Ready
                    </p>
                  </div>
                  <div className="text-xs font-mono text-[var(--brand-primary)] font-bold">
                    CLICK TO CHANGE FILE
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Drop Question Paper / Notes Here
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                      or click to browse • Paste screenshot with <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px]">Ctrl + V</kbd>
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
                    <span>PDF • DOCX • PNG • JPG • WEBP</span>
                    <span>• Auto Client-Compressed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inline PDF ⇄ Word Converter Widget in AI Solver */}
            {uploadedFileObj && (uploadedFileObj.name.toLowerCase().endsWith(".pdf") || uploadedFileObj.name.toLowerCase().endsWith(".docx")) && (
              <div className="rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--surface-base)] p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                        Convert to
                      </span>
                      <select
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value as "docx" | "pdf")}
                        className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                      >
                        {uploadedFileObj.name.toLowerCase().endsWith(".pdf") ? (
                          <option value="docx">.docx (Word Document)</option>
                        ) : (
                          <option value="pdf">.pdf (PDF Document)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInlineConvert}
                    disabled={isConvertingDoc}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-black text-xs font-mono font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                  >
                    {isConvertingDoc ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Convert &amp; Download</span>
                      </>
                    )}
                  </button>
                </div>

                {conversionSuccessMsg && (
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{conversionSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Questions Panel */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Detected Questions ({questions.length})
                  </span>
                </div>
                {paperTitle && (
                  <span className="text-[11px] font-mono text-[var(--brand-primary)] truncate max-w-[180px]">
                    {paperTitle}
                  </span>
                )}
              </div>

              {/* Question Search / Filter */}
              {questions.length > 0 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter questions by keyword..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>
              )}

              {/* Questions Scrollable Deck */}
              <div
                data-lenis-prevent="true"
                className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto overscroll-contain pr-1 focus:outline-none"
              >
                {isScanning ? (
                  <QuestionListSkeleton count={4} />
                ) : questions.length === 0 ? (
                  <div className="py-12 text-center text-[var(--text-muted)] space-y-2 font-mono text-xs">
                    <FileText className="w-8 h-8 mx-auto opacity-40 text-[var(--brand-primary)]" />
                    <p>No document loaded yet.</p>
                    <p className="text-[11px]">Drop a file above, browse, or paste with Ctrl + V.</p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                    No questions match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isSelected = selectedQuestion?.id === q.id;
                    const isEditing = editingQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          if (!isEditing) {
                            setSelectedQuestion(q);
                            setSelectedMarks(q.defaultMarks || 5);
                          }
                        }}
                        className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer flex flex-col gap-2 relative ${
                          isSelected
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-sm"
                            : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-[var(--brand-primary)]/40"
                        }`}
                      >
                        {/* Question Metadata Header */}
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-[var(--brand-primary)]">{q.qNum}</span>
                            {q.module && (
                              <span className="text-[var(--text-muted)] hidden sm:inline">• {q.module}</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {q.isCached ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
                                ⚡ CACHED
                              </span>
                            ) : null}
                            <span className="px-1.5 py-0.5 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
                              {q.defaultMarks}M
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isEditing) {
                                  handleSaveEdit(q.id);
                                } else {
                                  setEditingQuestionId(q.id);
                                  setEditedText(q.text);
                                }
                              }}
                              title="Edit question text if cut off"
                              className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] p-0.5"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Question Text / Editable Input */}
                        {isEditing ? (
                          <div
                            className="flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="w-full p-2 text-xs rounded bg-[var(--bg-base)] border border-[var(--brand-primary)] font-mono text-[var(--text-primary)]"
                              rows={3}
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingQuestionId(null)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border-subtle)] text-[var(--text-muted)]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(q.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--brand-primary)] text-white dark:text-black font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--text-primary)] leading-relaxed font-sans line-clamp-3">
                            <MathRenderer text={q.text} />
                          </div>
                        )}

                        {/* Diagram badge if figure is detected */}
                        {q.hasDiagram && (
                          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 w-fit">
                            <Layers className="w-3 h-3 shrink-0" />
                            <span>Figure Detected: {q.diagramType ? q.diagramType.toUpperCase() : "DIAGRAM"}</span>
                          </div>
                        )}

                        {/* Truncation warning if photo was cut off */}
                        {q.status === "incomplete_at_margin" && (
                          <div className="flex items-center space-x-1 text-[10px] font-mono text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Margin cut detected: Tap edit icon to fill missing terms</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Marks Selector & Solution Terminal (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Active Question & Marks Selection Dock */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] backdrop-blur-xl p-5 flex flex-col gap-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold tracking-wider uppercase">
                    ACTIVE SELECTION
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedQuestion ? selectedQuestion.qNum : "Select a Question to Solve"}
                  </h3>
                </div>

                {/* Marks Selector Pills (2M, 3M, 4M, 5M, 10M) */}
                <div className="flex items-center space-x-1 bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--border-subtle)]">
                  {[2, 3, 4, 5, 10].map((m) => {
                    const isMarkActive = selectedMarks === m;
                    const isCachedForMark = selectedQuestion?.cachedMarks?.includes(m);

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMarks(m);
                          if (solvedResult && solvedResult.marks !== m) {
                            setSolvedResult(null);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer relative ${
                          isMarkActive
                            ? "bg-[var(--brand-primary)] text-white dark:text-black shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span>{m}M</span>
                        {isCachedForMark && (
                          <span
                            className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
                              isMarkActive ? "bg-white dark:bg-black" : "bg-emerald-600 dark:bg-emerald-400"
                            }`}
                            title="Cached in MongoDB"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedQuestion ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                    <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-sans">
                      <MathRenderer text={selectedQuestion.text} />
                    </div>
                  </div>

                  {/* Detected Diagram / Figure Structure */}
                  {selectedQuestion.hasDiagram && (selectedQuestion.diagramContent || selectedQuestion.diagramVisual) && (
                    <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--brand-primary)]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-1.5 text-[var(--brand-primary)] font-bold">
                          <Layers className="w-3.5 h-3.5" />
                          <span>DETECTED FIGURE ({selectedQuestion.diagramType?.toUpperCase() || "SCHEMATIC"})</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">Verified from document scan</span>
                      </div>

                      {selectedQuestion.diagramContent && (
                        <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                          {selectedQuestion.diagramContent}
                        </p>
                      )}

                      {selectedQuestion.diagramVisual && (
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 whitespace-pre overflow-x-auto leading-tight">
                          {selectedQuestion.diagramVisual}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Action Solve Button with Cooldown Handling */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      <span>Rubric Target: </span>
                      <span className="text-[var(--brand-primary)] font-bold">
                        {selectedMarks === 2
                          ? "Definition + Formula + 2 Points"
                          : selectedMarks === 3
                          ? "Principle + Formula + Example"
                          : selectedMarks <= 5
                          ? "Principle + Diagram + Derivation Steps"
                          : "Full Comprehensive 10-Mark Breakdown"}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isSolving || cooldownSeconds > 0}
                      onClick={() => handleSolveQuestion()}
                      className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white dark:text-black font-mono font-bold text-xs tracking-wider uppercase hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-[var(--brand-primary)]/15 shrink-0"
                    >
                      {isSolving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>SOLVING VIA CODEBITS AI...</span>
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>COOLDOWN ({cooldownSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>SOLVE {selectedMarks} MARKS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs font-mono text-[var(--text-muted)]">
                  Tap any question on the left panel to configure mark evaluation.
                </div>
              )}
            </div>

            {/* Answer Display Terminal */}
            <div
              data-lenis-prevent="true"
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] backdrop-blur-xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm min-h-[350px] overflow-y-auto overscroll-contain max-h-[750px]"
            >
              
              {/* Answer Header Bar */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Mumbai University Official Solution
                  </span>
                </div>

                {solvedResult && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={isSolving || cooldownSeconds > 0}
                      onClick={() => handleSolveQuestion(selectedMarks, true)}
                      className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:text-[var(--brand-primary)] text-[var(--text-muted)] transition-colors cursor-pointer text-xs flex items-center space-x-1 disabled:opacity-40"
                      title="Regenerate fresh solution from AI"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSolving ? "animate-spin" : ""}`} />
                      <span className="text-[10px] font-mono">Regenerate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(solvedResult.answerMarkdown);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:text-[var(--brand-primary)] text-[var(--text-muted)] transition-colors cursor-pointer text-xs flex items-center space-x-1"
                      title="Copy Answer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Answer Content Stage */}
              {isSolving ? (
                <SolutionTerminalSkeleton marks={selectedMarks} />
              ) : solvedResult ? (
                <div className="flex flex-col gap-4">
                  {/* Diagram callout if applicable */}
                  {solvedResult.diagramDescription && (
                    <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--brand-primary)] flex items-center space-x-2">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>{solvedResult.diagramDescription} (Ensure schematic labels match)</span>
                    </div>
                  )}

                  {/* Formatted Answer Body via SolutionRenderer with KaTeX Math & Structured Cards */}
                  <SolutionRenderer
                    markdown={solvedResult.answerMarkdown}
                    marks={solvedResult.marks}
                    subject={solvedResult.subject}
                    diagramDescription={solvedResult.diagramDescription}
                  />
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center space-y-3 text-center my-auto font-mono text-xs text-[var(--text-muted)]">
                  <BookOpen className="w-8 h-8 opacity-40 text-[var(--brand-primary)]" />
                  <p>No solution generated yet.</p>
                  <p className="text-[11px] max-w-xs">
                    Select a question and click &quot;SOLVE {selectedMarks} MARKS&quot; to inspect the official evaluation answer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionBankSolverPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4 font-mono text-xs text-[var(--brand-primary)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
          <p>Initializing cbAI Question Bank Engine...</p>
        </div>
      }
    >
      <QuestionBankSolverContent />
    </Suspense>
  );
}
