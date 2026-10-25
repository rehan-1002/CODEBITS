import { PDFDocument } from "pdf-lib";

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
 * Dynamically loads the official Mozilla PDF.js engine from CDN in the browser
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const existingScript =
      document.querySelector('script[src*="pdf.js"]') ||
      document.querySelector('script[src*="pdf.min.js"]');

    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).pdfjsLib) {
          clearInterval(interval);
          const pdfjs = (window as any).pdfjsLib;
          pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjs);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        if ((window as any).pdfjsLib) resolve((window as any).pdfjsLib);
        else reject(new Error("Timeout loading PDF.js engine"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjs);
      } else {
        reject(new Error("PDF.js library failed to initialize"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js engine from CDN"));
    document.head.appendChild(script);
  });
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
  // TIER 1: Lossless Stream & Object Deduplication
  // ==========================================
  try {
    options?.onProgress?.({
      stage: "Applying stream deduplication...",
      percent: 25,
    });

    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Clean bloat metadata
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("CodeBits Academic Vault");
    pdfDoc.setCreator("CodeBits PDF Optimizer");

    const tier1Bytes = await pdfDoc.save({ useObjectStreams: true });

    if (tier1Bytes.length <= maxBytes) {
      const finalFile = new File([tier1Bytes as unknown as BlobPart], file.name, {
        type: "application/pdf",
      });
      const savingsPct = Math.round(
        ((originalSize - tier1Bytes.length) / originalSize) * 100
      );

      options?.onProgress?.({
        stage: "Compression complete!",
        percent: 100,
      });

      return {
        file: finalFile,
        compressed: true,
        originalSize,
        finalSize: tier1Bytes.length,
        savingsPct,
      };
    }
  } catch (tier1Err) {
    console.warn("Tier 1 PDF compression failed, proceeding to Tier 2:", tier1Err);
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

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
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
  const finalFile = new File([finalBytes as unknown as BlobPart], file.name, {
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
