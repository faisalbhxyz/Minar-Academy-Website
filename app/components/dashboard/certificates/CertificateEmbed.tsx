"use client";

import { useEffect, useState } from "react";
import {
  CertificateApiError,
  fetchCertificateHTML,
} from "@/lib/studentCertificateApi";

export default function CertificateEmbed({
  accessToken,
  certificateId,
}: {
  accessToken: string;
  certificateId: number;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCertificateHTML(accessToken, certificateId)
      .then((h) => {
        if (!cancelled) setHtml(h);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof CertificateApiError && e.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load certificate");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, certificateId]);

  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!html) {
    return (
      <p className="text-gray-600 text-sm animate-pulse">Loading certificate…</p>
    );
  }

  return (
    <iframe
      title="Certificate"
      srcDoc={html}
      className="w-full border-0 rounded-lg"
      style={{ minHeight: "70vh", aspectRatio: "297 / 210" }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
