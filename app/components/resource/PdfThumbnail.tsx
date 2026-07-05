"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaFilePdf } from "react-icons/fa6";

import { renderPdfPageToDataUrl } from "@/lib/pdfjs";

type Props = {
  pdfUrl: string;
  alt: string;
  apiThumbnail?: string | null;
};

export default function PdfThumbnail({ pdfUrl, alt, apiThumbnail }: Props) {
  const [src, setSrc] = useState<string | null>(apiThumbnail ?? null);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiThumbnail) {
      setSrc(apiThumbnail);
      setFailed(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        renderPdfPageToDataUrl(pdfUrl)
          .then((dataUrl) => {
            if (!cancelled) setSrc(dataUrl);
          })
          .catch(() => {
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: "120px" }
    );

    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [apiThumbnail, pdfUrl]);

  return (
    <div
      ref={containerRef}
      className="bg-indigo-200 h-40 flex justify-center items-center p-1 overflow-hidden"
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          width={320}
          height={400}
          unoptimized
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <span className="text-indigo-500">
          <FaFilePdf size={64} />
        </span>
      )}
    </div>
  );
}
