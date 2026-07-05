"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

let workerReady = false;

async function ensureWorker() {
  if (workerReady) return;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  workerReady = true;
}

export function getProxiedPdfUrl(url: string) {
  return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
}

export async function loadPdfDocument(url: string): Promise<PDFDocumentProxy> {
  await ensureWorker();
  const pdfjs = await import("pdfjs-dist");

  try {
    return await pdfjs.getDocument({ url, withCredentials: false }).promise;
  } catch {
    const proxied = getProxiedPdfUrl(url);
    return await pdfjs.getDocument({ url: proxied, withCredentials: false })
      .promise;
  }
}

export async function renderPdfPageToDataUrl(
  pdfUrl: string,
  pageNumber = 1,
  scale = 0.4
): Promise<string> {
  const pdf = await loadPdfDocument(pdfUrl);
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context unavailable");

  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL("image/jpeg", 0.85);
}
