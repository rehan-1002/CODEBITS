"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Formats and renders mathematical expressions using KaTeX.
 * Supports:
 * - Block math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Markdown bold (**text**) & italic (*text*)
 * - Auto-detection of unescaped LaTeX math commands (e.g. \sqrt, \frac, \csc)
 */
export function formatMathText(rawText: string): string {
  if (!rawText) return "";

  let processed = rawText;

  // Pre-clean unbackslashed set theory operations & overlines
  processed = processed.replace(/\b([A-Z0-9\)])\s+(?:setminus|set\s*minus)\s+([A-Z0-9\(])/gi, "$1 \\setminus $2");
  processed = processed.replace(/\b([A-Z0-9\)])\s+oplus\s+([A-Z0-9\(])/gi, "$1 \\oplus $2");
  processed = processed.replace(/\boverline([A-Za-z0-9])\b/g, "\\overline{$1}");
  processed = processed.replace(/\\?overline\s*\{?([A-Za-z0-9])\}?/g, "\\overline{$1}");
  // Convert bare set difference and symmetric difference statements into inline math if not already delimited
  processed = processed.replace(/(?<!\$)\b([A-C]\s*(?:\\setminus|∖|\\oplus|⊕)\s*\(?[A-C][\s\w()\\∖\-∩∪⊕]*\)?)(?!\$)/gi, "$ $1 $");

  // 1. Double dollar or \[...\] display math: $$math$$ or \[math\]
  processed = processed.replace(/(?:\$\$|\\\[)([\s\S]+?)(?:\$\$|\\\])/g, (_, math) => {
    try {
      return `<div class="katex-display my-2.5 py-1.5 px-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center overflow-x-auto text-[var(--text-primary)]">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return `<span class="font-mono text-emerald-600 dark:text-emerald-400 text-xs">${math}</span>`;
    }
  });

  // 2. Single dollar or \(...\) inline math: $math$ or \(math\)
  processed = processed.replace(/(?:\$|\\\()([^\$\n]+?)(?:\$|\\\))/g, (_, math) => {
    try {
      return `<span class="inline-math px-0.5 inline-block align-baseline">${katex.renderToString(
        math.trim(),
        { displayMode: false, throwOnError: false }
      )}</span>`;
    } catch {
      return `<span class="font-mono text-emerald-600 dark:text-emerald-400 text-xs">${math}</span>`;
    }
  });

  // 3. Fallback: Auto-detect any leftover LaTeX expressions containing \frac, \sqrt, \csc, \sin, \cos, \tan, etc.
  processed = processed.replace(/\\(sqrt|frac|csc|sin|cos|tan|log|lim|int|sum|prod|theta|alpha|beta|lambda|pi|infty|partial|setminus|oplus|cup|cap|subset|subseteq|emptyset|overline|therefore|because)\b[^\s<]*/g, (match) => {
    try {
      return `<span class="inline-math px-0.5 inline-block align-baseline">${katex.renderToString(
        match.trim(),
        { displayMode: false, throwOnError: false }
      )}</span>`;
    } catch {
      return match;
    }
  });

  // 4. Markdown Bold: **text**
  processed = processed.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-[var(--text-primary)] font-bold">$1</strong>'
  );

  // 5. Markdown Italic: *text*
  processed = processed.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    '<em class="italic text-[var(--text-secondary)]">$1</em>'
  );

  return processed;
}

export function MathRenderer({ text, className = "" }: MathRendererProps) {
  const html = useMemo(() => formatMathText(text), [text]);

  return (
    <span
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MathRenderer;
