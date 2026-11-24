"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { GitBranch } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
}

function sanitizeMermaidChart(rawChart: string): string {
  let text = rawChart.trim();
  if (text.startsWith("```mermaid")) text = text.slice(10);
  else if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  text = text.trim();

  if (!text.startsWith("flowchart") && !text.startsWith("graph")) {
    text = `flowchart TD\n${text}`;
  }

  const lines = text.split("\n");
  const sanitizedLines: string[] = [];

  for (const line of lines) {
    let l = line.trim();
    if (!l) continue;

    // Quote unquoted edge labels: e.g. -- A is 0 (Positive/Zero) -->
    l = l.replace(/--\s*([^"\->\n|]+?)\s*-->/g, (match, p1) => {
      const clean = p1.trim();
      return `-- "${clean}" -->`;
    });

    // Replace unescaped < and > inside node labels with entities
    l = l.replace(/([{\[\(])([^{}\[\]\(\)]*?[<>][^{}\[\]\(\)]*?)([}\]\)])/g, (match, open, inner, close) => {
      const cleanInner = inner.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "");
      return `${open}"${cleanInner}"${close}`;
    });

    sanitizedLines.push(l);
  }

  return sanitizedLines.join("\n");
}

export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
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

        const cleanChart = sanitizeMermaidChart(chart);

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

  if (hasError || !svgContent) {
    return null;
  }

  return (
    <div className="my-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center text-xs font-mono">
        <div className="flex items-center space-x-2 text-[var(--brand-primary)] font-bold">
          <GitBranch className="w-4 h-4" />
          <span>FLOWCHART / DIAGRAM</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="p-4 sm:p-6 flex items-center justify-center overflow-x-auto min-h-[220px] bg-[var(--surface-base)]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
