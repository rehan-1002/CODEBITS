import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";

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

  // 7. Exponents & Superscripts
  s = formatSuperscripts(s);

  // 8. Subscripts
  s = s.replace(/_\{([^{}]+)\}/g, (_, sub) => {
    return sub.split("").map((c: string) => SUBSCRIPT_MAP[c] || c).join("");
  });
  s = s.replace(/_([0-9nijkyx])/g, (_, idx) => SUBSCRIPT_MAP[idx] || idx);
  s = s.replace(/\b([xyz])([0-9])\b/g, (_, v, idx) => v + (SUBSCRIPT_MAP[idx] || idx));

  // 9. Greek Letters (all standard KaTeX symbols)
  s = s.replace(/\\alpha\b/gi, "α");
  s = s.replace(/\\beta\b/gi, "β");
  s = s.replace(/\\gamma\b/gi, "γ");
  s = s.replace(/\\delta\b/gi, "δ");
  s = s.replace(/\\epsilon\b|\\varepsilon\b/gi, "ε");
  s = s.replace(/\\zeta\b/gi, "ζ");
  s = s.replace(/\\eta\b/gi, "η");
  s = s.replace(/\\theta\b/gi, "θ");
  s = s.replace(/\\iota\b/gi, "ι");
  s = s.replace(/\\kappa\b/gi, "κ");
  s = s.replace(/\\lambda\b/gi, "λ");
  s = s.replace(/\\mu\b/gi, "μ");
  s = s.replace(/\\nu\b/gi, "ν");
  s = s.replace(/\\xi\b/gi, "ξ");
  s = s.replace(/\\pi\b|\bpi\b/gi, "π");
  s = s.replace(/\\rho\b/gi, "ρ");
  s = s.replace(/\\sigma\b/gi, "σ");
  s = s.replace(/\\tau\b/gi, "τ");
  s = s.replace(/\\upsilon\b/gi, "υ");
  s = s.replace(/\\phi\b|\\varphi\b/gi, "φ");
  s = s.replace(/\\chi\b/gi, "χ");
  s = s.replace(/\\psi\b/gi, "ψ");
  s = s.replace(/\\omega\b/gi, "ω");
  s = s.replace(/\\Gamma\b/g, "Γ");
  s = s.replace(/\\Delta\b/g, "Δ");
  s = s.replace(/\\Theta\b/g, "Θ");
  s = s.replace(/\\Lambda\b/g, "Λ");
  s = s.replace(/\\Sigma\b/g, "Σ");
  s = s.replace(/\\Phi\b/g, "Φ");
  s = s.replace(/\\Psi\b/g, "Ψ");
  s = s.replace(/\\Omega\b/g, "Ω");

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
  if (/^(?:section|part|module)\s*[-–:]?\s*[0-9a-zivx]+/i.test(l) && l.length < 30) return true;

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

/**
 * Intelligent question & sub-question segmentation engine:
 * 1. Ensures EVERY sub-question receives its own dedicated slide.
 * 2. Filters out all exam administration metadata and instructions.
 * 3. Extracts matrix blocks into single continuous 2D matrix definitions.
 * 4. Extracts marks counts ([3 MARKS], [5 MARKS]) into header badges.
 * 5. Extracts Markdown tables into structured presentation tables.
 */
export function splitTextIntoQuestions(raw: string): ParsedQuestion[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw.split("\n");
  const questions: ParsedQuestion[] = [];

  let currentMainQ = ""; // e.g. "Q.1"
  let currentSubQ = "";  // e.g. "a"
  let currentMarks = "";
  let bodyLines: string[] = [];

  const mainQRegex = /^(?:Q(?:uestion)?\.?\s*(\d+)[:\.]?|(\d+)\.|Problem\s*(\d+)[:\.]?)\s*(.*)$/i;
  const subQRegex = /^(?:(?:\(([a-z0-9]+)\)|([a-z0-9]+)\)|([a-z])\.)\s*(.*))$/i;
  const marksRegex = /^\[?(\d{1,2})\s*(?:Marks?|M)?\]?$/i;

  function flush() {
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
    const matrixRegex = /(?:\\begin\{([a-zA-Z]*matrix)\}|begin([a-zA-Z]*matrix))([\s\S]*?)(?:\\end\{\1\}|end\2)/i;
    const matrixMatch = rawBody.match(matrixRegex);

    let matrixData: MatrixQuestionData | undefined = undefined;
    let fullBody = "";

    if (matrixMatch && matrixMatch.index !== undefined) {
      const preTextRaw = rawBody.slice(0, matrixMatch.index);
      const postTextRaw = rawBody.slice(matrixMatch.index + matrixMatch[0].length);
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
        fullBody = cleanTextForSlide(rawBody);
      }
    } else {
      fullBody = cleanTextForSlide(rawBody);
    }

    if (fullBody.length > 0 || tableRows.length > 0 || matrixData) {
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
        flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = subMatchInRemainder[1] || subMatchInRemainder[2] || subMatchInRemainder[3];
        const subText = subMatchInRemainder[4];
        if (subText && !isExamMetadataOrInstruction(subText)) {
          bodyLines.push(subText);
        }
        continue;
      }

      if (isExamMetadataOrInstruction(remainder) || remainder.length === 0) {
        flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = "";
        continue;
      }

      flush();
      currentMainQ = `Q.${qNum}`;
      currentSubQ = "";
      bodyLines.push(remainder);
      continue;
    }

    const subMatch = line.match(subQRegex);
    if (subMatch) {
      flush();
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

  flush();

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
 * Loads the official CodeBits slide template image and converts to base64.
 */
function getTemplateBase64(): string {
  try {
    const publicPath = path.join(process.cwd(), "public", "templates", "codebits-slide-template.png");
    if (fs.existsSync(publicPath)) {
      return fs.readFileSync(publicPath).toString("base64");
    }

    const fallbackPath = path.join(process.cwd(), "codebits", "public", "templates", "codebits-slide-template.png");
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
 * 7. Markdown tables are cleanly rendered as native PowerPoint tables with emerald borders.
 * 8. Dimensions are exact user specs: 101.6 cm (40.0 inches) x 52.07 cm (20.5 inches).
 */
export async function buildPptxPresentation(
  rawText: string,
  title = "CodeBits Question Paper"
): Promise<Buffer> {
  const pres = createPresentationInstance();
  pres.defineLayout({ name: "CODEBITS_CUSTOM", width: 40.0, height: 20.5 });
  pres.layout = "CODEBITS_CUSTOM";
  pres.title = title;

  const bgBase64 = getTemplateBase64();
  const backgroundOption = bgBase64
    ? { data: `image/png;base64,${bgBase64}` }
    : { color: "0B0F0E" };

  const questions = splitTextIntoQuestions(rawText);

  if (questions.length === 0) {
    const slide = pres.addSlide();
    slide.background = backgroundOption;
    slide.addText("CodeBits Presentation", {
      x: 2.5,
      y: 4.0,
      w: 35.0,
      h: 2.0,
      fontFace: "Bookman Old Style",
      fontSize: 80,
      bold: true,
      color: "00C269",
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

    // 1. Question Header Badge (Positioned safely below the green banner at y: 3.0 in)
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
      color: "00C269",
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

    // 3. Normal Question Body & Presentation Tables
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
        border: { pt: 2.5, color: "00C269" },
      });
    }
  }

  const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return buffer;
}
