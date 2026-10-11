"use client";

import React, { useState, useMemo } from "react";
import katex from "katex";
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Copy,
  Check,
  Cpu,
  Calculator,
  Compass,
  FileText,
  Sparkles,
} from "lucide-react";

interface SolutionRendererProps {
  markdown: string;
  marks?: number;
  subject?: string;
  diagramDescription?: string;
}

// Safely render inline LaTeX math and markdown formatting (bold, italic, code)
// Strictly theme-adaptive: uses CSS variables for full Light & Dark mode fidelity
function renderInlineContent(text: string): string {
  if (!text) return "";

  // 1. Single-line display math if embedded in paragraph: $$math$$
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return `<div class="my-3 py-2 px-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center overflow-x-auto text-[var(--text-primary)]">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return `<code class="font-mono text-emerald-600 dark:text-emerald-400 text-xs">${math}</code>`;
    }
  });

  // 2. Inline math: $math$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<code class="font-mono text-emerald-600 dark:text-emerald-400 text-xs">${math}</code>`;
    }
  });

  // 3. Bold: **text** -> Theme-adaptive primary text (never hardcoded text-white!)
  processed = processed.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-[var(--text-primary)] font-bold">$1</strong>'
  );

  // 4. Italic: *text*
  processed = processed.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    '<em class="text-emerald-700 dark:text-emerald-300 italic font-medium">$1</em>'
  );

  // 5. Inline code: `code`
  processed = processed.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] font-mono text-[var(--brand-primary)] text-xs font-semibold">$1</code>'
  );

  return processed;
}

export type SectionBlock =
  | { type: "paragraph"; text: string }
  | { type: "math"; math: string }
  | { type: "list_item"; badge?: string; title?: string; body: string }
  | { type: "code"; language: string; code: string }
  | { type: "table"; rows: string[][] };

interface ParsedSection {
  title: string;
  type: "definition" | "conditions" | "steps" | "diagram" | "takeaways" | "generic";
  blocks: SectionBlock[];
}

export function SolutionRenderer({
  markdown,
  marks = 5,
  subject,
  diagramDescription,
}: SolutionRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse markdown into rich, sequential semantic blocks
  const sections = useMemo<ParsedSection[]>(() => {
    if (!markdown) return [];

    const lines = markdown.split("\n");
    const result: ParsedSection[] = [];
    let currentSection: ParsedSection = {
      title: "1. Core Academic Concept",
      type: "definition",
      blocks: [],
    };

    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];

    let inDisplayMath = false;
    let mathBuffer: string[] = [];

    let inTable = false;
    let tableBuffer: string[][] = [];

    const flushCurrentSection = () => {
      if (currentSection.blocks.length > 0) {
        result.push({ ...currentSection });
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Code Block / Schematic Handling (``` ... ```)
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = trimmed.slice(3).trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          currentSection.blocks.push({
            type: "code",
            language: codeLanguage || "schematic",
            code: codeBuffer.join("\n"),
          });
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // 2. Multi-line Display Math Handling ($$ ... $$)
      if (trimmed.startsWith("$$")) {
        // Check if closed on the same line: e.g. "$$ formula $$"
        if (trimmed.length > 2 && trimmed.endsWith("$$")) {
          const innerMath = trimmed.slice(2, -2).trim();
          if (innerMath) {
            currentSection.blocks.push({
              type: "math",
              math: innerMath,
            });
          }
          continue;
        }

        // Beginning or ending of a multi-line math block
        if (!inDisplayMath) {
          inDisplayMath = true;
          mathBuffer = [];
          const remainder = trimmed.slice(2).trim();
          if (remainder) mathBuffer.push(remainder);
        } else {
          inDisplayMath = false;
          const remainder = trimmed.slice(0, -2).trim();
          if (remainder) mathBuffer.push(remainder);
          const fullMath = mathBuffer.join("\n").trim();
          if (fullMath) {
            currentSection.blocks.push({
              type: "math",
              math: fullMath,
            });
          }
          mathBuffer = [];
        }
        continue;
      }

      if (inDisplayMath) {
        if (trimmed.endsWith("$$")) {
          inDisplayMath = false;
          const remainder = trimmed.slice(0, -2).trim();
          if (remainder) mathBuffer.push(remainder);
          const fullMath = mathBuffer.join("\n").trim();
          if (fullMath) {
            currentSection.blocks.push({
              type: "math",
              math: fullMath,
            });
          }
          mathBuffer = [];
        } else {
          mathBuffer.push(line);
        }
        continue;
      }

      // 3. Markdown Table Handling
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableBuffer = [];
        }
        // Skip separator line |---|---|
        if (!trimmed.match(/^\|[\s\-:]+\|/)) {
          const cells = trimmed
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          tableBuffer.push(cells);
        }
        continue;
      } else if (inTable) {
        inTable = false;
        if (tableBuffer.length > 0) {
          currentSection.blocks.push({
            type: "table",
            rows: [...tableBuffer],
          });
          tableBuffer = [];
        }
      }

      // 4. Section Header Detection (###, ##, or standalone **Title**)
      const hMatch = trimmed.match(/^(?:###|##)\s*(.+)$/);
      const boldHeaderMatch = trimmed.match(/^\*\*([A-Z0-9\s:,\-\(\)]+)\*\*[:\s]*$/i);

      if (hMatch || (boldHeaderMatch && boldHeaderMatch[1].length < 70)) {
        flushCurrentSection();
        const rawTitle = hMatch ? hMatch[1].trim() : boldHeaderMatch![1].trim();

        let sType: ParsedSection["type"] = "generic";
        const lower = rawTitle.toLowerCase();
        if (lower.includes("definition") || lower.includes("principle") || lower.includes("theory")) {
          sType = "definition";
        } else if (
          lower.includes("condition") ||
          lower.includes("invariant") ||
          lower.includes("property") ||
          lower.includes("law")
        ) {
          sType = "conditions";
        } else if (
          lower.includes("step") ||
          lower.includes("solution") ||
          lower.includes("verification") ||
          lower.includes("derivation") ||
          lower.includes("calculation")
        ) {
          sType = "steps";
        } else if (lower.includes("diagram") || lower.includes("circuit") || lower.includes("schematic")) {
          sType = "diagram";
        } else if (lower.includes("takeaway") || lower.includes("scoring") || lower.includes("rubric")) {
          sType = "takeaways";
        }

        currentSection = {
          title: rawTitle,
          type: sType,
          blocks: [],
        };
        continue;
      }

      // 5. Numbered List Items (e.g. "1. **Equal Number of Vertices**: ...")
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);
      if (numMatch) {
        const badge = numMatch[1];
        const rest = numMatch[2];

        const boldLeadMatch = rest.match(/^\*\*(.+?)\*\*[:\s]*(.*)$/);
        if (boldLeadMatch) {
          currentSection.blocks.push({
            type: "list_item",
            badge,
            title: boldLeadMatch[1],
            body: boldLeadMatch[2],
          });
        } else {
          currentSection.blocks.push({
            type: "list_item",
            badge,
            body: rest,
          });
        }
        continue;
      }

      // 6. Bullet List Items (e.g. "- **Title**: Description" or "* Point")
      const bulletMatch = trimmed.match(/^[\*\-•]\s*(.+)$/);
      if (bulletMatch) {
        const rest = bulletMatch[1];
        const boldLeadMatch = rest.match(/^\*\*(.+?)\*\*[:\s]*(.*)$/);
        if (boldLeadMatch) {
          currentSection.blocks.push({
            type: "list_item",
            title: boldLeadMatch[1],
            body: boldLeadMatch[2],
          });
        } else {
          currentSection.blocks.push({
            type: "list_item",
            body: rest,
          });
        }
        continue;
      }

      // 7. Regular paragraph text line
      if (trimmed) {
        currentSection.blocks.push({
          type: "paragraph",
          text: line,
        });
      }
    }

    if (inTable && tableBuffer.length > 0) {
      currentSection.blocks.push({
        type: "table",
        rows: [...tableBuffer],
      });
    }

    if (inDisplayMath && mathBuffer.length > 0) {
      currentSection.blocks.push({
        type: "math",
        math: mathBuffer.join("\n").trim(),
      });
    }

    flushCurrentSection();
    return result;
  }, [markdown]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getSectionIcon = (type: ParsedSection["type"]) => {
    switch (type) {
      case "definition":
        return <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />;
      case "conditions":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "steps":
        return <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case "diagram":
        return <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case "takeaways":
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-[var(--brand-primary)]" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Structured Exam View with Responsive Light/Dark Cards & KaTeX Math */}
      <div className="flex flex-col gap-4">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                sec.type === "takeaways"
                  ? "border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/[0.04] dark:bg-[var(--brand-primary)]/10 shadow-xs"
                  : sec.type === "conditions"
                  ? "border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 shadow-xs"
                  : "border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50 dark:bg-[var(--surface-elevated)]/30 hover:border-[var(--border-strong)]"
              }`}
            >
              {/* Section Header Banner */}
              <div className="flex items-center space-x-2.5 pb-3 mb-3 border-b border-[var(--border-subtle)]">
                <div className="p-1 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)]">
                  {getSectionIcon(sec.type)}
                </div>
                <h4 className="text-xs sm:text-sm font-mono font-bold tracking-wide text-[var(--text-primary)] uppercase">
                  {sec.title}
                </h4>
              </div>

              {/* Sequential Section Blocks (Maintains exact natural flow) */}
              <div className="space-y-3">
                {sec.blocks.map((block, bIdx) => {
                  if (block.type === "paragraph") {
                    return (
                      <div
                        key={bIdx}
                        dangerouslySetInnerHTML={{
                          __html: renderInlineContent(block.text),
                        }}
                        className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] font-sans break-words"
                      />
                    );
                  }

                  if (block.type === "math") {
                    return (
                      <div
                        key={bIdx}
                        className="my-3 py-3 px-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] overflow-x-auto text-[var(--text-primary)] shadow-xs"
                      >
                        <div
                          className="min-w-fit flex justify-center py-1 text-xs sm:text-sm text-[var(--text-primary)]"
                          dangerouslySetInnerHTML={{
                            __html: katex.renderToString(block.math, {
                              displayMode: true,
                              throwOnError: false,
                            }),
                          }}
                        />
                      </div>
                    );
                  }

                  if (block.type === "list_item") {
                    return (
                      <div
                        key={bIdx}
                        className="p-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] flex items-start space-x-3 transition-colors hover:border-[var(--brand-primary)]/40 shadow-xs"
                      >
                        {/* Step Badge */}
                        {block.badge ? (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[10px] font-mono font-bold text-[var(--brand-primary)] shrink-0 mt-0.5">
                            {block.badge}
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] shrink-0 mt-2 ml-1" />
                        )}

                        <div className="flex-1 text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] font-sans">
                          {block.title && (
                            <div
                              className="font-bold text-[var(--text-primary)] mb-0.5"
                              dangerouslySetInnerHTML={{
                                __html: renderInlineContent(block.title),
                              }}
                            />
                          )}
                          <div
                            className="text-[var(--text-secondary)]"
                            dangerouslySetInnerHTML={{
                              __html: renderInlineContent(block.body),
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (block.type === "code") {
                    return (
                      <div
                        key={bIdx}
                        className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm"
                      >
                        <div className="px-3 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                            <Layers className="w-3.5 h-3.5" />
                            <span>EXAM SKETCH / CIRCUIT SCHEMATIC BLUEPRINT</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(block.code, `code_${idx}_${bIdx}`)}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            {copiedCode === `code_${idx}_${bIdx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedCode === `code_${idx}_${bIdx}` ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3.5 font-mono text-[11px] sm:text-xs text-emerald-400 leading-snug whitespace-pre overflow-x-auto">
                          {block.code}
                        </pre>
                      </div>
                    );
                  }

                  if (block.type === "table") {
                    return (
                      <div key={bIdx} className="my-3 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] font-mono">
                              {block.rows[0]?.map((cell, cIdx) => (
                                <th key={cIdx} className="p-2.5 font-bold">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: renderInlineContent(cell),
                                    }}
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows.slice(1).map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="border-b border-[var(--border-subtle)]/50 last:border-none hover:bg-[var(--surface-elevated)]/40 transition-colors"
                              >
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 text-[var(--text-secondary)]">
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: renderInlineContent(cell),
                                      }}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
