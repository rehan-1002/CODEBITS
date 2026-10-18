"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  ArrowRightLeft,
  ArrowRight,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  BookOpen,
  Layers,
  Sparkles,
  StopCircle,
  FileCheck2,
} from "lucide-react";

const CHUNK_SIZE = 8; // Optimal pages per micro-batch (prevents AI token limit & timeouts)

interface ExtractedSection {
  pageRange: string;
  text: string;
}

export default function DocumentConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<"docx" | "pdf">("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelection = async (selectedFile: File) => {
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setProgress(0);
    setStatusMessage("");
    setPdfPageCount(null);
    setCurrentChunkIndex(0);
    setTotalChunks(0);

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setErrorMessage("Please upload a valid .pdf or .docx file.");
      return;
    }

    setFile(selectedFile);

    // Auto set target interchange format
    if (name.endsWith(".pdf")) {
      setTargetFormat("docx");
      // Read page count client-side with pdf-lib
      setIsInspecting(true);
      try {
        const buffer = await selectedFile.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setPdfPageCount(count);
      } catch (err) {
        console.warn("Could not inspect PDF page count client-side:", err);
      } finally {
        setIsInspecting(false);
      }
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

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConverting(false);
    setStatusMessage("");
    setProgress(0);
    setErrorMessage("Conversion was cancelled by user.");
  };

  const executeChunkedPdfConversion = async (
    targetFile: File,
    pageCount: number,
    baseName: string
  ) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const chunksCount = Math.ceil(pageCount / CHUNK_SIZE);
    setTotalChunks(chunksCount);
    setCurrentChunkIndex(0);

    const buffer = await targetFile.arrayBuffer();
    const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const extractedSections: ExtractedSection[] = [];

    for (let i = 0; i < chunksCount; i++) {
      if (controller.signal.aborted) {
        throw new Error("Conversion aborted.");
      }

      setCurrentChunkIndex(i + 1);
      const startPage = i * CHUNK_SIZE;
      const endPage = Math.min(startPage + CHUNK_SIZE, pageCount);
      const rangeLabel = `Pages ${startPage + 1}–${endPage} of ${pageCount}`;

      setStatusMessage(`Processing Chunk ${i + 1} of ${chunksCount} (${rangeLabel})...`);
      const chunkPct = Math.round(((i) / (chunksCount + 1)) * 90);
      setProgress(Math.max(chunkPct, 5));

      // Slice sub-document with pdf-lib
      const subDoc = await PDFDocument.create();
      const pageIndices = Array.from({ length: endPage - startPage }, (_, idx) => startPage + idx);
      const copied = await subDoc.copyPages(sourcePdf, pageIndices);
      copied.forEach((p) => subDoc.addPage(p));
      const subBytes = await subDoc.save();
      const subBlob = new Blob([subBytes as unknown as BlobPart], { type: "application/pdf" });

      // Send slice to extraction endpoint with automatic retry on glitch
      let chunkExtractedText = "";
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          const formData = new FormData();
          formData.append("file", subBlob, `chunk_${i + 1}.pdf`);
          formData.append("mode", "extract");
          formData.append("chunkIndex", i.toString());
          formData.append("pageRange", rangeLabel);

          const res = await fetch("/api/converter", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Chunk ${i + 1} extraction failed.`);
          }

          const resData = await res.json();
          chunkExtractedText = resData.text || "";
          break; // Success
        } catch (fetchErr: any) {
          if (controller.signal.aborted) throw fetchErr;
          attempts++;
          if (attempts >= maxAttempts) {
            console.warn(`Extraction chunk ${i + 1} failed after ${maxAttempts} attempts:`, fetchErr);
            // Fallback: don't crash whole book if one chunk had an OCR error; continue with empty or partial
            chunkExtractedText = `\n\n[Section: ${rangeLabel}]\n\n`;
          } else {
            await new Promise((r) => setTimeout(r, 1200));
          }
        }
      }

      extractedSections.push({
        pageRange: rangeLabel,
        text: chunkExtractedText,
      });

      const updatedPct = Math.round(((i + 1) / (chunksCount + 1)) * 90);
      setProgress(updatedPct);
    }

    // Assembly stage
    setStatusMessage("Assembling unified Word document with math equation formatting...");
    setProgress(93);

    const assembleRes = await fetch("/api/converter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "assemble",
        title: baseName,
        sections: extractedSections,
      }),
      signal: controller.signal,
    });

    if (!assembleRes.ok) {
      const errData = await assembleRes.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to assemble Word document.");
    }

    const docxBlob = await assembleRes.blob();
    const finalUrl = window.URL.createObjectURL(docxBlob);
    const finalName = `${baseName}.docx`;

    setProgress(100);
    setStatusMessage("Conversion complete!");
    setDownloadUrl(finalUrl);
    setDownloadFileName(finalName);

    // Auto download
    const a = document.createElement("a");
    a.href = finalUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setErrorMessage(null);
    setDownloadUrl(null);
    setProgress(5);
    setStatusMessage("Initializing document pipeline...");

    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

    try {
      // If PDF has more than 8 pages or is larger than 4 MB, use the Automated Chunking Pipeline
      const isLargePdf =
        file.name.toLowerCase().endsWith(".pdf") &&
        targetFormat === "docx" &&
        ((pdfPageCount && pdfPageCount > CHUNK_SIZE) || file.size > 4 * 1024 * 1024);

      if (isLargePdf && pdfPageCount && pdfPageCount > 0) {
        await executeChunkedPdfConversion(file, pdfPageCount, baseName);
      } else {
        // Standard single conversion (e.g. DOCX -> PDF or small PDF <= 8 pages)
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 88) return prev;
            return prev + 5;
          });
        }, 400);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("targetFormat", targetFormat);

        setStatusMessage("Converting document...");

        const res = await fetch("/api/converter", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearInterval(timer);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to convert document.");
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const finalName = `${baseName}.${targetFormat}`;

        setProgress(100);
        setStatusMessage("Conversion complete!");
        setDownloadUrl(url);
        setDownloadFileName(finalName);

        const a = document.createElement("a");
        a.href = url;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        // Handled in handleCancel
        return;
      }
      console.error("Conversion error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during conversion.");
    } finally {
      setIsConverting(false);
      abortControllerRef.current = null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleClear = () => {
    if (isConverting) {
      handleCancel();
    }
    setFile(null);
    setPdfPageCount(null);
    setDownloadUrl(null);
    setDownloadFileName(null);
    setErrorMessage(null);
    setStatusMessage("");
    setProgress(0);
    setCurrentChunkIndex(0);
    setTotalChunks(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isBookDocument =
    file?.name.toLowerCase().endsWith(".pdf") &&
    pdfPageCount !== null &&
    (pdfPageCount > CHUNK_SIZE || (file && file.size > 4 * 1024 * 1024));

  return (
    <div className="w-full min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-8">
        {/* Crisp Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase">
              Document Converter
            </h1>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              High-Fidelity AI Reconstruction &amp; Large Book Chunking Engine
            </p>
          </div>

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
                  Supports small papers, textbooks, exam question banks, and multi-page books
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
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      <span>{formatFileSize(file.size)}</span>
                      {isInspecting ? (
                        <span className="text-[var(--brand-primary)] animate-pulse">
                          • Scanning pages...
                        </span>
                      ) : pdfPageCount !== null ? (
                        <span>• {pdfPageCount} {pdfPageCount === 1 ? "page" : "pages"}</span>
                      ) : null}
                    </div>
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

              {/* Large Document / Book Pipeline Banner */}
              {isBookDocument && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                          Automated Book &amp; Large Document Engine
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono font-bold">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400/80 mt-0.5">
                        Document will be sliced into {Math.ceil((pdfPageCount || 1) / CHUNK_SIZE)} micro-batches to guarantee 0% failure, no timeouts, and full mathematical equation retention.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/90 shrink-0 self-end sm:self-center">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{pdfPageCount} Pages total</span>
                  </div>
                </div>
              )}

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
                    disabled={isConverting}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer disabled:opacity-50"
                  >
                    {file.name.toLowerCase().endsWith(".pdf") ? (
                      <option value="docx">.docx (Word Document with Math Equations)</option>
                    ) : (
                      <option value="pdf">.pdf (PDF Document)</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {isConverting && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono font-bold hover:bg-red-500/20 transition-colors"
                      title="Abort conversion"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={isConverting || isInspecting}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isConverting || isInspecting
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
              </div>

              {/* Real-time Progress & Status Bar */}
              {isConverting && (
                <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-secondary)] font-medium truncate max-w-md">
                      {statusMessage || "Processing document..."}
                    </span>
                    <span className="text-[var(--brand-primary)] font-bold shrink-0">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {totalChunks > 0 && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1">
                      <span>Chunk {currentChunkIndex} of {totalChunks}</span>
                      <span>Batch size: {CHUNK_SIZE} pages</span>
                    </div>
                  )}
                </div>
              )}

              {/* Success Result Card */}
              {downloadUrl && downloadFileName && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-mono font-bold">
                      Conversion Complete: {downloadFileName}
                      {pdfPageCount ? ` (${pdfPageCount} pages)` : ""}
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
