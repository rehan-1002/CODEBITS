import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";
import { cleanMathSymbols } from "./mathDocxFormatter";

export interface ParsedQuestion {
  header: string;
  marks?: string;
  body: string;
}

/**
 * Normalizes text and mathematical equations for clean presentation on PowerPoint slides.
 */
function cleanTextForSlide(raw: string): string {
  if (!raw) return "";

  let s = cleanMathSymbols(raw);

  // Clean Markdown formatting for presentation readability
  s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");

  // Format fractions from LaTeX \frac{a}{b} -> a / b
  s = s.replace(/\\(?:d?frac|tfrac)\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");

  // Clean remaining LaTeX escape artifacts
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\$+/g, "");

  // Normalize excessive newlines
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

/**
 * Intelligent question segmentation engine:
 * Splits raw question bank or exam paper text into distinct individual questions.
 */
export function splitTextIntoQuestions(raw: string): ParsedQuestion[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw.split("\n");
  const questions: ParsedQuestion[] = [];
  let currentHeader = "";
  let currentMarks = "";
  let currentBodyLines: string[] = [];

  // Match question numbering patterns:
  // "Q.1", "Q. 1", "Q1", "Question 1:", "1.", "2(a)", "3. (a)", "Problem 4:"
  const qRegex = /^(?:(?:Q(?:uestion)?\.?\s*(\d+)|(\d+)\.)\s*(?:\(([a-z0-9]+)\))?|Problem\s*(\d+):?)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentBodyLines.length > 0) currentBodyLines.push("");
      continue;
    }

    const match = line.match(qRegex);
    if (match) {
      // Flush previous question if accumulated
      if (currentBodyLines.length > 0 && currentHeader) {
        const fullBody = cleanTextForSlide(currentBodyLines.join("\n"));
        if (fullBody.length > 0) {
          questions.push({
            header: currentHeader,
            marks: currentMarks,
            body: fullBody,
          });
        }
      }

      const qNum = match[1] || match[2] || match[4] || `${questions.length + 1}`;
      const subPart = match[3] ? ` (${match[3].toUpperCase()})` : "";
      currentHeader = `QUESTION ${qNum}${subPart}`;

      // Extract marks indicator if present e.g. [5 Marks], [10 M], [M-15]
      const marksMatch = line.match(/\[([0-9M\-\s]+(?:Marks?|M)?)\]/i);
      currentMarks = marksMatch ? marksMatch[1].trim() : "";

      currentBodyLines = [line];
    } else {
      if (currentHeader) {
        currentBodyLines.push(line);
      }
    }
  }

  // Flush final question
  if (currentBodyLines.length > 0 && currentHeader) {
    const fullBody = cleanTextForSlide(currentBodyLines.join("\n"));
    if (fullBody.length > 0) {
      questions.push({
        header: currentHeader,
        marks: currentMarks,
        body: fullBody,
      });
    }
  }

  // Fallback: If no question numbers were recognized, split by double newlines or sections
  if (questions.length === 0) {
    const paragraphs = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
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
 * Generates an institutional PowerPoint presentation where each question
 * is isolated onto its own slide formatted on the CodeBits master slide background
 * with high-contrast vibrant yellow text (#FFE600).
 */
export async function buildPptxPresentation(
  rawText: string,
  title = "CodeBits Question Paper"
): Promise<Buffer> {
  const pres = new pptxgen();
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
      fontSize: 54,
      bold: true,
      color: "00C269",
    });
    slide.addText("No questions were detected in this document.", {
      x: 2.5,
      y: 6.5,
      w: 35.0,
      h: 3.0,
      fontSize: 40,
      color: "FFE600",
    });
    const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
    return buffer;
  }

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const slide = pres.addSlide();
    slide.background = backgroundOption;

    // 1. Question Header Badge (Positioned safely below the green banner at y: 3.4 in)
    const headerTitle = q.marks
      ? `${q.header.toUpperCase()}   •   [${q.marks.toUpperCase()}]`
      : q.header.toUpperCase();

    slide.addText(headerTitle, {
      x: 2.5,
      y: 3.4,
      w: 35.0,
      h: 1.0,
      fontFace: "Arial",
      fontSize: 32,
      bold: true,
      color: "00C269", // Emerald green accent matching CodeBits identity
    });

    // 2. Adaptive font sizing calibrated for the 101.6cm x 52.07cm (40.0in x 20.5in) canvas
    const charCount = q.body.length;
    let fontSize = 44;
    let lineSpacing = 60;

    if (charCount > 900) {
      fontSize = 28;
      lineSpacing = 38;
    } else if (charCount > 550) {
      fontSize = 32;
      lineSpacing = 44;
    } else if (charCount > 250) {
      fontSize = 38;
      lineSpacing = 52;
    }

    // 3. Question Body in Vibrant High-Contrast Yellow (#FFE600)
    slide.addText(q.body, {
      x: 2.5,
      y: 4.8,
      w: 35.0,
      h: 14.0,
      fontFace: "Arial",
      fontSize,
      color: "FFE600", // High-contrast lecture yellow
      lineSpacing,
      valign: "top",
      wrap: true,
    });
  }

  const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return buffer;
}
