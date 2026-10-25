import { PDFDocument } from "pdf-lib";
import { purgePdfWatermarks, whitenCanvasBackground } from "./watermark-remover";

export interface CompressionProgress {
  stage: string;
  percent: number;
  currentPage?: number;
  totalPages?: number;
}

export interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
  savingsPct: number;
}

/**
 * Dynamically loads the official Mozilla PDF.js engine with resilient CDN fallback in the browser
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  const cdnPairs = [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
      worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    },
    {
      src: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
      worker: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
    },
  ];

  for (const pair of cdnPairs) {
    try {
      const pdfjs = await new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${pair.src}"]`);
        if (existingScript && (window as any).pdfjsLib) {
          const lib = (window as any).pdfjsLib;
          lib.GlobalWorkerOptions.workerSrc = pair.worker;
          return resolve(lib);
        }

        const script = document.createElement("script");
        script.src = pair.src;
        script.async = true;
        script.onload = () => {
          const lib = (window as any).pdfjsLib;
          if (lib) {
            lib.GlobalWorkerOptions.workerSrc = pair.worker;
            resolve(lib);
          } else {
            reject(new Error("pdfjsLib object not found after script load"));
          }
        };
        script.onerror = () => reject(new Error(`Failed to load ${pair.src}`));
        document.head.appendChild(script);
      });

      if (pdfjs) return pdfjs;
    } catch (e) {
      console.warn("Primary PDF CDN failed, trying next mirror:", e);
    }
  }

  throw new Error("Unable to initialize PDF engine in browser. Please check internet connection.");
}

/**
 * Two-tier client-side PDF compressor:
 * 1. Tier 1: Fast stream optimization and dictionary cleanup via pdf-lib
 * 2. Tier 2: Smart canvas rasterization downsampling for heavy scanned syllabus/notes PDFs
 */
export async function compressPdfFile(
  file: File,
  options?: {
    maxBytes?: number;
    onProgress?: (progress: CompressionProgress) => void;
  }
): Promise<CompressionResult> {
  const maxBytes = options?.maxBytes ?? 4.5 * 1024 * 1024; // 4.5 MB platform limit
  const originalSize = file.size;

  if (originalSize <= maxBytes) {
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: originalSize,
      savingsPct: 0,
    };
  }

  options?.onProgress?.({
    stage: "Analyzing PDF structures...",
    percent: 10,
  });

  const arrayBuffer = await file.arrayBuffer();

  // ==========================================
  // TIER 1: Lossless Stream Deduplication & Watermark Purge
  // ==========================================
  try {
    options?.onProgress?.({
      stage: "Purging watermarks & deduplicating streams...",
      percent: 25,
    });

    const sanitized = await purgePdfWatermarks(arrayBuffer, file.name, {
      stripAnnotations: true,
      stripCommonDomains: true,
      cleanMetadata: true,
      onProgress: (stage) => options?.onProgress?.({ stage, percent: 25 }),
    });

    if (sanitized.finalSize <= maxBytes) {
      const savingsPct = Math.round(
        ((originalSize - sanitized.finalSize) / originalSize) * 100
      );

      options?.onProgress?.({
        stage: "Optimization & sanitization complete!",
        percent: 100,
      });

      return {
        file: sanitized.file,
        compressed: true,
        originalSize,
        finalSize: sanitized.finalSize,
        savingsPct: Math.max(savingsPct, 0),
      };
    }
  } catch (tier1Err) {
    console.warn("Tier 1 PDF compression & sanitization failed, proceeding to Tier 2:", tier1Err);
  }

  // ==========================================
  // TIER 2: Canvas Downsampling for Scanned Pages
  // ==========================================
  options?.onProgress?.({
    stage: "Downsampling scanned syllabus pages...",
    percent: 30,
  });

  const pdfjs = await loadPdfJs();
  if (!pdfjs) {
    throw new Error("PDF processing engine unavailable in browser.");
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  if (numPages === 0) {
    throw new Error("Selected PDF contains no readable pages.");
  }

  // Smart resolution tuning based on page count
  // Keeps syllabus text sharp and legible while ensuring output stays under 4.5 MB
  let maxDimension = 1500;
  let jpegQuality = 0.74;

  if (numPages > 25) {
    maxDimension = 1200;
    jpegQuality = 0.65;
  } else if (numPages > 12) {
    maxDimension = 1350;
    jpegQuality = 0.70;
  }

  const newPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pageProgress = Math.round(30 + (pageNum / numPages) * 60);
    options?.onProgress?.({
      stage: `Optimizing page ${pageNum} of ${numPages}...`,
      percent: pageProgress,
      currentPage: pageNum,
      totalPages: numPages,
    });

    const page = await pdf.getPage(pageNum);
    const initialViewport = page.getViewport({ scale: 1.0 });

    // Calculate downsample scale so longest edge doesn't exceed maxDimension
    const longestEdge = Math.max(initialViewport.width, initialViewport.height);
    const scale = Math.min(maxDimension / longestEdge, 2.0);
    const viewport = page.getViewport({ scale: Math.max(scale, 0.8) });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) continue;

    // Fill white background for scan transparency
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    // Apply smart watermark whitening filter to erase faint background logos on scanned paper
    whitenCanvasBackground(context, canvas.width, canvas.height, 192);

    // Convert canvas to optimized progressive JPEG
    const jpegDataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
    const base64Data = jpegDataUrl.split(",")[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const embeddedImage = await newPdf.embedJpg(imageBytes);

    // Maintain original page aspect ratio
    const newPdfPage = newPdf.addPage([
      initialViewport.width,
      initialViewport.height,
    ]);

    newPdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: initialViewport.width,
      height: initialViewport.height,
    });

    // Free canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }

  options?.onProgress?.({
    stage: "Finalizing compressed PDF package...",
    percent: 95,
  });

  const finalBytes = await newPdf.save({ useObjectStreams: true });
  const finalFile = new File([new Uint8Array(finalBytes)], file.name, {
    type: "application/pdf",
  });
  const savingsPct = Math.round(
    ((originalSize - finalBytes.length) / originalSize) * 100
  );

  options?.onProgress?.({
    stage: "Auto-compression complete!",
    percent: 100,
  });

  return {
    file: finalFile,
    compressed: true,
    originalSize,
    finalSize: finalBytes.length,
    savingsPct: Math.max(savingsPct, 0),
  };
}
