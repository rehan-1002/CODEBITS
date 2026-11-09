import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";

// Safe constructor resolver for ESM / CJS bundlers
function createPresentationInstance(): pptxgen {
  const ctor: any = typeof pptxgen === "function" ? pptxgen : (pptxgen as any)?.default || pptxgen;
  return new ctor();
}

export interface ParsedQuestion {
  header: string;
  marks?: string;
  body: string;
  table?: string[][];
}

/**
 * Normalizes text, matrices, and mathematical equations for clean presentation on PowerPoint slides.
 */
function cleanTextForSlide(raw: string): string {
  if (!raw) return "";

  let s = raw;

  // 1. Clean Markdown code fences and formatting artifacts
  s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");

  // 2. Matrices: format LaTeX \begin{bmatrix} / beginbmatrix into clean aligned rows
  s = s.replace(/(?:\\begin\{[a-zA-Z]*matrix\}|begin[a-zA-Z]*matrix)([\s\S]*?)(?:\\end\{[a-zA-Z]*matrix\}|end[a-zA-Z]*matrix)/gi, (_, body) => {
    // If rows separated by \\ or newlines
    if (body.includes("\\\\") || body.includes("\n")) {
      const rawRows = body.split(/\\\\|\n/).map((r: string) => r.trim()).filter(Boolean);
      return "\n" + rawRows.map((r: string) => "  [  " + r.replace(/&/g, "    ").trim() + "  ]").join("\n");
    }
    // Tokenize elements
    const rawTokens = body.replace(/&/g, " ").trim().split(/\s+/).filter(Boolean);
    if (rawTokens.length === 9) {
      // 3x3 matrix
      const r1 = rawTokens.slice(0, 3).join("     ");
      const r2 = rawTokens.slice(3, 6).join("     ");
      const r3 = rawTokens.slice(6, 9).join("     ");
      return `\n  [  ${r1}  ]\n  [  ${r2}  ]\n  [  ${r3}  ]`;
    } else if (rawTokens.length === 4) {
      // 2x2 matrix
      const r1 = rawTokens.slice(0, 2).join("     ");
      const r2 = rawTokens.slice(2, 4).join("     ");
      return `\n  [  ${r1}  ]\n  [  ${r2}  ]`;
    }
    return " [ " + body.replace(/&/g, "  ").trim() + " ]";
  });

  // 3. Piecewise / Cases: format \begin{cases} / begincases cleanly
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

  // 4. Fractions from LaTeX \frac{a}{b} -> (a / b)
  s = s.replace(/\\(?:d?frac|tfrac)\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");

  // 5. Exponents / Superscripts: x^2 -> x², 5^11 -> 5¹¹, e^-x -> e⁻ˣ
  const supMap: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "n": "ⁿ", "x": "ˣ", "i": "ⁱ"
  };
  s = s.replace(/\^\{([0-9+\-nxi]+)\}/g, (_, exp) => exp.split("").map((c: string) => supMap[c] || c).join(""));
  s = s.replace(/\^([0-9+\-nxi]+)/g, (_, exp) => exp.split("").map((c: string) => supMap[c] || c).join(""));

  // 6. Subscripts: a_n -> aₙ, x_1 -> x₁, x_2 -> x₂, x1 -> x₁, x2 -> x₂
  const subMap: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "n": "ₙ", "i": "ᵢ", "j": "ⱼ"
  };
  s = s.replace(/([a-zA-Z])_([0-9nij])/g, (_, v, idx) => v + (subMap[idx] || idx));
  s = s.replace(/\b([xyz])([0-9])\b/g, (_, v, idx) => v + (subMap[idx] || idx));

  // 7. Standard mathematical symbols & greek letters
  s = s.replace(/<=/g, "≤");
  s = s.replace(/>=/g, "≥");
  s = s.replace(/!=/g, "≠");
  s = s.replace(/\\pi\b|\bpi\b/gi, "π");
  s = s.replace(/\\theta\b|\btheta\b/gi, "θ");
  s = s.replace(/\\lambda\b|\blambda\b/gi, "λ");
  s = s.replace(/\\alpha\b|\balpha\b/gi, "α");
  s = s.replace(/\\beta\b|\bbeta\b/gi, "β");
  s = s.replace(/\\int\b/g, "∫");
  s = s.replace(/\\sum\b/g, "∑");
  s = s.replace(/\\times\b/g, "×");
  s = s.replace(/\\div\b/g, "÷");

  // 8. Clean leftover LaTeX escape backslashes and braces
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\$+/g, "");

  // 9. Normalize spacing
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

/**
 * Intelligent question & sub-question segmentation engine:
 * Splits raw exam paper text so that EVERY sub-question (e.g. Q.1 (a), Q.1 (b)...)
 * receives its own dedicated slide.
 * Also parses markdown tables and removes floating marks numbers.
 */
export function splitTextIntoQuestions(raw: string): ParsedQuestion[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw.split("\n");
  const questions: ParsedQuestion[] = [];

  let currentMainQ = ""; // e.g. "Q.1"
  let currentSubQ = "";  // e.g. "a"
  let currentMarks = "";
  let bodyLines: string[] = [];

  // Matches main question headers: "Q.1", "Q. 1", "Question 1:", "1.", "Problem 2"
  const mainQRegex = /^(?:Q(?:uestion)?\.?\s*(\d+)[:\.]?|(\d+)\.|Problem\s*(\d+)[:\.]?)\s*(.*)$/i;

  // Matches sub-question markers:
  // "a)", "(a)", "a.", "[a]", "i)", "(i)"
  const subQRegex = /^(?:(?:\(([a-z0-9]+)\)|([a-z0-9]+)\)|([a-z])\.)\s*(.*))$/i;

  // Matches isolated marks lines: "3", "5", "[3]", "[5 Marks]", "[10 M]"
  const marksRegex = /^\[?(\d{1,2})\s*(?:Marks?|M)?\]?$/i;

  function flush() {
    if (bodyLines.length === 0) return;

    // Separate text lines, table lines, and isolated marks lines
    const textLines: string[] = [];
    const tableRows: string[][] = [];

    for (const bLine of bodyLines) {
      const trimmed = bLine.trim();
      if (!trimmed) {
        if (textLines.length > 0) textLines.push("");
        continue;
      }

      // Check if this line is an isolated marks count (e.g. "3" or "5")
      const mMatch = trimmed.match(marksRegex);
      if (mMatch && trimmed.length <= 10) {
        if (!currentMarks) {
          currentMarks = `${mMatch[1]} Marks`;
        }
        continue;
      }

      // Check if this line is part of a Markdown Table (e.g. | X | 21 | ... |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        // Skip separator row (|---|---|---|)
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

    const fullBody = cleanTextForSlide(textLines.join("\n"));
    if (fullBody.length > 0 || tableRows.length > 0) {
      let header = currentMainQ || "QUESTION";
      if (currentSubQ) {
        header = `${header} (${currentSubQ.toUpperCase()})`;
      }

      questions.push({
        header,
        marks: currentMarks,
        body: fullBody,
        table: tableRows.length > 0 ? tableRows : undefined,
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

    // 1. Check if line is a main question header
    const mainMatch = line.match(mainQRegex);
    if (mainMatch) {
      const qNum = mainMatch[1] || mainMatch[2] || mainMatch[3];
      const remainder = (mainMatch[4] || "").trim();

      // Check if remainder immediately starts with a sub-question like "(a)" or "a)"
      const subMatchInRemainder = remainder.match(subQRegex);
      if (subMatchInRemainder) {
        flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = subMatchInRemainder[1] || subMatchInRemainder[2] || subMatchInRemainder[3];
        const subText = subMatchInRemainder[4];
        if (subText) bodyLines.push(subText);
        continue;
      }

      // Check if remainder is just an instruction line (e.g. "Attempt any Five Questions from the following.")
      const isInstruction =
        remainder.toLowerCase().includes("attempt") ||
        remainder.toLowerCase().includes("following") ||
        remainder.length === 0;

      if (isInstruction) {
        flush();
        currentMainQ = `Q.${qNum}`;
        currentSubQ = "";
        // Do not create an empty slide for the instruction if sub-questions follow
        continue;
      }

      // It's a complete standalone question without sub-parts
      flush();
      currentMainQ = `Q.${qNum}`;
      currentSubQ = "";
      bodyLines.push(remainder);
      continue;
    }

    // 2. Check if line starts a sub-question (e.g. "a) Find sum...", "(b) ...")
    const subMatch = line.match(subQRegex);
    if (subMatch) {
      flush();
      currentSubQ = subMatch[1] || subMatch[2] || subMatch[3];
      const subText = subMatch[4];
      if (subText) bodyLines.push(subText);
      continue;
    }

    // 3. Check for standalone marks line e.g. "3" or "5"
    const mMatch = line.match(marksRegex);
    if (mMatch && line.length <= 10) {
      if (!currentMarks) {
        currentMarks = `${mMatch[1]} Marks`;
      }
      continue;
    }

    // 4. Regular body line
    bodyLines.push(line);
  }

  flush();

  // Fallback: If no question or sub-question was recognized, split by double newlines
  if (questions.length === 0) {
    const paragraphs = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 10);
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

    // Secondary fallback to root public path
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
 * 1. Each sub-question is cleanly isolated onto its own slide.
 * 2. Font is Bookman Old Style, size 80 pt (scaled adaptively for long questions).
 * 3. Question text is high-contrast vibrant yellow (#FFE600).
 * 4. Markdown tables are cleanly rendered as native PowerPoint tables with emerald borders.
 * 5. Dimensions are exact user specs: 101.6 cm (40.0 inches) x 52.07 cm (20.5 inches).
 */
export async function buildPptxPresentation(
  rawText: string,
  title = "CodeBits Question Paper"
): Promise<Buffer> {
  const pres = createPresentationInstance();
  // Exact user requested dimensions: Width = 101.6 cm (40.0 inches), Height = 52.07 cm (20.5 inches)
  pres.defineLayout({ name: "CODEBITS_CUSTOM", width: 40.0, height: 20.5 });
  pres.layout = "CODEBITS_CUSTOM";
  pres.title = title;

  const bgBase64 = getTemplateBase64();
  const backgroundOption = bgBase64
    ? { data: `image/png;base64,${bgBase64}` }
    : { color: "0B0F0E" }; // Obsidian fallback if template image unavailable

  const questions = splitTextIntoQuestions(rawText);

  // If text was completely empty, generate at least one title slide
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
      color: "00C269", // Emerald green accent matching CodeBits identity
    });

    const hasTable = Boolean(q.table && q.table.length > 0);
    const charCount = q.body.length;

    // 2. Calibrate font sizing: default is 80 pt as requested!
    let fontSize = 80;
    let lineSpacing = 104;

    if (hasTable) {
      // With a table present, keep the question statement prominent at 60-68 pt so the table fits comfortably
      fontSize = charCount > 180 ? 54 : 64;
      lineSpacing = 82;
    } else {
      // Normal question slides: 80 pt default, scaling smoothly for very lengthy texts
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

    // 3. Question Body in Vibrant High-Contrast Yellow (#FFE600) with Bookman Old Style
    const textHeight = hasTable ? 4.5 : 14.5;
    if (q.body.trim().length > 0) {
      slide.addText(q.body, {
        x: 2.5,
        y: 4.4,
        w: 35.0,
        h: textHeight,
        fontFace: "Bookman Old Style",
        fontSize,
        color: "FFE600", // High-contrast lecture yellow
        lineSpacing,
        valign: "top",
        wrap: true,
      });
    }

    // 4. Clean Native Presentation Table Rendering
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
            fill: { color: "111816" }, // Subtle obsidian fill matching CodeBits dark background
          },
        }))
      );

      // Calculate table width & position
      const numCols = Math.max(...q.table.map((r) => r.length));
      const colWidth = Math.min(3.5, 34.0 / Math.max(numCols, 1));
      const totalTableWidth = colWidth * numCols;
      const tableX = Math.max(2.5, (40.0 - totalTableWidth) / 2); // Center table horizontally
      const tableY = q.body.trim().length > 0 ? 9.5 : 5.5;

      slide.addTable(tableData, {
        x: tableX,
        y: tableY,
        w: totalTableWidth,
        colW: Array(numCols).fill(colWidth),
        rowH: 1.8,
        border: { pt: 2.5, color: "00C269" }, // Emerald green cell borders
      });
    }
  }

  const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return buffer;
}
