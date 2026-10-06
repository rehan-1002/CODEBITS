"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  EyeOff,
  AlertTriangle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileX,
} from "lucide-react";

interface ProtectedCanvasViewerProps {
  documentId: string;
  fileUrl?: string;
  documentTitle?: string;
  subject?: string;
  scheme?: string;
  studentName?: string;
  studentPhone?: string;
}

export function ProtectedCanvasViewer({
  documentId,
  fileUrl,
  documentTitle = "Mumbai University Academic Document",
  subject = "Mumbai University Engineering",
  scheme = "Mumbai University",
  studentName = "STUDENT",
  studentPhone = "+91 9920336099",
}: ProtectedCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Client-Side Deterrence Controls
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showTemporaryNotice("Context menu suppressed for document protection.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        showTemporaryNotice("Direct printing and saving are disabled in protected viewer.");
      }
    };

    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const showTemporaryNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Helper to dynamically load PDF.js from cdnjs
  const loadPdfJs = useCallback(async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="pdf.js"]') || document.querySelector('script[src*="pdf.min.js"]');
      if (existingScript) {
        const interval = setInterval(() => {
          if ((window as any).pdfjsLib) {
            clearInterval(interval);
            const pdfjs = (window as any).pdfjsLib;
            pdfjs.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(pdfjs);
          }
        }, 50);
        setTimeout(() => {
          clearInterval(interval);
          if ((window as any).pdfjsLib) resolve((window as any).pdfjsLib);
          else reject(new Error("Timeout loading PDF.js"));
        }, 8000);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjs);
        } else {
          reject(new Error("PDF.js library failed to initialize"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js engine from CDN"));
      document.head.appendChild(script);
    });
  }, []);

  // 1. Load the actual PDF document
  useEffect(() => {
    let isCancelled = false;

    async function initPdf() {
      if (!fileUrl) {
        setError("Document source URL is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const pdfjs = await loadPdfJs();
        if (isCancelled || !pdfjs) return;

        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (isCancelled) return;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Failed to load authentic PDF:", err);
        setError(err?.message || "Could not load the authentic PDF document.");
        setLoading(false);
      }
    }

    initPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, loadPdfJs]);

  // 2. Render the authentic PDF page onto HTML5 Canvas with Forensic Watermarking
  useEffect(() => {
    let cancelRender = false;

    async function renderPage() {
      const pdf = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        setRendering(true);
        const page = await pdf.getPage(currentPage);
        if (cancelRender) return;

        // High DPI sharpness calculation
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const baseScale = 1.35 * zoom;
        const viewport = page.getViewport({ scale: baseScale * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (cancelRender) return;

        // --- Injected Forensic Watermark on top of the rendered PDF page ---
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4.5);
        const fontSize = Math.max(13 * dpr, 15 * zoom * dpr);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = "rgba(0, 160, 80, 0.16)"; // Restrained non-obstructive emerald watermark
        ctx.textAlign = "center";

        const watermarkText = `${studentName} • ${studentPhone || "LICENSED"} • CODEBITS ACADEMIC`;
        const stepY = 150 * zoom * dpr;
        const stepX = 420 * zoom * dpr;

        for (let y = -canvas.height; y <= canvas.height; y += stepY) {
          for (let x = -canvas.width; x <= canvas.width; x += stepX) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();

        setRendering(false);
      } catch (err) {
        if (!cancelRender) {
          console.error("Error rendering authentic PDF page:", err);
          setRendering(false);
        }
      }
    }

    if (!loading && pdfDocRef.current) {
      renderPage();
    }

    return () => {
      cancelRender = true;
    };
  }, [currentPage, zoom, loading, studentName, studentPhone]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] select-none"
    >
      {/* Top Toolbar */}
      <div className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Document Metadata */}
        <div className="flex items-center space-x-3">
          <Link
            href="/vault"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VAULT</span>
          </Link>

          <div className="hidden sm:block">
            <h1 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate max-w-xs md:max-w-md">
              {documentTitle}
            </h1>
            <p className="text-[10px] font-mono text-[var(--brand-primary)]">
              {subject} • {scheme}
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-[var(--text-primary)] px-2">
            PAGE {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Security Badge */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setZoom((z) => Math.max(0.65, +(z - 0.1).toFixed(2)))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-[var(--text-muted)] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(2)))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--brand-primary)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CANVAS RASTERIZED</span>
          </div>
        </div>
      </div>

      {/* Deterrence Notice Popover */}
      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded border border-[var(--brand-dark)] bg-[var(--surface-base)] text-xs font-mono text-[var(--brand-primary)] shadow-lg flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Canvas Document Stage */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[var(--bg-base)] min-h-[calc(100vh-120px)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center my-auto">
            <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
            <p className="font-mono text-xs text-[var(--text-secondary)]">
              Loading authentic academic document...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 my-auto">
            <FileX className="w-10 h-10 text-red-400" />
            <h3 className="text-sm font-bold text-red-300">Document Unavailable</h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono">{error}</p>
            <Link
              href="/vault"
              className="mt-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-black font-bold text-xs"
            >
              Return to Vault
            </Link>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded border border-[var(--border-subtle)] overflow-hidden bg-white">
            {/* HTML5 Canvas Document */}
            <canvas ref={canvasRef} className="block max-w-full h-auto" />

            {/* Subtle rendering overlay indicator */}
            {rendering && (
              <div className="absolute top-3 right-3 p-1.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px] flex items-center space-x-1.5 z-10">
                <Loader2 className="w-3 h-3 animate-spin text-[var(--brand-primary)]" />
                <span>Rendering...</span>
              </div>
            )}

            {/* Window Blur Obscuring Shield */}
            {isWindowBlurred && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-3 z-20">
                <div className="w-12 h-12 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-center text-[var(--brand-primary)]">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Document Protected
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs font-mono">
                  Canvas view obscured while window is unfocused. Click anywhere to resume study session.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Disclaimer Banner */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-2 text-[11px] font-mono text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-1">
        <div className="flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
          <span>FORENSICALLY STAMPED TO {studentName} ({studentPhone})</span>
        </div>
        <div>CLIENT DETERRENCE ACTIVE • AUTHENTIC CANVAS RENDERED</div>
      </div>
    </div>
  );
}
