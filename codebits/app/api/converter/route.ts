import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } from "docx";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { generateContentWithFailover } from "@/lib/ai/gemini";
import { buildMathParagraph, cleanMathSymbols, buildDocumentElements } from "@/lib/converter/mathDocxFormatter";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Extended timeout for AI document analysis

// Pure JS fallback to extract text from PDF streams without native worker dependencies
function extractRawTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const str = buffer.toString("binary");
    const textChunks: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(str)) !== null) {
      const streamData = match[1];
      const btEtRegex = /BT[\s\S]*?ET/g;
      let btMatch: RegExpExecArray | null;

      while ((btMatch = btEtRegex.exec(streamData)) !== null) {
        const block = btMatch[0];
        const tjRegex = /\((.*?)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;

        while ((tjMatch = tjRegex.exec(block)) !== null) {
          textChunks.push(tjMatch[1]);
        }
      }
    }

    return textChunks.join(" ").replace(/\\([()\\])/g, "$1").trim();
  } catch {
    return "";
  }
}

const VERBATIM_SYSTEM_INSTRUCTION =
  "You are a strict verbatim OCR document scanner and transcriber. Under NO circumstances should you solve, calculate, or answer any questions or circuits. DO NOT write solutions, derivations, circuit analyses, or answers. Transcribe ONLY the printed questions, formulas, numbers, and options verbatim like a photocopier.";

function stripAiGeneratedSolutions(text: string): string {
  if (!text) return "";
  let cleaned = text;
  // Guard against AI hallucinated solutions and derivations
  cleaned = cleaned.replace(/\n+\s*(?:\*\*|###?\s*)\s*Circuit Component Summary:?[\s\S]*$/i, "");
  cleaned = cleaned.replace(/\n+\s*(?:\*\*|###?\s*)\s*Circuit Analysis:?[\s\S]*$/i, "");
  cleaned = cleaned.replace(/\n+\s*(?:\*\*|###?\s*)\s*Step-by-Step Solution:?[\s\S]*$/i, "");
  cleaned = cleaned.replace(/\n+\s*(?:\*\*|###?\s*)\s*Solution:?\s*\n+[\s\S]*$/i, "");
  return cleaned.trim();
}

function getAcademicReconstructionPrompt(options: { isImage: boolean; rangeLabel?: string }) {
  const { isImage, rangeLabel } = options;
  const label = rangeLabel ? ` for ${rangeLabel}` : "";
  const intro = isImage
    ? `You are an elite academic document and mathematical question scanner. Reconstruct all printed text, handwritten equations, questions, matrices, and tables from this image${label} verbatim like a photocopier. DO NOT SOLVE OR ANSWER ANY QUESTIONS.`
    : `You are a master academic document and mathematical question bank reconstruction engine. Reconstruct all text, sections, questions, matrices, and tables from this document${label} verbatim like a photocopier. DO NOT SOLVE OR ANSWER ANY QUESTIONS.`;

  return `${intro}

CRITICAL INSTRUCTION - NEVER SOLVE OR ANSWER QUESTIONS:
- YOU ARE A VERBATIM DOCUMENT RECONSTRUCTION ENGINE, NOT A HOMEWORK SOLVER.
- DO NOT solve, calculate, answer, or derive solutions to any question or circuit.
- DO NOT write "Circuit Analysis", step-by-step derivations, KVL/KCL solutions, or answers unless they are ALREADY explicitly written out verbatim in the user's source paper.
- Reconstruct ONLY the question statement, question number, given parameters, and options verbatim as an unsolved assignment/question paper.

CRITICAL MATHEMATICS, PHYSICS, CHEMISTRY & EQUATION RULES:
1. MATHEMATICAL SYMBOLS & ADVANCED CALCULUS:
- Preserve all calculus operations verbatim:
  - Integration: single (\\int), double (\\iint), triple (\\iiint), contour/surface (\\oint), with limits (e.g. \\int_{0}^{\\infty} f(x) dx, \\int_{a}^{b}).
  - Differentiation: ordinary derivatives (\\frac{dy}{dx}, \\frac{d^2 y}{dx^2}), partial derivatives (\\frac{\\partial u}{\\partial t}, \\frac{\\partial^2 u}{\\partial x^2}), gradients/divergence/curl (\\nabla, \\nabla \\cdot \\vec{F}, \\nabla \\times \\vec{F}, \\nabla^2).
  - Summations (\\sum_{i=1}^n), products (\\prod), limits (\\lim_{x \\to 0}), and roots (\\sqrt{x}, \\sqrt[n]{x}).
- PROPER FRACTIONS & RATIONAL EXPRESSIONS (MANDATORY):
  - ALWAYS format every fraction, rational function, or division as vertical LaTeX \\frac{numerator}{denominator} (or \\dfrac{...}{...}), e.g.: \\frac{1}{2}, \\frac{\\sqrt{3}}{2}, \\frac{1}{8}, \\frac{x}{2}, \\frac{y}{2}, \\frac{\\pi}{10}, \\frac{4x}{x^2+y^2}, \\frac{5\\tan\\theta - 10\\tan^3\\theta + \\tan^5\\theta}{1 - 10\\tan^2\\theta + 5\\tan^4\\theta}, \\frac{x^2}{\\cosh^2\\beta}.
  - NEVER output linear slash fractions like (1 / 2), 1/2, or (a / b) - ALWAYS use \\frac{...}{...}!
- Enclose all mathematical expressions in standard dollar signs: $...$ for inline and $$...$$ for display equations.

2. PHYSICS EQUATIONS & VECTORS:
- Reconstruct all physical laws and equations (Mechanics, Electrodynamics, Thermodynamics, Quantum, Optics, Relativity):
  - Vectors with arrows: \\vec{v}, \\vec{F}, \\vec{E}, \\vec{B}, \\vec{a}, \\vec{p}
  - Unit vectors with hats: \\hat{i}, \\hat{j}, \\hat{k}, \\hat{n}
  - Time derivatives: \\dot{x}, \\ddot{x}, \\dot{\\theta}
  - Quantum & atomic symbols: \\hbar (reduced Planck constant), \\lambda (wavelength), \\nu (frequency), \\psi/\\Psi (wavefunction), \\rho, \\sigma, \\tau, \\mu_0, \\epsilon_0.

3. ELECTRICAL & ELECTRONICS CIRCUITS (BEEE):
- Reconstruct the verbatim question text and any given parameters (e.g. "If $I = 2\\text{ A}$, find the value of the battery voltage $V$").
- If the question refers to a figure or circuit diagram:
  - DO NOT solve or derive the circuit solution.
  - DO NOT invent component summaries or node voltage derivations.
  - DO NOT draw inaccurate approximations or ASCII circuits.
  - The authentic source schematic is automatically embedded directly with the question.
  - Output ONLY the question statement, sub-parts, given parameters, and multiple-choice options verbatim.

4. CHEMISTRY EQUATIONS & REACTION MECHANISMS:
- Reconstruct all chemical formulas, stoichiometry, ionic charges, and reactions verbatim:
  - Molecular formulas with subscripts: H_2O, H_2SO_4, CaCO_3, KMnO_4, C_6H_{12}O_6
  - Ions & oxidation states with superscripts: H^+, Na^+, Ca^{2+}, Fe^{3+}, SO_4^{2-}, OH^-, e^-
  - Reaction arrows: forward reaction (\\rightarrow), equilibrium (\\rightleftharpoons), resonance (\\leftrightarrow)
  - States & indicators: gas evolved (\\uparrow or (g)), precipitate (\\downarrow or (s)), (aq), (l)
  - Reaction conditions over arrows: \\xrightarrow{\\Delta} (heat), \\xrightarrow{\\text{catalyst}}
  - Isotopes: ^{14}_6 C, ^{235}_{92}U

5. MATRICES & DETERMINANTS (ANY ORDER: 2x2, 3x3, 4x4, NxM):
- Reconstruct all matrices and determinants of ANY dimension verbatim using standard LaTeX matrix notation:
  - Square bracket matrix: \\begin{bmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{bmatrix}
  - Parenthesis matrix: \\begin{pmatrix} ... \\end{pmatrix}
  - Determinants: \\begin{vmatrix} ... \\end{vmatrix}
  - Double-bar norm matrix: \\begin{Vmatrix} ... \\end{Vmatrix}
- Always separate columns with & and rows with \\\\. Preserve every single row and column without collapsing entries.

6. CRITICAL WORD AND EQUATION SPACING:
- Always preserve spaces between regular English words and formulas!
  - For example, write "If $A = ...$ find the Eigen values of $A^3 + 5A + 8I$." NEVER fuse words like "If$A$" or "of$A^3$" or ")find".
  - Write "variable $X$ follows", "function $f(z)$", "along $y = x^2$", "matrix $A$".

6. TABLES & DATA SHEETS:
- Format all tables using standard Markdown table syntax with a header row, separator row, and data rows:
  | Column 1 | Column 2 | Column 3 |
  |---|---|---|
  | Cell 1 | Cell 2 | Cell 3 |
- Never convert a table into loose unformatted text.

7. QUESTION BANK & EXAM PAPER STRUCTURE:
- If handwriting is present, transcribe it accurately without omitting steps.
- Preserve all Question numbers verbatim (e.g. "Q.1", "Question 1:", "1.", "2(a)", "Problem 4:").
- Preserve marks/weightage indicators (e.g. "[4 Marks]", "[5 M]").
- For multiple-choice questions, keep each option on its own line: (A), (B), (C), (D).
- Format document sections with Markdown headers (# for Document Title, ## for Sections, ### for Questions).
- Do not add any conversational remarks, commentary, or summaries; output only the reconstructed document.`;
}

export async function POST(req: NextRequest) {
  try {
    // Check if request is JSON (e.g. for docx assembly)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const jsonBody = await req.json();
      if (jsonBody.mode === "assemble") {
        const title = (jsonBody.title || "Document").trim();
        const sections: Array<{ pageRange?: string; text: string }> = jsonBody.sections || [];
        const fullText = (jsonBody.text || "").trim();

        const textToProcess = sections.length > 0 
          ? sections.map((s) => s.text).join("\n\n")
          : fullText;

        if (!textToProcess.trim()) {
          return NextResponse.json({ error: "No text content provided for assembly." }, { status: 400 });
        }

        const docElements = await buildDocumentElements(textToProcess, title);

        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: 1440,
                    bottom: 1440,
                    left: 1440,
                    right: 1440,
                  },
                },
              },
              children: docElements,
            },
          ],
        });

        const docxBuffer = await Packer.toBuffer(doc);
        const downloadName = `${title}.docx`;

        return new Response(docxBuffer as any, {
          status: 200,
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
            "Content-Length": docxBuffer.length.toString(),
          },
        });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetFormat = (formData.get("targetFormat") as string || "").toLowerCase();
    const mode = (formData.get("mode") as string || "").toLowerCase();
    const chunkIndex = formData.get("chunkIndex") as string | null;
    const pageRange = formData.get("pageRange") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    const originalName = file.name;
    const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isImage =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|webp|bmp|gif|tiff)$/i.test(originalName);

    const getImageMimeType = (filename: string, fileType?: string): string => {
      if (fileType && fileType.startsWith("image/")) return fileType;
      const lower = filename.toLowerCase();
      if (lower.endsWith(".png")) return "image/png";
      if (lower.endsWith(".webp")) return "image/webp";
      if (lower.endsWith(".gif")) return "image/gif";
      if (lower.endsWith(".bmp")) return "image/bmp";
      return "image/jpeg";
    };

    // ==========================================
    // 1. CHUNK / IMAGE EXTRACTION (Micro-batch mode)
    // ==========================================
    if (mode === "extract") {
      let extractedText = "";

      try {
        const base64 = buffer.toString("base64");
        const mimeType = isImage ? getImageMimeType(originalName, file.type) : "application/pdf";
        const promptText = getAcademicReconstructionPrompt({ isImage, rangeLabel: pageRange || undefined });

        const aiResult = await generateContentWithFailover({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          config: {
            systemInstruction: VERBATIM_SYSTEM_INSTRUCTION,
            temperature: 0.0,
          },
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = stripAiGeneratedSolutions(aiResult.text.trim());
        }
      } catch (aiErr: any) {
        console.warn("AI chunk extraction failed, attempting fallback:", aiErr?.message || aiErr);
      }

      if (!extractedText.trim() && !isImage) {
        const fallbackText = extractRawTextFromPdfBuffer(buffer);
        if (fallbackText.trim()) {
          extractedText = fallbackText;
        }
      }

      return NextResponse.json({
        success: true,
        text: extractedText,
        chunkIndex: chunkIndex !== null ? parseInt(chunkIndex, 10) : undefined,
        pageRange: pageRange || undefined,
      });
    }

    // ==========================================
    // 2. IMAGE TO DOCX (AI Optical Math & Handwriting to Word)
    // ==========================================
    if (isImage && (targetFormat === "docx" || targetFormat === ".docx" || !targetFormat || targetFormat === "doc")) {
      let extractedText = "";

      try {
        const base64 = buffer.toString("base64");
        const mimeType = getImageMimeType(originalName, file.type);
        const aiResult = await generateContentWithFailover({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  },
                },
                {
                  text: getAcademicReconstructionPrompt({ isImage: true }),
                },
              ],
            },
          ],
          config: {
            systemInstruction: VERBATIM_SYSTEM_INSTRUCTION,
            temperature: 0.0,
          },
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = stripAiGeneratedSolutions(aiResult.text.trim());
        }
      } catch (aiErr: any) {
        console.error("AI Image-to-DOCX extraction failed:", aiErr);
      }

      if (!extractedText.trim()) {
        return NextResponse.json(
          {
            error:
              "Could not extract legible text or equations from this image. Please ensure the image is clear and well-lit.",
          },
          { status: 422 }
        );
      }

      // Build formatted Word (.docx) document with native Math equations, Matrices, and Tables
      const docElements = await buildDocumentElements(extractedText, baseName);

      // Embed the source image (diagrams, circuits, handwriting) directly into the Word document
      try {
        const ext = (originalName.split(".").pop() || "").toLowerCase();
        const imgType: "jpg" | "png" | "gif" | "bmp" =
          ext === "png" ? "png" : ext === "gif" ? "gif" : ext === "bmp" ? "bmp" : "jpg";

        const imageParagraph = new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          children: [
            new ImageRun({
              data: buffer,
              type: imgType,
              transformation: {
                width: 520,
                height: 320,
              },
            }),
          ],
        });
        const captionParagraph = new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "Figure: Source Reference & Schematic Diagram",
              italics: true,
              size: 18,
              color: "666666",
            }),
          ],
        });
        // Place the source reference image right below the question header so it looks like an authentic exam sheet
        if (docElements.length > 2) {
          docElements.splice(2, 0, imageParagraph, captionParagraph);
        } else if (docElements.length > 1) {
          docElements.splice(1, 0, imageParagraph, captionParagraph);
        } else {
          docElements.push(imageParagraph, captionParagraph);
        }
      } catch (imgErr) {
        console.warn("Could not embed image into docx:", imgErr);
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            children: docElements,
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      const downloadName = `${baseName}.docx`;

      return new Response(docxBuffer as any, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
          "Content-Length": docxBuffer.length.toString(),
        },
      });
    }

    // ==========================================
    // 3. IMAGE TO PDF
    // ==========================================
    if (isImage && (targetFormat === "pdf" || targetFormat === ".pdf")) {
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const base64 = buffer.toString("base64");
      const imgFormat = originalName.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";

      try {
        pdf.addImage(
          `data:image/${imgFormat.toLowerCase()};base64,${base64}`,
          imgFormat,
          margin,
          margin,
          availableWidth,
          availableHeight,
          undefined,
          "FAST"
        );
      } catch {
        // Fallback simple image add
        pdf.addImage(base64, imgFormat, margin, margin, availableWidth, availableHeight);
      }

      const pdfArrayBuffer = pdf.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      const downloadName = `${baseName}.pdf`;

      return new Response(pdfBuffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    // ==========================================
    // 4. PDF TO DOCX (High-Fidelity AI + Fallback)
    // ==========================================
    if (
      targetFormat === "docx" ||
      targetFormat === ".docx" ||
      (originalName.toLowerCase().endsWith(".pdf") && targetFormat !== "pdf")
    ) {
      let extractedText = "";

      // Step A: Attempt high-fidelity Gemini AI OCR & Layout extraction
      // Handles scanned PDFs, photos of exam papers, formulas, tables, and digital PDFs effortlessly!
      try {
        const base64 = buffer.toString("base64");
        const aiResult = await generateContentWithFailover({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64,
                  },
                },
                {
                  text: getAcademicReconstructionPrompt({ isImage: false }),
                },
              ],
            },
          ],
          config: {
            systemInstruction: VERBATIM_SYSTEM_INSTRUCTION,
            temperature: 0.0,
          },
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = stripAiGeneratedSolutions(aiResult.text.trim());
        }
      } catch (aiErr: any) {
        console.warn("AI PDF extraction failed, falling back to local text extraction:", aiErr?.message || aiErr);
      }

      // Step B: If AI extraction was empty, try raw stream extraction
      if (!extractedText.trim()) {
        const fallbackText = extractRawTextFromPdfBuffer(buffer);
        if (fallbackText.trim()) {
          extractedText = fallbackText;
        }
      }

      if (!extractedText.trim()) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from this PDF. Please ensure the file is not password-protected or completely blank.",
          },
          { status: 422 }
        );
      }

      // Step C: Build formatted Word (.docx) document with native Math equations, Matrices, and Tables
      const docElements = await buildDocumentElements(extractedText, baseName);

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            children: docElements,
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      const downloadName = `${baseName}.docx`;

      return new Response(docxBuffer as any, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
          "Content-Length": docxBuffer.length.toString(),
        },
      });
    }

    // ==========================================
    // 2. DOCX TO PDF
    // ==========================================
    if (
      targetFormat === "pdf" ||
      targetFormat === ".pdf" ||
      (originalName.toLowerCase().endsWith(".docx") && targetFormat !== "docx")
    ) {
      let rawText = "";

      try {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value || "";
      } catch (err: any) {
        console.error("DOCX Parsing error:", err);
        return NextResponse.json(
          { error: "Could not read Word document. Please ensure the file is a valid .docx." },
          { status: 422 }
        );
      }

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: "The provided Word document appears to be empty." },
          { status: 422 }
        );
      }

      // Generate clean PDF with jsPDF
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin;

      // Header Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(24, 24, 27);
      pdf.text(baseName, margin, cursorY);
      cursorY += 10;

      // Divider Line
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 8;

      const lines = rawText.split(/\r?\n/).map((l) => l.trim());

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(40, 40, 40);

      const lineHeight = 6;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!line) {
          cursorY += 4;
          continue;
        }

        const isHeading =
          line.length < 60 &&
          (line.toUpperCase() === line ||
            /^(chapter|section|part|question|q\.\s*\d+|module)\b/i.test(line));

        if (isHeading) {
          cursorY += 4;
          if (cursorY + 12 > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(16, 185, 129); // CodeBits emerald
          pdf.text(line, margin, cursorY);
          cursorY += 7;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(40, 40, 40);
        } else {
          const wrapped = pdf.splitTextToSize(line, contentWidth);
          for (const wrappedLine of wrapped) {
            if (cursorY + lineHeight > pageHeight - margin) {
              pdf.addPage();
              cursorY = margin;
            }
            pdf.text(wrappedLine, margin, cursorY);
            cursorY += lineHeight;
          }
          cursorY += 2;
        }
      }

      // Add page numbering on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(140, 140, 140);
        pdf.text(
          `Page ${p} of ${totalPages} · Converted by CodeBits`,
          margin,
          pageHeight - 10
        );
      }

      const pdfArrayBuffer = pdf.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      const downloadName = `${baseName}.pdf`;

      return new Response(pdfBuffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported conversion. Supported conversions: .pdf to .docx and .docx to .pdf." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Conversion route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to convert document." },
      { status: 500 }
    );
  }
}
