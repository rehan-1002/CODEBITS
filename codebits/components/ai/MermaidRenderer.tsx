"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { GitBranch, Copy, Check, Code, Eye } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
}

export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);
  const rawId = useId().replace(/:/g, "_");
  const uniqueId = `mermaid_${rawId}`;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || typeof window === "undefined") return;

      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        const isDark = document.documentElement.classList.contains("dark");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDark ? "dark" : "default",
          themeVariables: isDark
            ? {
                primaryColor: "#10b981",
                primaryTextColor: "#ffffff",
                primaryBorderColor: "#059669",
                lineColor: "#6ee7b7",
                secondaryColor: "#1e293b",
                tertiaryColor: "#0f172a",
              }
            : {
                primaryColor: "#059669",
                primaryTextColor: "#ffffff",
                primaryBorderColor: "#047857",
                lineColor: "#10b981",
                secondaryColor: "#f1f5f9",
                tertiaryColor: "#e2e8f0",
              },
        });

        // Clean up common markdown artifacts
        let cleanChart = chart.trim();
        if (cleanChart.startsWith("```mermaid")) {
          cleanChart = cleanChart.slice(10).trim();
        }
        if (cleanChart.endsWith("```")) {
          cleanChart = cleanChart.slice(0, -3).trim();
        }

        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setHasError(false);
        }
      } catch (err) {
        console.warn("Mermaid render error:", err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-[var(--brand-primary)] font-bold">
          <GitBranch className="w-4 h-4" />
          <span>INTERACTIVE ACADEMIC FLOWCHART</span>
        </div>

        <div className="flex items-center space-x-2">
          {!hasError && svgContent && (
            <div className="flex items-center bg-[var(--surface-base)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setViewMode("visual")}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 transition-all ${
                  viewMode === "visual"
                    ? "bg-[var(--brand-primary)] text-white dark:text-black font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Diagram</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("code")}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 transition-all ${
                  viewMode === "code"
                    ? "bg-[var(--brand-primary)] text-white dark:text-black font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Diagram View or Code View */}
      {viewMode === "visual" && !hasError && svgContent ? (
        <div
          ref={containerRef}
          className="p-4 sm:p-6 flex items-center justify-center overflow-x-auto min-h-[220px] bg-[var(--surface-base)]"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <pre className="p-4 font-mono text-xs text-emerald-400 bg-slate-950 overflow-x-auto leading-relaxed whitespace-pre">
          {chart}
        </pre>
      )}
    </div>
  );
}
