import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { generateContentWithFailover } from "@/lib/ai/gemini";
import { buildMathParagraph, cleanMathSymbols } from "@/lib/converter/mathDocxFormatter";

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

        const paragraphs: Paragraph[] = [
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 36, // 18pt
                color: "00C269", // CodeBits Emerald
                font: "Calibri",
              }),
            ],
            spacing: { after: 280 },
          }),
        ];

        const textToProcess = sections.length > 0 
          ? sections.map((s) => s.text).join("\n\n")
          : fullText;

        if (!textToProcess.trim()) {
          return NextResponse.json({ error: "No text content provided for assembly." }, { status: 400 });
        }

        const rawLines = textToProcess.split(/\r?\n/);
        for (let i = 0; i < rawLines.length; i++) {
          const line = rawLines[i].trim();
          if (!line) continue;

          if (line.startsWith("# ")) {
            paragraphs.push(buildMathParagraph(line.replace(/^#\s+/, ""), HeadingLevel.HEADING_1));
          } else if (line.startsWith("## ")) {
            paragraphs.push(buildMathParagraph(line.replace(/^##\s+/, ""), HeadingLevel.HEADING_2));
          } else if (line.startsWith("### ")) {
            paragraphs.push(buildMathParagraph(line.replace(/^###\s+/, ""), HeadingLevel.HEADING_3));
          } else if (/^[-*•]\s+/.test(line)) {
            paragraphs.push(buildMathParagraph(line.replace(/^[-*•]\s+/, "")));
          } else {
            paragraphs.push(buildMathParagraph(line));
          }
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
              children: paragraphs,
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
        const rangeLabel = pageRange ? ` for ${pageRange}` : "";
        const mimeType = isImage ? getImageMimeType(originalName, file.type) : "application/pdf";
        const promptIntro = isImage
          ? `You are an elite academic document, handwritten notes, and mathematical problem scanner. Reconstruct all text, handwritten equations, questions, diagrams explanations, and tables from this image${rangeLabel} verbatim.`
          : `You are a master academic document and mathematical question bank reconstruction engine. Reconstruct all text, sections, questions, and mathematical equations from this document chunk${rangeLabel} verbatim.`;

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
                  text: `${promptIntro}

CRITICAL MATHEMATICS, SYMBOLS & QUESTION BANK RULES:
1. MATHEMATICAL SYMBOLS & EQUATIONS:
- Never substitute or alter any mathematical symbol with corrupted characters, approximations, or placeholders.
- Preserve every single Greek letter (θ, π, α, β, γ, δ, λ, μ, σ, ω, Δ, etc.), root (√, ∛), fraction (\\frac{a}{b}), exponent/power (e.g. ^2, ^{-1/2}, e^{iθ}), subscript (e.g. x_0, a_n), integral (∫, ∬), summation (∑), limit (\\lim), differential (dy/dx, ∂), matrix, and operator (±, ∓, ×, ÷, ·, ≤, ≥, ≠, ≈, ≡, ∈, ∉, ⊂, ∪, ∩, →, ⇒, ⇔).
- Enclose all mathematical expressions and formulas in standard dollar signs: $...$ for inline formulas and $$...$$ on their own line for standalone display equations, so they are natively rendered into Word Office Math equation blocks.

2. QUESTION BANK & EXAM PAPER STRUCTURE:
- If handwritten notes or whiteboard, transcribe completely and accurately.
- Preserve all Question numbers verbatim (e.g. "Q.1", "Question 1:", "1.", "2(a)", "Problem 4:").
- Preserve marks/weightage indicators (e.g. "[4 Marks]", "[5 M]").
- For multiple-choice questions, keep each option on its own line or clearly labeled: (A), (B), (C), (D).
- Preserve table structures, sub-questions (i, ii, iii), and module headings.
- Format document sections with Markdown headers (# for Document Title, ## for Sections/Modules, ### for Question Headers).
- Do not add any introductory or conversational remarks; output only the reconstructed document.`,
                },
              ],
            },
          ],
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = aiResult.text.trim();
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
                  text: `You are an elite academic document, handwritten notes, and mathematical problem scanner. Reconstruct all text, handwritten equations, questions, diagrams explanations, and tables from this image verbatim.

CRITICAL MATHEMATICS, SYMBOLS & QUESTION BANK RULES:
1. MATHEMATICAL SYMBOLS & EQUATIONS:
- Never substitute or alter any mathematical symbol with corrupted characters, approximations, or placeholders.
- Preserve every single Greek letter (θ, π, α, β, γ, δ, λ, μ, σ, ω, Δ, etc.), root (√, ∛), fraction (\\frac{a}{b}), exponent/power (e.g. ^2, ^{-1/2}, e^{iθ}), subscript (e.g. x_0, a_n), integral (∫, ∬), summation (∑), limit (\\lim), differential (dy/dx, ∂), matrix, and operator (±, ∓, ×, ÷, ·, ≤, ≥, ≠, ≈, ≡, ∈, ∉, ⊂, ∪, ∩, →, ⇒, ⇔).
- Enclose all mathematical expressions and formulas in standard dollar signs: $...$ for inline formulas and $$...$$ on their own line for standalone display equations, so they are natively rendered into Word Office Math equation blocks.

2. DOCUMENT STRUCTURE & HANDWRITING:
- If handwriting is present, transcribe it accurately without omitting steps.
- Preserve all Question numbers verbatim (e.g. "Q.1", "Question 1:", "1.", "2(a)", "Problem 4:").
- Preserve marks/weightage indicators (e.g. "[4 Marks]", "[5 M]").
- For multiple-choice questions, keep each option on its own line: (A), (B), (C), (D).
- Format document sections with Markdown headers (# for Document Title, ## for Sections, ### for Questions).
- Do not add any conversational remarks, commentary, or summaries; output only the reconstructed document.`,
                },
              ],
            },
          ],
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = aiResult.text.trim();
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

      // Build formatted Word (.docx) document with native Math equations
      const rawLines = extractedText.split(/\r?\n/);
      const paragraphs: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({
              text: baseName,
              bold: true,
              size: 36, // 18pt
              color: "00C269", // CodeBits Emerald
              font: "Calibri",
            }),
          ],
          spacing: { after: 280 },
        }),
      ];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        if (line.startsWith("# ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^#\s+/, ""), HeadingLevel.HEADING_1));
        } else if (line.startsWith("## ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^##\s+/, ""), HeadingLevel.HEADING_2));
        } else if (line.startsWith("### ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^###\s+/, ""), HeadingLevel.HEADING_3));
        } else if (/^[-*•]\s+/.test(line)) {
          paragraphs.push(buildMathParagraph(line.replace(/^[-*•]\s+/, "")));
        } else {
          paragraphs.push(buildMathParagraph(line));
        }
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
            children: paragraphs,
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
                  text: `You are a master academic document and mathematical question bank reconstruction engine. Reconstruct all text, sections, questions, and mathematical equations from this document verbatim.

CRITICAL MATHEMATICS, SYMBOLS & QUESTION BANK RULES:
1. MATHEMATICAL SYMBOLS & EQUATIONS:
- Never substitute or alter any mathematical symbol with corrupted characters, approximations, or placeholders.
- Preserve every single Greek letter (θ, π, α, β, γ, δ, λ, μ, σ, ω, Δ, etc.), root (√, ∛), fraction (\\frac{a}{b}), exponent/power (e.g. ^2, ^{-1/2}, e^{iθ}), subscript (e.g. x_0, a_n), integral (∫, ∬), summation (∑), limit (\\lim), differential (dy/dx, ∂), matrix, and operator (±, ∓, ×, ÷, ·, ≤, ≥, ≠, ≈, ≡, ∈, ∉, ⊂, ∪, ∩, →, ⇒, ⇔).
- Enclose all mathematical expressions and formulas in standard dollar signs: $...$ for inline formulas (e.g. $\\sqrt{1 + \\csc(\\theta/2)} = (1 - e^{i\\theta})^{-1/2} + (1 - e^{-i\\theta})^{-1/2}$) and $$...$$ on their own line for standalone display equations, so they are natively rendered into Word Office Math equation blocks.

2. QUESTION BANK & EXAM PAPER STRUCTURE:
- Preserve all Question numbers verbatim (e.g. "Q.1", "Question 1:", "1.", "2(a)", "Problem 4:").
- Preserve marks/weightage indicators (e.g. "[4 Marks]", "[5 M]").
- For multiple-choice questions, keep each option on its own line or clearly labeled: (A), (B), (C), (D).
- Preserve table structures, sub-questions (i, ii, iii), and module headings.
- Format document sections with Markdown headers (# for Document Title, ## for Sections/Modules, ### for Question Headers).
- Do not add any introductory or conversational remarks; output only the reconstructed document.`,
                },
              ],
            },
          ],
        });

        if (aiResult?.text && aiResult.text.trim().length > 0) {
          extractedText = aiResult.text.trim();
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

      // Step C: Build formatted Word (.docx) document with native Math equations
      const rawLines = extractedText.split(/\r?\n/);
      const paragraphs: Paragraph[] = [];

      // Document Title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: baseName,
              bold: true,
              size: 36, // 18pt
              color: "00C269", // CodeBits Emerald
              font: "Calibri",
            }),
          ],
          spacing: { after: 280 },
        })
      );

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;

        // Heading 1: # Title
        if (line.startsWith("# ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^#\s+/, ""), HeadingLevel.HEADING_1));
        }
        // Heading 2: ## Subtitle / Section
        else if (line.startsWith("## ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^##\s+/, ""), HeadingLevel.HEADING_2));
        }
        // Heading 3: ### Subheading / Question Header
        else if (line.startsWith("### ")) {
          paragraphs.push(buildMathParagraph(line.replace(/^###\s+/, ""), HeadingLevel.HEADING_3));
        }
        // Bullet List item
        else if (/^[-*•]\s+/.test(line)) {
          paragraphs.push(buildMathParagraph(line.replace(/^[-*•]\s+/, "")));
        }
        // Standard Paragraph or Equation Line
        else {
          paragraphs.push(buildMathParagraph(line));
        }
      }

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
            children: paragraphs,
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
