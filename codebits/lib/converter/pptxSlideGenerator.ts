import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { generateVennSvg } from "./vennDiagramGenerator";

// Safe constructor resolver for ESM / CJS bundlers
function createPresentationInstance(): pptxgen {
  const ctor: any = typeof pptxgen === "function" ? pptxgen : (pptxgen as any)?.default || pptxgen;
  return new ctor();
}

export interface MatrixQuestionData {
  preText: string;
  postText: string;
  rows: string[][];
  bracketType: string;
}

export interface ParsedQuestion {
  header: string;
  marks?: string;
  body: string;
  table?: string[][];
  matrix?: MatrixQuestionData;
  diagramPngBase64?: string;
}

/**
 * Parses raw matrix LaTeX content into structured 2D rows and columns.
 */
function parseMatrixContent(content: string): string[][] {
  const rawRows = content
    .split(/(?:@|\\\\|\\cr|\r?\n)/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (rawRows.length === 1) {
    const parts = rawRows[0].split("&").map((p) => p.trim());
    const rowList: string[][] = [];
    let currentRow: string[] = [];
    for (const part of parts) {
      const subTokens = part.trim().split(/\s+/);
      if (subTokens.length >= 2 && currentRow.length >= 1) {
        currentRow.push(subTokens[0]);
        rowList.push(currentRow);
        currentRow = [subTokens.slice(1).join(" ")];
      } else {
        currentRow.push(part);
      }
    }
    if (currentRow.length > 0) rowList.push(currentRow);

    if (rowList.length > 1) return rowList;

    // Fallback: tokenize standard 3x3 or 2x2 matrix elements
    const allTokens = content.replace(/&/g, " ").trim().split(/\s+/).filter(Boolean);
    if (allTokens.length === 9) {
      return [allTokens.slice(0, 3), allTokens.slice(3, 6), allTokens.slice(6, 9)];
    } else if (allTokens.length === 4) {
      return [allTokens.slice(0, 2), allTokens.slice(2, 4)];
    }
  }

  return rawRows.map((r) => r.split("&").map((c) => c.trim()).filter(Boolean));
}

/**
 * Finds the index of the matching closing brace '}' taking nested braces into account.
 */
function findClosingBrace(str: string, startIdx: number): number {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "n": "ⁿ", "x": "ˣ", "i": "ⁱ",
  "a": "ᵃ", "b": "ᵇ", "t": "ᵗ", "k": "ᵏ", "m": "ᵐ"
};

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "n": "ₙ", "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "x": "ₓ", "y": "ᵧ"
};

/**
 * Formats superscripts safely without corrupting subsequent arithmetic operators (+, -).
 */
function formatSuperscripts(text: string): string {
  let s = text.replace(/\^\{([^{}]+)\}/g, (_, exp) => {
    return exp.split("").map((c: string) => SUPERSCRIPT_MAP[c] || c).join("");
  });

  s = s.replace(/\^-([0-9a-zA-Z])/g, (_, char) => "⁻" + (SUPERSCRIPT_MAP[char] || char));
  s = s.replace(/\^([0-9a-zA-Z])/g, (_, char) => SUPERSCRIPT_MAP[char] || char);

  return s;
}

/**
 * Resolves LaTeX fractions (\frac{num}{den}, \dfrac, \tfrac) using balanced brace parsing.
 * Formats numeric fractions into clean unicode (½, ¼, ¾) and algebraic expressions into
 * authentic stacked vertical fractions with a continuous fraction line.
 */
function resolveFractions(text: string): string {
  let s = text;
  const fracRegex = /\\(?:d?frac|tfrac)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = fracRegex.exec(s)) !== null) {
    const numStart = match.index + match[0].length - 1;
    const numEnd = findClosingBrace(s, numStart);
    if (numEnd === -1) break;

    const numerator = s.slice(numStart + 1, numEnd);
    const afterNum = s.slice(numEnd + 1).trimStart();
    if (!afterNum.startsWith("{")) break;

    const denStart = s.indexOf("{", numEnd + 1);
    const denEnd = findClosingBrace(s, denStart);
    if (denEnd === -1) break;

    const denominator = s.slice(denStart + 1, denEnd);
    const fullFrac = s.slice(match.index, denEnd + 1);

    const cNum = cleanTextForSlide(numerator);
    const cDen = cleanTextForSlide(denominator);

    let replacement = "";
    if (cNum === "1" && cDen === "2") replacement = "½";
    else if (cNum === "1" && cDen === "4") replacement = "¼";
    else if (cNum === "3" && cDen === "4") replacement = "¾";
    else if (cNum === "1" && cDen === "3") replacement = "⅓";
    else if (cNum === "2" && cDen === "3") replacement = "⅔";
    else if (cNum.length <= 3 && cDen.length <= 3 && !cNum.includes(" ") && !cDen.includes(" ")) {
      replacement = `(${cNum} / ${cDen})`;
    } else {
      const maxLen = Math.max(cNum.length, cDen.length) + 4;
      const bar = "─".repeat(maxLen);
      const padNum = " ".repeat(Math.floor((maxLen - cNum.length) / 2)) + cNum;
      const padDen = " ".repeat(Math.floor((maxLen - cDen.length) / 2)) + cDen;
      replacement = `\n${padNum}\n${bar}\n${padDen}\n`;
    }

    s = s.replace(fullFrac, replacement);
    fracRegex.lastIndex = match.index + replacement.length;
  }

  return s;
}

/**
 * Normalizes text, symbols, and mathematical equations for clean presentation on PowerPoint slides.
 */
function cleanTextForSlide(raw: string): string {
  if (!raw) return "";

  let s = raw;

  // 1. Clean Markdown code fences and formatting artifacts
  s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");

  // 2. Clean KaTeX Delimiters BEFORE stripping backslashes
  s = s.replace(/\\left\s*\\?\[/g, "[");
  s = s.replace(/\\right\s*\\?\]/g, "]");
  s = s.replace(/\\left\s*\\?\(/g, "(");
  s = s.replace(/\\right\s*\\?\)/g, ")");
  s = s.replace(/\\left\s*\\?\{/g, "{");
  s = s.replace(/\\right\s*\\?\}/g, "}");
  s = s.replace(/\\left\s*\\?\|/g, "|");
  s = s.replace(/\\right\s*\\?\|/g, "|");
  s = s.replace(/\\left\s*\\?\./g, "");
  s = s.replace(/\\right\s*\\?\./g, "");
  s = s.replace(/\\(?:left|right)\b/g, "");

  s = s.replace(/\bleft\\?/gi, "");
  s = s.replace(/\bright\\?\.?/gi, "");
  s = s.replace(/\btright\\?\.?/gi, "");

  // 3. Laplace transforms and text modifiers
  s = s.replace(/\\(?:mathcal|mathscr|mathbf)\{L\}/g, "L");
  s = s.replace(/\\mathcal\{([A-Za-z])\}/g, "$1");
  s = s.replace(/\\mathrm\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\text\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\bm\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\mathbf\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\displaystyle\b/g, "");
  s = s.replace(/\\limits\b/g, "");
  s = s.replace(/\\(?:qquad|quad)\b/g, "  ");

  // 4. Trigonometric and standard transcendental functions
  s = s.replace(/\\tan\^\{-?1\}|\\arctan/g, "tan⁻¹");
  s = s.replace(/\\sin\^\{-?1\}|\\arcsin/g, "sin⁻¹");
  s = s.replace(/\\cos\^\{-?1\}|\\arccos/g, "cos⁻¹");
  s = s.replace(/\\(?:sin|cos|tan|log|ln|sinh|cosh|tanh|sec|csc|cosec|cot|det|exp)\b/g, (m) => m.slice(1));

  // 5. Piecewise / Cases: format \begin{cases} / begincases cleanly
  s = s.replace(/(?:\\begin\{cases\}|begincases)([\s\S]*?)(?:\\end\{cases\}|endcases)/gi, (_, body) => {
    if (body.includes("\\\\") || body.includes("\n")) {
      const rawParts = body.split(/\\\\|\n/).map((p: string) => p.trim()).filter(Boolean);
      return "\n" + rawParts.map((p: string) => "   • " + p.replace(/&/g, "   ")).join("\n");
    }
    const m = body.match(/^([\s\S]+?)\s*&\s*([\s\S]+?)\s+([0-9a-zA-Z\.\-]+)\s*&\s*([\s\S]+)$/i);
    if (m) {
      return `\n   • ${m[1].trim()}   for ${m[2].trim()}\n   • ${m[3].trim()}   ${m[4].trim()}`;
    }
    return "\n   • " + body.replace(/&/g, "   ").trim();
  });

  // 6. Balanced LaTeX Fractions
  s = resolveFractions(s);

  // 7. Degree symbols (65^\circ, 65^{\circ}, 65\degree, 65^circ -> 65°)
  s = s.replace(/(\d+)\s*(?:\^\{?\\*(?:circ|degree)\}?|\^\\*(?:circ|degree)\b|\^circ\b|\\*(?:circ|degree)\b)/gi, "$1°");
  s = s.replace(/\\(?:circ|degree)(?![a-zA-Z])|\^\\*circ/gi, "°");

  // 8. Exponents & Superscripts
  s = formatSuperscripts(s);

  // 9. Subscripts
  s = s.replace(/_\{([^{}]+)\}/g, (_, sub) => {
    return sub.split("").map((c: string) => SUBSCRIPT_MAP[c] || c).join("");
  });
  s = s.replace(/_([0-9nijkyx])/g, (_, idx) => SUBSCRIPT_MAP[idx] || idx);
  s = s.replace(/\b([xyz])([0-9])\b/g, (_, v, idx) => v + (SUBSCRIPT_MAP[idx] || idx));

  // 10. Greek Letters (all standard KaTeX symbols; use (?![a-zA-Z]) so \theta_x, \theta_\gamma, \alpha_1 match properly)
  s = s.replace(/\\alpha(?![a-zA-Z])/gi, "α");
  s = s.replace(/\\beta(?![a-zA-Z])/gi, "β");
  s = s.replace(/\\gamma(?![a-zA-Z])/gi, "γ");
  s = s.replace(/\\delta(?![a-zA-Z])/gi, "δ");
  s = s.replace(/\\epsilon(?![a-zA-Z])|\\varepsilon(?![a-zA-Z])/gi, "ε");
  s = s.replace(/\\zeta(?![a-zA-Z])/gi, "ζ");
  s = s.replace(/\\eta(?![a-zA-Z])/gi, "η");
  s = s.replace(/\\theta(?![a-zA-Z])|\\vartheta(?![a-zA-Z])/gi, "θ");
  s = s.replace(/\\iota(?![a-zA-Z])/gi, "ι");
  s = s.replace(/\\kappa(?![a-zA-Z])/gi, "κ");
  s = s.replace(/\\lambda(?![a-zA-Z])/gi, "λ");
  s = s.replace(/\\mu(?![a-zA-Z])/gi, "μ");
  s = s.replace(/\\nu(?![a-zA-Z])/gi, "ν");
  s = s.replace(/\\xi(?![a-zA-Z])/gi, "ξ");
  s = s.replace(/\\pi(?![a-zA-Z])|\bpi\b/gi, "π");
  s = s.replace(/\\rho(?![a-zA-Z])/gi, "ρ");
  s = s.replace(/\\sigma(?![a-zA-Z])/gi, "σ");
  s = s.replace(/\\tau(?![a-zA-Z])/gi, "τ");
  s = s.replace(/\\upsilon(?![a-zA-Z])/gi, "υ");
  s = s.replace(/\\phi(?![a-zA-Z])|\\varphi(?![a-zA-Z])/gi, "φ");
  s = s.replace(/\\chi(?![a-zA-Z])/gi, "χ");
  s = s.replace(/\\psi(?![a-zA-Z])/gi, "ψ");
  s = s.replace(/(\d+)\s*\\*(?:omega|Omega|ohm|ohms)\b/gi, "$1 Ω");
  s = s.replace(/\\Omega(?![a-zA-Z])/g, "Ω");
  s = s.replace(/\\omega(?![a-zA-Z])/g, "ω");
  s = s.replace(/\\Gamma(?![a-zA-Z])/g, "Γ");
  s = s.replace(/\\Delta(?![a-zA-Z])/g, "Δ");
  s = s.replace(/\\Theta(?![a-zA-Z])/g, "Θ");
  s = s.replace(/\\Lambda(?![a-zA-Z])/g, "Λ");
  s = s.replace(/\\Sigma(?![a-zA-Z])/g, "Σ");
  s = s.replace(/\\Phi(?![a-zA-Z])/g, "Φ");
  s = s.replace(/\\Psi(?![a-zA-Z])/g, "Ψ");

  // Bare Greek names before subscript or math operator (e.g. theta_z, theta_x, alpha_1)
  s = s.replace(/\btheta(?=[_0-9\^])/gi, "θ");
  s = s.replace(/\balpha(?=[_0-9\^])/gi, "α");
  s = s.replace(/\bbeta(?=[_0-9\^])/gi, "β");
  s = s.replace(/\bgamma(?=[_0-9\^])/gi, "γ");
  s = s.replace(/\blambda(?=[_0-9\^])/gi, "λ");
  s = s.replace(/\bomega(?=[_0-9\^])/gi, "ω");
  s = s.replace(/\bphi(?=[_0-9\^])/gi, "φ");

  // 10. Calculus, Sets, and Comparison Operators
  s = s.replace(/<=|\\le(?:q)?\b/g, "≤");
  s = s.replace(/>=|\\ge(?:q)?\b/g, "≥");
  s = s.replace(/!=|\\ne(?:q)?\b/g, "≠");
  s = s.replace(/\\approx\b/g, "≈");
  s = s.replace(/\\equiv\b/g, "≡");
  s = s.replace(/\\infty\b/g, "∞");
  s = s.replace(/\\partial\b/g, "∂");
  s = s.replace(/\\nabla\b/g, "∇");
  s = s.replace(/\\iiint\b/g, "∭");
  s = s.replace(/\\iint\b/g, "∬");
  s = s.replace(/\\int\b/g, "∫");
  s = s.replace(/\\oint\b/g, "∮");
  s = s.replace(/\\sum\b/g, "∑");
  s = s.replace(/\\prod\b/g, "∏");
  s = s.replace(/\\sqrt\b/g, "√");
  s = s.replace(/\\times\b/g, "×");
  s = s.replace(/\\div\b/g, "÷");
  s = s.replace(/\\pm\b/g, "±");
  s = s.replace(/\\mp\b/g, "∓");
  s = s.replace(/\\cdot\b/g, "·");
  s = s.replace(/\\to\b|\\rightarrow\b/g, "→");
  s = s.replace(/\\leftarrow\b/g, "←");
  s = s.replace(/\\Rightarrow\b/g, "⇒");
  s = s.replace(/\\Leftrightarrow\b/g, "⇔");
  s = s.replace(/\\in\b/g, "∈");
  s = s.replace(/\\notin\b/g, "∉");
  s = s.replace(/\\cap\b/g, "∩");
  s = s.replace(/\\cup\b/g, "∪");

  // 11. Clean double parentheses like ((kx / y)) -> (kx / y)
  s = s.replace(/\(\s*\(([^()]+)\)\s*\)/g, "($1)");

  // 12. Clean leftover LaTeX escape backslashes and braces
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\$+/g, "");

  // 13. Clean double spaces and line gaps
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

/**
 * Checks if a line is an administrative exam header, footer, or rule instruction.
 */
function isExamMetadataOrInstruction(line: string): boolean {
  const l = line.trim().toLowerCase();
  if (!l) return false;

  // University / College header lines
  if (/^(?:university|institute|college|department|faculty|examination|semester|branch|subject\s*code|course\s*code)/i.test(l)) return true;
  if (/^(?:time\s*[:=]|duration\s*[:=]|max(?:imum)?\s*marks|total\s*marks|date\s*[:=]|day\s*[:=])/i.test(l)) return true;

  // Section / Part headers
  if (/^(?:section|part|module)\s*[-:]?\s*[0-9a-zivx]+/i.test(l) && l.length < 30) return true;

  // General Instructions & Exam rules
  if (/^(?:n\.?\s*b\.?|note\s*[:.]|instructions?\s*(?:to\s*candidates)?[:.])/i.test(l)) return true;
  if (l.includes("compulsory") && (l.includes("question") || l.includes("q.1") || l.includes("q1"))) return true;
  if (l.includes("attempt any") || l.includes("answer any") || l.includes("solve any")) return true;
  if (l.includes("figures to the right indicate") || l.includes("indicate full marks")) return true;
  if (l.includes("assume suitable data") || l.includes("calculator is allowed") || l.includes("non-programmable")) return true;

  // Page footers, paper codes (e.g. 14664) and page turnover notices
  if (/^page\s*\d+\s*(?:of|\/)\s*\d+$/i.test(l)) return true;
  if (/^page\s*[-:\s]*\d+$/i.test(l)) return true;
  if (/^\[?\d{4,6}\]?$/.test(l)) return true;
  if (/^(?:paper\s*code|q\.?p\.?\s*code|qp\s*code)\s*[:=]?\s*[a-z0-9\-]+/i.test(l)) return true;
  if (/^(?:turn\s*over|p\.?t\.?o\.?|pto)$/i.test(l)) return true;

  return false;
}

export function cleanAndSanitizeSvg(svgStr: string): string {
  let cleaned = svgStr.trim();

  // Ensure valid xmlns
  if (!cleaned.includes("xmlns=")) {
    cleaned = cleaned.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 1. Sanitize all <text> elements: replace raw LaTeX math and dollar signs
  cleaned = cleaned.replace(/<text([^>]*)>([\s\S]*?)<\/text>/gi, (_m, attrs, textContent) => {
    let t = textContent;
    // Replace LaTeX Omega and Ohm symbols
    t = t.replace(/\$*\\*(?:Omega|omega|ohm|ohms)\$*/gi, "Ω");
    t = t.replace(/\$*\\*mu\$*/gi, "μ");
    t = t.replace(/\$*\\*theta\$*/gi, "θ");
    t = t.replace(/\$*\\*alpha\$*/gi, "α");
    t = t.replace(/\$*\\*beta\$*/gi, "β");
    t = t.replace(/\$*\\*Delta\$*/gi, "Δ");
    t = t.replace(/\$*\\*degree\$*/gi, "°");
    t = t.replace(/\$*\\*(?:le|leq)\$*/gi, "≤");
    t = t.replace(/\$*\\*(?:ge|geq)\$*/gi, "≥");
    t = t.replace(/\$*\\*pm\$*/gi, "±");
    t = t.replace(/\$*\\*times\$*/gi, "×");
    t = t.replace(/\$*\\*div\$*/gi, "÷");
    t = t.replace(/\$*\\*sqrt\{([^}]+)\}\$*/gi, "√($1)");
    t = t.replace(/\$([^\$]+)\$/g, "$1"); // remove any leftover $ signs
    t = t.replace(/\\[a-zA-Z]+/g, "");   // strip any stray unrecognized LaTeX slashes
    t = t.trim();

    let newAttrs = attrs;
    if (!newAttrs.includes("font-family")) {
      newAttrs += ' font-family="system-ui, -apple-system, sans-serif"';
    } else {
      newAttrs = newAttrs.replace(/font-family=["'][^"']*["']/gi, 'font-family="system-ui, -apple-system, sans-serif"');
    }
    return `<text${newAttrs}>${t}</text>`;
  });

  // 2. Strip background cards so diagram background remains 100% transparent
  cleaned = cleaned.replace(/<rect[^>]*width=["']100%["'][^>]*height=["']100%["'][^>]*\/?>/gi, "");
  cleaned = cleaned.replace(/<rect[^>]*fill=["'](?:#ffffff|white|#fff)["'][^>]*\/?>/gi, "");

  return cleaned;
}

/**
 * Converts a raster diagram (scanned paper crop) into a razor-sharp, high-definition transparent PNG with yellow (#FFE600) lines and text.
 * Performs Lanczos3 super-sampling upscaling to ensure pristine 300+ DPI clarity on widescreen slides.
 * High-luminance paper background becomes alpha 0 (invisible).
 * Dark ink lines and text become Bookman yellow #FFE600 with smooth anti-aliased edges and zero pixelation.
 */
export async function makeRasterDiagramYellowTransparent(inputBuffer: Buffer): Promise<Buffer> {
  const origMeta = await sharp(inputBuffer).metadata();
  const origW = origMeta.width || 600;

  // Super-sample low-resolution crops to high-definition (minimum 2400px width for crystal-clear 4K slides)
  const targetW = Math.max(2400, Math.min(3600, origW * 4));

  const upscaled = await sharp(inputBuffer)
    .resize({ width: targetW, kernel: sharp.kernel.lanczos3 })
    .normalize()
    .blur(0.5) // anti-grain smoothing to eliminate paper texture and scan noise
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaled;
  const { width, height } = info;
  const out = Buffer.alloc(width * height * 4);

  const tHigh = 220;
  const tLow = 110;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const origA = data[i + 3];

    if (origA === 0) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
      continue;
    }

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let inkAlpha = 0;
    if (lum >= tHigh) {
      inkAlpha = 0;
    } else if (lum <= tLow) {
      inkAlpha = 255;
    } else {
      const ratio = (tHigh - lum) / (tHigh - tLow);
      inkAlpha = Math.round(255 * Math.pow(ratio, 0.95));
    }

    const finalAlpha = Math.round((inkAlpha * origA) / 255);

    if (finalAlpha === 0) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    } else {
      // Yellow color #FFE600 matches Bookman Old Style yellow question font
      out[i] = 255;
      out[i + 1] = 230;
      out[i + 2] = 0;
      out[i + 3] = finalAlpha;
    }
  }

  return await sharp(out, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.0 })
    .png({ compressionLevel: 8 })
    .toBuffer();
}

/**
 * Converts an SVG diagram to an invisible transparent background with yellow (#FFE600) strokes and text.
 */
export async function convertSvgToYellowTransparent(svgStr: string): Promise<Buffer> {
  let cleaned = cleanAndSanitizeSvg(svgStr);

  // Strip all background rectangles
  cleaned = cleaned.replace(/<rect[^>]*width=["']100%["'][^>]*height=["']100%["'][^>]*\/?>/gi, "");
  cleaned = cleaned.replace(/<rect[^>]*fill=["'](?:#ffffff|white|#fff)["'][^>]*\/?>/gi, "");

  // Convert stroke colors to yellow #FFE600
  cleaned = cleaned.replace(/stroke=["'](?:#0f172a|#000000|#000|black|#1e293b|#334155|#475569|currentColor)["']/gi, 'stroke="#FFE600"');
  cleaned = cleaned.replace(/stroke:\s*(?:#0f172a|#000000|#000|black|#1e293b|#334155|#475569)/gi, 'stroke: #FFE600');

  // Convert fill colors for text, arrows, and dots to yellow #FFE600
  cleaned = cleaned.replace(/fill=["'](?:#0f172a|#000000|#000|black|#1e293b|#334155|#475569|currentColor)["']/gi, 'fill="#FFE600"');
  cleaned = cleaned.replace(/fill:\s*(?:#0f172a|#000000|#000|black|#1e293b|#334155|#475569)/gi, 'fill: #FFE600');

  // Make white component interior fills transparent
  cleaned = cleaned.replace(/fill=["'](?:#ffffff|white|#fff)["']/gi, 'fill="none"');

  return await sharp(Buffer.from(cleaned), { density: 300 })
    .png()
    .toBuffer();
}

/**
 * Intelligent question & sub-question segmentation engine:
 * 1. Ensures EVERY sub-question receives its own dedicated slide.
 * 2. Filters out all exam administration metadata and instructions.
 * 3. Extracts matrix blocks into single continuous 2D matrix definitions.
 * 4. Extracts marks counts ([3 MARKS], [5 MARKS]) into header badges.
 * 5. Extracts Markdown tables into structured presentation tables.
 */
export async function splitTextIntoQuestions(raw: string): Promise<ParsedQuestion[]> {
  if (!raw || !raw.trim()) return [];

  // Normalize all em-dashes and en-dashes to standard hyphens
  const normalizedRaw = raw.replace(/[\u2013\u2014]/g, "-");
  const lines = normalizedRaw.split("\n");
  const questions: ParsedQuestion[] = [];

  let currentMainQ = ""; // e.g. "Q.1"
  let currentSubQ = "";  // e.g. "a"
  let currentMarks = "";
  let bodyLines: string[] = [];

  const mainQRegex = /^(?:Q(?:uestion)?\.?\s*(\d+)[:\.]?|(\d+)\.|Problem\s*(\d+)[:\.]?)\s*(.*)$/i;
  const subQRegex = /^(?:(?:\(([a-z0-9]+)\)|([a-z0-9]+)\)|([a-z])\.)\s*(.*))$/i;
  const marksRegex = /^\[?(\d{1,2})\s*(?:Marks?|M)?\]?$/i;

  async function flush() {
    if (bodyLines.length === 0) return;

    const textLines: string[] = [];
    const tableRows: string[][] = [];

    for (const bLine of bodyLines) {
      const trimmed = bLine.trim();
      if (!trimmed) {
        if (textLines.length > 0) textLines.push("");
        continue;
      }

      if (isExamMetadataOrInstruction(trimmed)) {
        continue;
      }

      const mMatch = trimmed.match(marksRegex);
      if (mMatch && trimmed.length <= 10) {
        if (!currentMarks) {
          currentMarks = `${mMatch[1]} Marks`;
        }
        continue;
      }

      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (trimmed.match(/^\|\s*[-:\s|]+\|$/)) {
          continue;
        }
        const cells = trimmed
          .split("|")
          .map((c) => c.trim())
          .slice(1, -1);
        if (cells.length > 0) {
          tableRows.push(cells);
        }
        continue;
      }

      textLines.push(bLine);
    }

    const rawBody = textLines.join("\n");

    // 1. Check for attached diagram image [DIAGRAM_IMAGE: ...] or [IMAGE_ATTACHMENT: ...]
    let diagramPngBase64 = "";
    const diagramImgMatch = rawBody.match(/\[(?:DIAGRAM_IMAGE|IMAGE_ATTACHMENT):\s*(?:data:image\/[^;]+;base64,)?([A-Za-z0-9+/=]+)\]/);
    if (diagramImgMatch) {
      try {
        const rawBuf = Buffer.from(diagramImgMatch[1], "base64");
        const yellowTransparentBuf = await makeRasterDiagramYellowTransparent(rawBuf);
        diagramPngBase64 = yellowTransparentBuf.toString("base64");
      } catch (procErr) {
        console.warn("Could not convert diagram to yellow transparent:", procErr);
        diagramPngBase64 = diagramImgMatch[1];
      }
    }

    // 2. Check for SVG diagram in code block or raw tag: <svg ... </svg>
    const svgMatch = rawBody.match(/<svg[\s\S]*?<\/svg>/i);
    if (!diagramPngBase64 && svgMatch) {
      try {
        const rasterBuf = await convertSvgToYellowTransparent(svgMatch[0]);
        diagramPngBase64 = rasterBuf.toString("base64");
      } catch (svgErr) {
        console.warn("Could not rasterize SVG diagram for slide:", svgErr);
      }
    }

    // 3. Check for Venn diagram request in text (e.g. "Using Venn diagram...", "Venn diagram for A \\ B")
    if (!diagramPngBase64 && /venn\s*diagram/i.test(rawBody)) {
      try {
        const exprMatch = rawBody.match(/(?:for|represent|verify|prove|show|that)\s+([A-Za-z()\\+\-∖⊕∪∩'̄\s]+)/i);
        const expr = exprMatch ? exprMatch[1].trim() : "A ∩ B";
        const vennSvg = generateVennSvg(expr, `Figure: ${expr}`);
        const rasterBuf = await convertSvgToYellowTransparent(vennSvg);
        diagramPngBase64 = rasterBuf.toString("base64");
      } catch (vennErr) {
        console.warn("Could not generate Venn diagram for slide:", vennErr);
      }
    }

    // Clean out diagram markers and raw SVGs from body text
    const cleanRawBody = rawBody
      .replace(/\[(?:DIAGRAM_IMAGE|IMAGE_ATTACHMENT|EXTRACT_BOX|DIAGRAM):[\s\S]*?\]/g, "")
      .replace(/```(?:svg|xml)?[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?```/gi, "")
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      .trim();

    const matrixRegex = /(?:\\begin\{([a-zA-Z]*matrix)\}|begin([a-zA-Z]*matrix))([\s\S]*?)(?:\\end\{\1\}|end\2)/i;
    const matrixMatch = cleanRawBody.match(matrixRegex);

    let matrixData: MatrixQuestionData | undefined = undefined;
    let fullBody = "";

    if (matrixMatch && matrixMatch.index !== undefined) {
      const preTextRaw = cleanRawBody.slice(0, matrixMatch.index);
      const postTextRaw = cleanRawBody.slice(matrixMatch.index + matrixMatch[0].length);
      const matrixBody = matrixMatch[3];
      const bType = matrixMatch[1] || matrixMatch[2] || "bmatrix";
      const rows = parseMatrixContent(matrixBody);

      if (rows.length > 0) {
        matrixData = {
          preText: cleanTextForSlide(preTextRaw),
          postText: cleanTextForSlide(postTextRaw),
          rows,
          bracketType: bType,
        };
      } else {
        fullBody = cleanTextForSlide(cleanRawBody);
      }
    } else {
      fullBody = cleanTextForSlide(cleanRawBody);
    }

    if (fullBody.length > 0 || tableRows.length > 0 || matrixData || diagramPngBase64) {
      let header = currentMainQ || "QUESTION";
      if (currentSubQ) {
        header = `${header} (${currentSubQ.toUpperCase()})`;
      }

      questions.push({
        header,
        marks: currentMarks,
        body: fullBody,
        table: tableRows.length > 0 ? tableRows : undefined,
        matrix: matrixData,
        diagramPngBase64: diagramPngBase64 || undefined,
      });
    }

    bodyLines = [];
    currentMarks = "";
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (bodyLines.length > 0) bodyLines.push("");
      continue;
    }

    if (isExamMetadataOrInstruction(line)) {
      continue;
    }

    const mainMatch = line.match(mainQRegex);
    if (mainMatch) {
      const qNum = mainMatch[1] || mainMatch[2] || mainMatch[3];
      const remainder = (mainMatch[4] || "").trim();

      const subMatchInRemainder = remainder.match(subQRegex);
      if (subMatchInRemainder) {
        await flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = subMatchInRemainder[1] || subMatchInRemainder[2] || subMatchInRemainder[3];
        const subText = subMatchInRemainder[4];
        if (subText && !isExamMetadataOrInstruction(subText)) {
          bodyLines.push(subText);
        }
        continue;
      }

      if (isExamMetadataOrInstruction(remainder) || remainder.length === 0) {
        await flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = "";
        continue;
      }

      await flush();
      currentMainQ = `Q.${qNum}`;
      currentSubQ = "";
      bodyLines.push(remainder);
      continue;
    }

    const subMatch = line.match(subQRegex);
    if (subMatch) {
      await flush();
      currentSubQ = subMatch[1] || subMatch[2] || subMatch[3];
      const subText = subMatch[4];
      if (subText && !isExamMetadataOrInstruction(subText)) {
        bodyLines.push(subText);
      }
      continue;
    }

    const mMatch = line.match(marksRegex);
    if (mMatch && line.length <= 10) {
      if (!currentMarks) {
        currentMarks = `${mMatch[1]} Marks`;
      }
      continue;
    }

    bodyLines.push(line);
  }

  await flush();

  if (questions.length === 0) {
    const paragraphs = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 10 && !isExamMetadataOrInstruction(p));
    paragraphs.forEach((p, idx) => {
      questions.push({
        header: `QUESTION ${idx + 1}`,
        marks: "",
        body: cleanTextForSlide(p),
      });
    });
  }

  return questions;
}

/**
 * Loads the official slide template image (CodeBits or Sonam) and converts to base64.
 */
function getTemplateBase64(template: "codebits" | "sonam" = "codebits"): string {
  try {
    const filename = template === "sonam" ? "sonam-slide-template.png" : "codebits-slide-template.png";
    const publicPath = path.join(process.cwd(), "public", "templates", filename);
    if (fs.existsSync(publicPath)) {
      return fs.readFileSync(publicPath).toString("base64");
    }

    const fallbackPath = path.join(process.cwd(), "codebits", "public", "templates", filename);
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath).toString("base64");
    }
  } catch (err) {
    console.warn("Could not read local slide template image:", err);
  }
  return "";
}

/**
 * Generates an institutional PowerPoint presentation where:
 * 1. ONLY real questions appear (all metadata, rules, instructions excluded).
 * 2. Each sub-question is cleanly isolated onto its own slide.
 * 3. Font is Bookman Old Style, size 80 pt (scaled adaptively for long questions).
 * 4. Question text is high-contrast vibrant yellow (#FFE600).
 * 5. Fractions are rendered as authentic KaTeX-grade stacked fractions.
 * 6. Matrices are rendered as one single, continuous, solid 2D block with zero line-gap breaks.
 * 7. Markdown tables are cleanly rendered as native PowerPoint tables with branded borders.
 * 8. Dimensions are exact user specs: 101.6 cm (40.0 inches) x 52.07 cm (20.5 inches).
 * 9. Supports both "codebits" and "sonam" slide themes with authentic branding.
 */
export async function buildPptxPresentation(
  rawText: string,
  title = "Question Paper",
  template: "codebits" | "sonam" = "codebits"
): Promise<Buffer> {
  const pres = createPresentationInstance();
  const isSonam = template === "sonam";
  const brandAccent = isSonam ? "F11D27" : "00C269";
  const layoutName = isSonam ? "SONAM_CUSTOM" : "CODEBITS_CUSTOM";

  pres.defineLayout({ name: layoutName, width: 40.0, height: 20.5 });
  pres.layout = layoutName;
  pres.title = title;

  const bgBase64 = getTemplateBase64(template);
  const backgroundOption = bgBase64
    ? { data: `image/png;base64,${bgBase64}` }
    : { color: "0B0F0E" };

  const questions = await splitTextIntoQuestions(rawText);

  if (questions.length === 0) {
    const slide = pres.addSlide();
    slide.background = backgroundOption;
    slide.addText(isSonam ? "Sonam Tuitions Presentation" : "CodeBits Presentation", {
      x: 2.5,
      y: 4.0,
      w: 35.0,
      h: 2.0,
      fontFace: "Bookman Old Style",
      fontSize: 80,
      bold: true,
      color: brandAccent,
    });
    slide.addText("No questions were detected in this document.", {
      x: 2.5,
      y: 7.5,
      w: 35.0,
      h: 3.0,
      fontFace: "Bookman Old Style",
      fontSize: 54,
      color: "FFE600",
    });
    const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
    return buffer;
  }

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const slide = pres.addSlide();
    slide.background = backgroundOption;

    // 1. Question Header Badge (Positioned safely below banner at y: 3.0 in)
    const headerTitle = q.marks
      ? `${q.header.toUpperCase()}   •   [${q.marks.toUpperCase()}]`
      : q.header.toUpperCase();

    slide.addText(headerTitle, {
      x: 2.5,
      y: 3.0,
      w: 35.0,
      h: 1.0,
      fontFace: "Bookman Old Style",
      fontSize: 34,
      bold: true,
      color: brandAccent,
    });

    // 2. Continuous 2D Matrix Rendering (Native Vector Brackets + Native Values)
    if (q.matrix) {
      let cursorY = 4.4;

      if (q.matrix.preText.trim().length > 0) {
        slide.addText(q.matrix.preText, {
          x: 2.5,
          y: cursorY,
          w: 35.0,
          h: 1.8,
          fontFace: "Bookman Old Style",
          fontSize: 80,
          color: "FFE600",
          valign: "top",
        });
        cursorY += 2.0;
      }

      const rows = q.matrix.rows;
      const numRows = rows.length;
      const numCols = Math.max(...rows.map((r) => r.length));
      const colW = Math.min(3.6, 32.0 / Math.max(numCols, 1));
      const tableW = colW * numCols;
      const rowH = 1.6;
      const tableH = rowH * numRows;

      const matrixW = tableW + 1.2;
      const matrixH = tableH + 0.4;
      const matrixX = 2.5;

      const bLower = q.matrix.bracketType.toLowerCase();

      // Draw continuous unbroken brackets natively
      if (q.matrix.bracketType === "|" || bLower === "vmatrix") {
        // Determinant vertical lines
        slide.addShape(pres.ShapeType.line, {
          x: matrixX,
          y: cursorY,
          w: 0,
          h: matrixH,
          line: { color: "FFE600", width: 4.5 },
        });
        slide.addShape(pres.ShapeType.line, {
          x: matrixX + matrixW,
          y: cursorY,
          w: 0,
          h: matrixH,
          line: { color: "FFE600", width: 4.5 },
        });
      } else if (q.matrix.bracketType === "(" || bLower === "pmatrix") {
        // Round parentheses / braces
        slide.addShape(pres.ShapeType.bracePair, {
          x: matrixX,
          y: cursorY,
          w: matrixW,
          h: matrixH,
          line: { color: "FFE600", width: 4.5 },
          fill: { type: "none" },
        });
      } else {
        // Default standard square matrix [ ... ] with continuous solid bracket pair
        slide.addShape(pres.ShapeType.bracketPair, {
          x: matrixX,
          y: cursorY,
          w: matrixW,
          h: matrixH,
          line: { color: "FFE600", width: 4.5 },
          fill: { type: "none" },
        });
      }

      // Add native table inside with Bookman Old Style yellow numbers
      const tableData = rows.map((r) =>
        r.map((c) => ({
          text: c,
          options: {
            fontFace: "Bookman Old Style",
            fontSize: 64,
            color: "FFE600",
            bold: true,
            align: "center" as const,
            valign: "middle" as const,
          },
        }))
      );

      slide.addTable(tableData, {
        x: matrixX + 0.6,
        y: cursorY + 0.2,
        w: tableW,
        h: tableH,
        colW: Array(numCols).fill(colW),
        rowH: Array(numRows).fill(rowH),
        border: { type: "none" },
      });

      cursorY += matrixH + 0.5;

      if (q.matrix.postText.trim().length > 0) {
        slide.addText(q.matrix.postText, {
          x: 2.5,
          y: cursorY,
          w: 35.0,
          h: 4.5,
          fontFace: "Bookman Old Style",
          fontSize: 80,
          lineSpacing: 104,
          color: "FFE600",
          valign: "top",
          wrap: true,
        });
      }
      continue;
    }

    // 3. Diagram Rendering (Venn diagrams, BEE circuits, FBDs, Trusses, Schematics)
    if (q.diagramPngBase64) {
      const charLen = q.body.length;
      let diagFontSize = 72;
      let diagLineSpacing = 94;
      let textH = 3.5;

      if (charLen > 250) {
        diagFontSize = 54;
        diagLineSpacing = 72;
        textH = 4.2;
      } else if (charLen > 120) {
        diagFontSize = 62;
        diagLineSpacing = 82;
        textH = 3.8;
      }

      // Check if body is just isolated diagram labels (like "Weight", "Diagram", "Figure", etc.)
      const isJustLabel = /^(?:weight|diagram|figure|xac|xab|kac|kab|kad|[a-z]{1,3}|[a-z]_[a-z0-9]+)\s*$/i.test(q.body.trim());
      const hasRealText = q.body.trim().length > 0 && !isJustLabel;

      if (hasRealText) {
        slide.addText(q.body, {
          x: 2.5,
          y: 4.4,
          w: 35.0,
          h: textH,
          fontFace: "Bookman Old Style",
          fontSize: diagFontSize,
          color: "FFE600",
          lineSpacing: diagLineSpacing,
          valign: "top",
          wrap: true,
        });
      }

      const diagY = hasRealText ? (4.4 + textH + 0.3) : 4.4;
      const maxAvailableH = Math.min(14.8, 20.2 - diagY);

      let imgW = 20.0;
      let imgH = Math.min(11.5, maxAvailableH);
      let imgX = (40.0 - imgW) / 2;

      try {
        const buf = Buffer.from(q.diagramPngBase64, "base64");
        const meta = await sharp(buf).metadata();
        if (meta.width && meta.height) {
          const aspect = meta.width / meta.height;
          const maxDiagW = 22.0;
          const maxDiagH = Math.min(12.0, maxAvailableH);

          imgW = maxDiagW;
          imgH = imgW / aspect;

          if (imgH > maxDiagH) {
            imgH = maxDiagH;
            imgW = imgH * aspect;
          }
          if (imgW > maxDiagW) {
            imgW = maxDiagW;
            imgH = imgW / aspect;
          }
          imgX = (40.0 - imgW) / 2;
        }
      } catch (aspectErr) {
        console.warn("Could not calculate diagram aspect ratio:", aspectErr);
      }

      slide.addImage({
        data: `image/png;base64,${q.diagramPngBase64}`,
        x: imgX,
        y: diagY,
        w: imgW,
        h: imgH,
      });
      continue;
    }

    // 4. Normal Question Body & Presentation Tables
    const hasTable = Boolean(q.table && q.table.length > 0);
    const charCount = q.body.length;

    let fontSize = 80;
    let lineSpacing = 104;

    if (hasTable) {
      fontSize = charCount > 180 ? 54 : 64;
      lineSpacing = 82;
    } else {
      if (charCount > 650) {
        fontSize = 48;
        lineSpacing = 64;
      } else if (charCount > 380) {
        fontSize = 58;
        lineSpacing = 76;
      } else if (charCount > 200) {
        fontSize = 68;
        lineSpacing = 88;
      } else {
        fontSize = 80;
        lineSpacing = 104;
      }
    }

    const textHeight = hasTable ? 4.5 : 14.5;
    if (q.body.trim().length > 0) {
      slide.addText(q.body, {
        x: 2.5,
        y: 4.4,
        w: 35.0,
        h: textHeight,
        fontFace: "Bookman Old Style",
        fontSize,
        color: "FFE600",
        lineSpacing,
        valign: "top",
        wrap: true,
      });
    }

    if (hasTable && q.table) {
      const tableData = q.table.map((row) =>
        row.map((cell) => ({
          text: cell,
          options: {
            fontFace: "Bookman Old Style",
            fontSize: 48,
            color: "FFE600",
            bold: true,
            align: "center" as const,
            valign: "middle" as const,
            fill: { color: "111816" },
          },
        }))
      );

      const numCols = Math.max(...q.table.map((r) => r.length));
      const colWidth = Math.min(3.5, 34.0 / Math.max(numCols, 1));
      const totalTableWidth = colWidth * numCols;
      const tableX = Math.max(2.5, (40.0 - totalTableWidth) / 2);
      const tableY = q.body.trim().length > 0 ? 9.5 : 5.5;

      slide.addTable(tableData, {
        x: tableX,
        y: tableY,
        w: totalTableWidth,
        colW: Array(numCols).fill(colWidth),
        rowH: 1.8,
        border: { pt: 2.5, color: brandAccent },
      });
    }
  }

  const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return buffer;
}
