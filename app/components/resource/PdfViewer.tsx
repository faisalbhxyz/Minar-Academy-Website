"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaFilePdf } from "react-icons/fa6";

import { loadPdfDocument } from "@/lib/pdfjs";

type Props = {
  pdfUrl: string;
  title: string;
};

type PageThumb = {
  pageNumber: number;
  dataUrl: string;
};

export default function PdfViewer({ pdfUrl, title }: Props) {
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      setLoading(true);
      setError(false);

      try {
        const pdf = await loadPdfDocument(pdfUrl);
        const total = pdf.numPages;
        const thumbs: PageThumb[] = [];

        for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (!context) continue;

          await page.render({ canvasContext: context, viewport, canvas })
            .promise;

          thumbs.push({
            pageNumber,
            dataUrl: canvas.toDataURL("image/jpeg", 0.9),
          });
        }

        if (!cancelled) {
          setPages(thumbs);
          setActivePage(1);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPages();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const current = pages.find((page) => page.pageNumber === activePage);

  if (loading) {
    return (
      <div className="w-full border flex h-[32rem] bg-gray-100 rounded-xl items-center justify-center text-gray-500">
        PDF লোড হচ্ছে...
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="w-full border flex h-[32rem] bg-gray-100 rounded-xl flex-col items-center justify-center gap-3 text-gray-500">
        <FaFilePdf size={48} className="text-indigo-400" />
        <p>প্রিভিউ লোড করা যায়নি। নিচের ডাউনলোড বাটন ব্যবহার করুন।</p>
      </div>
    );
  }

  return (
    <div className="w-full border flex h-[32rem] bg-gray-100 rounded-xl overflow-hidden">
      <div className="w-28 min-w-28 md:w-40 md:min-w-40 h-full overflow-y-auto p-3 space-y-3 bg-white border-r">
        {pages.map((page) => (
          <button
            key={page.pageNumber}
            type="button"
            onClick={() => setActivePage(page.pageNumber)}
            className={`w-full rounded border transition-colors ${
              activePage === page.pageNumber
                ? "border-primary ring-1 ring-primary"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <Image
              src={page.dataUrl}
              alt={`${title} — page ${page.pageNumber}`}
              width={160}
              height={220}
              unoptimized
              className="w-full h-auto"
            />
          </button>
        ))}
      </div>

      <div className="h-full w-full overflow-y-auto p-4">
        {current ? (
          <Image
            src={current.dataUrl}
            alt={`${title} — page ${current.pageNumber}`}
            width={900}
            height={1200}
            unoptimized
            className="w-full h-auto mx-auto"
          />
        ) : null}
      </div>
    </div>
  );
}
