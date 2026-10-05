import * as pdfjsLib from "pdfjs-dist";
import { matchMaritimeTaxonomy, TaxonomyMatchResult } from "../data/maritimeTaxonomy";

export interface PDFScanProgress {
  currentPage: number;
  totalPages: number;
  scannedPages: number;
  percent: number;
  statusText: string;
  matchedEquipmentName?: string;
  matchedScore?: number;
  extractedCharsCount: number;
  isComplete: boolean;
  cancelled?: boolean;
}

export interface PDFScanResult {
  fullExtractedText: string;
  taxonomyResult: TaxonomyMatchResult;
  totalPages: number;
  scannedPagesCount: number;
  earlyExit: boolean;
  durationMs: number;
}

export interface PDFScanOptions {
  maxPagesToScan?: number; // default 25
  earlyExitConfidence?: number; // default 60
  onProgress?: (progress: PDFScanProgress) => void;
  signal?: AbortSignal;
}

/**
 * Non-blocking, asynchronous PDF processing pipeline.
 * Uses micro-yielding (setTimeout 0) between page extractions to prevent main thread freezing,
 * while emitting real-time progress events and checking for cancellation signals.
 */
export async function processPDFDocumentAsync(
  pdfData: ArrayBuffer | Uint8Array,
  options: PDFScanOptions = {}
): Promise<PDFScanResult> {
  const startTime = Date.now();
  const maxPages = options.maxPagesToScan || 25;
  const earlyExitConfidence = options.earlyExitConfidence || 60;
  const onProgress = options.onProgress || (() => {});
  const signal = options.signal;

  // Step 1: Initialize PDF.js worker stream
  onProgress({
    currentPage: 0,
    totalPages: 0,
    scannedPages: 0,
    percent: 5,
    statusText: "Initializing PDF stream & document structure...",
    extractedCharsCount: 0,
    isComplete: false,
  });

  // Yield to UI thread
  await yieldToMainThread();

  if (signal?.aborted) {
    throw new DOMException("PDF scan cancelled by user", "AbortError");
  }

  // Safe timeout for document loading
  const loadPromise = pdfjsLib.getDocument({ data: pdfData }).promise;
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("PDF loading timed out after 10 seconds.")), 10000)
  );

  const pdfDoc: any = await Promise.race([loadPromise, timeoutPromise]);
  const totalDocPages = pdfDoc.numPages;
  const targetPages = Math.min(totalDocPages, maxPages);

  let fullText = "";
  let earlyExitTriggered = false;
  let currentTaxonomyResult = matchMaritimeTaxonomy("");

  onProgress({
    currentPage: 0,
    totalPages: totalDocPages,
    scannedPages: 0,
    percent: 10,
    statusText: `Document opened (${totalDocPages} pages). Scanning first ${targetPages} technical pages...`,
    extractedCharsCount: 0,
    isComplete: false,
  });

  // Step 2: Iterate through pages with non-blocking async yielding
  for (let pageNum = 1; pageNum <= targetPages; pageNum++) {
    if (signal?.aborted) {
      throw new DOMException("PDF scan cancelled by user", "AbortError");
    }

    const currentPercent = Math.round(10 + (pageNum / targetPages) * 75);

    onProgress({
      currentPage: pageNum,
      totalPages: totalDocPages,
      scannedPages: pageNum - 1,
      percent: currentPercent,
      statusText: `Extracting Technical Specs from Page ${pageNum} of ${targetPages}...`,
      matchedEquipmentName: currentTaxonomyResult.matchedTaxonomy?.systemName,
      matchedScore: currentTaxonomyResult.confidenceScore,
      extractedCharsCount: fullText.length,
      isComplete: false,
    });

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      if (pageText.trim()) {
        fullText += `[Page ${pageNum}] ${pageText}\n\n`;
      }

      // Test matched taxonomy every 2 pages or when sufficient text is accumulated
      if (pageNum % 2 === 0 || fullText.length > 600) {
        currentTaxonomyResult = matchMaritimeTaxonomy(fullText);

        // Early Exit: if high-confidence match found on equipment name, statutory code & specs
        if (currentTaxonomyResult.confidenceScore >= earlyExitConfidence) {
          earlyExitTriggered = true;
          onProgress({
            currentPage: pageNum,
            totalPages: totalDocPages,
            scannedPages: pageNum,
            percent: 90,
            statusText: `High-confidence match: "${currentTaxonomyResult.matchedTaxonomy?.systemName}" (${currentTaxonomyResult.confidenceScore}% confidence). Finalizing...`,
            matchedEquipmentName: currentTaxonomyResult.matchedTaxonomy?.systemName,
            matchedScore: currentTaxonomyResult.confidenceScore,
            extractedCharsCount: fullText.length,
            isComplete: false,
          });
          break;
        }
      }
    } catch (pageErr: any) {
      console.warn(`Error on PDF page ${pageNum}:`, pageErr);
      // Continue to next page rather than crashing the pipeline
    }

    // Yield control back to the main UI thread to prevent 60fps frame drops
    await yieldToMainThread();
  }

  // Step 3: Final Taxonomy Analysis & Scoring
  onProgress({
    currentPage: targetPages,
    totalPages: totalDocPages,
    scannedPages: targetPages,
    percent: 95,
    statusText: "Filtering extracted text against Maritime Taxonomy & Acronym Lexicon...",
    extractedCharsCount: fullText.length,
    isComplete: false,
  });

  await yieldToMainThread();

  const finalTaxonomyResult = matchMaritimeTaxonomy(fullText);
  const durationMs = Date.now() - startTime;

  onProgress({
    currentPage: targetPages,
    totalPages: totalDocPages,
    scannedPages: targetPages,
    percent: 100,
    statusText: finalTaxonomyResult.matchedTaxonomy
      ? `Completed in ${(durationMs / 1000).toFixed(1)}s: Matched "${finalTaxonomyResult.matchedTaxonomy.systemName}"`
      : `Scan completed in ${(durationMs / 1000).toFixed(1)}s`,
    matchedEquipmentName: finalTaxonomyResult.matchedTaxonomy?.systemName,
    matchedScore: finalTaxonomyResult.confidenceScore,
    extractedCharsCount: fullText.length,
    isComplete: true,
  });

  return {
    fullExtractedText: fullText,
    taxonomyResult: finalTaxonomyResult,
    totalPages: totalDocPages,
    scannedPagesCount: targetPages,
    earlyExit: earlyExitTriggered,
    durationMs,
  };
}

/**
 * Yields execution to the main thread event loop so UI rendering and animations stay smooth.
 */
function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    } else {
      setTimeout(resolve, 0);
    }
  });
}
