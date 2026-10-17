"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  ArrowRightLeft,
  ArrowRight,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  X,
} from "lucide-react";

export default function DocumentConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<"docx" | "pdf">("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setProgress(0);

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setErrorMessage("Please upload a valid .pdf or .docx file.");
      return;
    }

    setFile(selectedFile);

    // Auto set target interchange format
    if (name.endsWith(".pdf")) {
      setTargetFormat("docx");
    } else if (name.endsWith(".docx")) {
      setTargetFormat("pdf");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setErrorMessage(null);
    setDownloadUrl(null);
    setProgress(15);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 6;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", targetFormat);

      const res = await fetch("/api/converter", {
        method: "POST",
        body: formData,
      });

      clearInterval(timer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to convert document.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const finalName = `${baseName}.${targetFormat}`;

      setProgress(100);
      setDownloadUrl(url);
      setDownloadFileName(finalName);

      // Trigger automatic instant download
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      clearInterval(timer);
      console.error("Conversion error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleClear = () => {
    setFile(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-8">
        {/* Crisp Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase">
            Document Converter
          </h1>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-xs font-mono text-[var(--brand-primary)] w-fit">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="font-bold">PDF ⇄ DOCX</span>
          </div>
        </div>

        {/* Upload & Conversion Card */}
        <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {!file ? (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-16 px-6 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 ${
                isDragging
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 scale-[0.99]"
                  : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/60 bg-[var(--bg-base)]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />

              <div className="w-14 h-14 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  Drag and drop your file here, or browse
                </p>
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  Accepts .pdf or .docx
                </p>
              </div>
            </div>
          ) : (
            /* Uploaded File Info & Conversion Controls */
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-11 h-11 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 font-mono font-bold text-xs uppercase">
                    {file.name.split(".").pop()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-sm sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Conversion Target Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                <div className="flex items-center gap-3">
                  <label htmlFor="target-format-select" className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Convert to
                  </label>
                  <select
                    id="target-format-select"
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as "docx" | "pdf")}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    {file.name.toLowerCase().endsWith(".pdf") ? (
                      <option value="docx">.docx (Word Document)</option>
                    ) : (
                      <option value="pdf">.pdf (PDF Document)</option>
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isConverting
                      ? "bg-[var(--brand-primary)]/50 text-black cursor-not-allowed"
                      : "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-black active:scale-95"
                  }`}
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Converting ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <span>Convert &amp; Download</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Success Result Card */}
              {downloadUrl && downloadFileName && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-mono font-bold">
                      Conversion Complete: {downloadFileName}
                    </span>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-colors w-fit"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Again</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
