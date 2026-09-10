"use client";

import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

interface ProtectedCanvasViewerProps {
  documentId: string;
  documentTitle?: string;
  subject?: string;
  scheme?: string;
  studentName?: string;
  studentPhone?: string;
}

export function ProtectedCanvasViewer({
  documentId,
  documentTitle = "Mumbai University Question Paper & Solutions",
  subject = "Applied Mathematics IV",
  scheme = "Mumbai University Engineering",
  studentName = "ATHARVA JOSHI",
  studentPhone = "+91 9876543210",
}: ProtectedCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [zoom, setZoom] = useState(1.0);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Client-Side Deterrence Controls
  useEffect(() => {
    // 1. Context Menu Suppression
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showTemporaryNotice("Context menu suppressed for document protection.");
    };

    // 2. Print / Save Shortcut Interception
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        showTemporaryNotice("Direct printing and saving are disabled in protected viewer.");
      }
    };

    // 3. Window Blur Detection (Obscures document when window loses focus)
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

  // Canvas rasterization simulation with Dynamic Forensic Watermark
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI Canvas Scaling
    const width = 800 * zoom;
    const height = 1100 * zoom;
    canvas.width = width;
    canvas.height = height;

    // Base document paper background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Document header rule
    ctx.fillStyle = "#0B0F0E";
    ctx.font = `bold ${16 * zoom}px sans-serif`;
    ctx.fillText("UNIVERSITY OF MUMBAI", 40 * zoom, 50 * zoom);

    ctx.font = `${12 * zoom}px monospace`;
    ctx.fillStyle = "#64748B";
    ctx.fillText(`${scheme.toUpperCase()} • EXAMINATION REPOSITORY`, 40 * zoom, 70 * zoom);
    ctx.fillText(`COURSE: ${subject.toUpperCase()}`, 40 * zoom, 88 * zoom);

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40 * zoom, 100 * zoom);
    ctx.lineTo(width - 40 * zoom, 100 * zoom);
    ctx.stroke();

    // Document Body simulation lines
    ctx.fillStyle = "#1E293B";
    ctx.font = `${11 * zoom}px sans-serif`;

    const sampleQuestions = [
      `Q${currentPage}.1 Evaluate the Laplace transform of f(t) = e^(-2t) * cos(3t).`,
      `Q${currentPage}.2 Solve using Gauss-Seidel iteration method up to 3 decimal places.`,
      `Q${currentPage}.3 State and prove Cayley-Hamilton theorem for square matrices.`,
      `Q${currentPage}.4 Find the orthogonal trajectories of the family of curves x^2 - y^2 = c.`,
      `Q${currentPage}.5 Find the directional derivative of φ = 2xy + z^2 at point (1, -1, 3).`,
    ];

    sampleQuestions.forEach((q, idx) => {
      ctx.fillText(q, 40 * zoom, (140 + idx * 55) * zoom);
      // Simulated mathematical solution line
      ctx.fillStyle = "#007A3E";
      ctx.font = `italic ${10 * zoom}px monospace`;
      ctx.fillText(`[Verified Solution Step ${idx + 1}: Applied Theorem MU-${scheme.slice(0, 4)}]`, 60 * zoom, (160 + idx * 55) * zoom);
      ctx.fillStyle = "#1E293B";
      ctx.font = `${11 * zoom}px sans-serif`;
    });

    // Page indicator at bottom
    ctx.fillStyle = "#64748B";
    ctx.font = `${10 * zoom}px monospace`;
    ctx.fillText(`PAGE ${currentPage} OF ${totalPages}`, width / 2 - 40 * zoom, height - 30 * zoom);

    // --- Dynamic Forensic Watermark Injection ---
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 4.5);
    ctx.font = `bold ${14 * zoom}px monospace`;
    ctx.fillStyle = "rgba(0, 160, 80, 0.16)"; // Restrained emerald watermark
    ctx.textAlign = "center";

    const watermarkText = `${studentName} • ${studentPhone} • CODEBITS LICENSED`;
    for (let y = -400 * zoom; y <= 400 * zoom; y += 120 * zoom) {
      for (let x = -300 * zoom; x <= 300 * zoom; x += 380 * zoom) {
        ctx.fillText(watermarkText, x, y);
      }
    }
    ctx.restore();
  }, [currentPage, zoom, scheme, subject, studentName, studentPhone]);

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
            disabled={currentPage <= 1}
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
            disabled={currentPage >= totalPages}
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
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-[var(--text-muted)] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}
            className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
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
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[var(--bg-base)]">
        <div className="relative shadow-2xl rounded border border-[var(--border-subtle)] overflow-hidden">
          {/* HTML5 Canvas Document */}
          <canvas ref={canvasRef} className="block max-w-full h-auto" />

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
      </div>

      {/* Security Disclaimer Banner */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-2 text-[11px] font-mono text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-1">
        <div className="flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
          <span>FORENSICALLY STAMPED TO {studentName} ({studentPhone})</span>
        </div>
        <div>CLIENT DETERRENCE ACTIVE • NO IFRAME DEPLOYED</div>
      </div>
    </div>
  );
}
