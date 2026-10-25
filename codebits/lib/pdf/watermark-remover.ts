import { PDFDocument, PDFName, decodePDFRawStream } from "pdf-lib";

export interface WatermarkCleanOptions {
  stripAnnotations?: boolean;
  stripCommonDomains?: boolean;
  cleanMetadata?: boolean;
  customPatterns?: string[];
  onProgress?: (stage: string) => void;
}

export interface WatermarkCleanResult {
  file: File;
  cleaned: boolean;
  detectedCount: number;
  originalSize: number;
  finalSize: number;
}

export const KNOWN_WATERMARK_PATTERNS = [
  // Platforms & Domains
  "stupidsid.com",
  "stupidsid",
  "ques10.com",
  "ques10",
  "campuskeeda.com",
  "campuskeeda",
  "shaalaa.com",
  "examfear.com",
  "vtu.ac.in",
  "mumbaiuniversity.in",
  "rgpvonline.com",
  "ktuweb.com",
  "engineershub",
  "fast2study",
  "studynotes",
  "knowledgegate",
  // Messengers & Social
  "t.me/",
  "telegram",
  "join telegram",
  "whatsapp group",
  "chat.whatsapp.com",
  // Scanner apps & tools
  "camscanner",
  "scanned with camscanner",
  "scanned by camscanner",
  "ilovepdf.com",
  "ilovepdf",
  "smallpdf",
  "pdf2go",
  "wondershare",
  "nitro pro",
  // Generic watermarks
  "sample copy",
  "not for sale",
  "for reference only",
  "downloaded from",
  "uploaded on",
];

/**
 * Strips third-party watermarks, platform URLs, Telegram links,
 * clickable annotation stamps, and metadata branding from PDF documents.
 */
export async function purgePdfWatermarks(
  input: File | ArrayBuffer,
  fileName: string = "document.pdf",
  options?: WatermarkCleanOptions
): Promise<WatermarkCleanResult> {
  const stripAnnotations = options?.stripAnnotations ?? true;
  const stripCommonDomains = options?.stripCommonDomains ?? true;
  const cleanMetadata = options?.cleanMetadata ?? true;

  const arrayBuffer = input instanceof File ? await input.arrayBuffer() : input;
  const originalSize = arrayBuffer.byteLength;

  options?.onProgress?.("Inspecting PDF object hierarchy & annotations...");

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  let detectedCount = 0;

  // 1. Purge Document Metadata Branding (Title/Author/Creator often contain platform URLs)
  if (cleanMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("CodeBits Academic Vault");
    pdfDoc.setCreator("CodeBits Document Sanitizer");
  }

  // 2. Compile Search Patterns
  const searchTerms = [
    ...(stripCommonDomains ? KNOWN_WATERMARK_PATTERNS : []),
    ...(options?.customPatterns || []),
  ].map((p) => p.toLowerCase());

  const pageCount = pdfDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    options?.onProgress?.(`Sanitizing page ${i + 1} of ${pageCount}...`);
    const page = pdfDoc.getPage(i);

    // 2A. Purge Interactive Watermark Annotations (Links & Stamp Overlays)
    if (stripAnnotations && page.node.has(PDFName.of("Annots"))) {
      try {
        const annotsRef = page.node.get(PDFName.of("Annots"));
        const resolvedAnnots = pdfDoc.context.lookup(annotsRef) as any;

        if (resolvedAnnots?.asArray) {
          const annotsArray = resolvedAnnots.asArray();
          // Filter out link and watermark stamp annotations
          for (const item of annotsArray) {
            const annotDict = pdfDoc.context.lookup(item) as any;
            if (annotDict && typeof annotDict.get === "function") {
              const subtype = annotDict.get(PDFName.of("Subtype"))?.toString();
              if (
                subtype === "/Link" ||
                subtype === "/Stamp" ||
                subtype === "/Watermark"
              ) {
                detectedCount++;
              }
            }
          }
        }
        // Safely detach all annotations from the page
        page.node.delete(PDFName.of("Annots"));
      } catch (annotErr) {
        console.warn("Notice: Non-critical annotation purge skipped on page", i + 1, annotErr);
      }
    }

    // 2B. Filter Content Stream Text Watermarks (e.g. www.stupidsid.com, CamScanner, etc.)
    if (stripCommonDomains && page.node.has(PDFName.of("Contents"))) {
      try {
        const contentsRef = page.node.Contents();
        const resolvedContents = pdfDoc.context.lookup(contentsRef) as any;
        const streams: any[] = resolvedContents?.asArray
          ? resolvedContents.asArray().map((ref: any) => pdfDoc.context.lookup(ref))
          : [resolvedContents];

        for (const streamObj of streams) {
          if (!streamObj) continue;

          try {
            const rawStream = (pdfDoc.context.lookup(streamObj) || streamObj) as any;
            if (!rawStream) continue;
            const decoded = decodePDFRawStream(rawStream).decode();
            let streamString = Buffer.from(decoded).toString("latin1");
            let modifiedStream = false;

            // Check for search terms inside literal strings (text) and hex strings <hex>
            for (const term of searchTerms) {
              const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
              if (regex.test(streamString)) {
                // Replace with blank spaces of identical length to preserve coordinate alignment
                streamString = streamString.replace(regex, (match) => " ".repeat(match.length));
                detectedCount++;
                modifiedStream = true;
              }
            }

            // Also search for hex-encoded strings matching common domain names
            for (const term of searchTerms) {
              const hexTerm = Buffer.from(term, "utf8").toString("hex");
              const hexRegex = new RegExp(hexTerm, "gi");
              if (hexRegex.test(streamString)) {
                // Replace hex characters with space hex codes (20)
                const blankHex = "20".repeat(term.length);
                streamString = streamString.replace(hexRegex, blankHex);
                detectedCount++;
                modifiedStream = true;
              }
            }

            if (modifiedStream) {
              // Replace stream contents with cleaned flate stream
              const newStream = pdfDoc.context.flateStream(streamString);
              page.node.set(PDFName.of("Contents"), newStream);
            }
          } catch (streamErr) {
            // Some streams might be encrypted or use unsupported filters, skip safely
            continue;
          }
        }
      } catch (contentErr) {
        console.warn("Notice: Content stream inspection skipped on page", i + 1, contentErr);
      }
    }
  }

  options?.onProgress?.("Finalizing sanitized PDF payload...");

  const finalBytes = await pdfDoc.save({ useObjectStreams: true });
  const finalFile = new File([new Uint8Array(finalBytes)], fileName, {
    type: "application/pdf",
  });

  return {
    file: finalFile,
    cleaned: detectedCount > 0,
    detectedCount,
    originalSize,
    finalSize: finalBytes.length,
  };
}

/**
 * Canvas pixel whitening filter for scanned syllabus pages:
 * Cleans faint gray / colored watermarks and enhances paper contrast to crisp #FFFFFF.
 */
export function whitenCanvasBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number = 180
): void {
  try {
    const imgData = context.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Luminance (standard ITU-R BT.601)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);

      // 1. Faint gray/neutral paper shadows & watermark stamps (lum >= threshold, low saturation)
      const isNeutralWatermark = lum >= threshold && maxVal - minVal < 35;

      // 2. Colored semi-transparent watermarks (e.g. Stupidsid faint red/pink "S" logo, light cyan stamps, yellow scanner tint)
      // Watermark ink is semi-transparent over white paper: high luminance and all color channels elevated above dark ink range.
      const isColoredWatermark = lum >= 135 && minVal >= 90;

      if (isNeutralWatermark || isColoredWatermark) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }

    context.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn("Canvas background whitening skipped:", err);
  }
}
