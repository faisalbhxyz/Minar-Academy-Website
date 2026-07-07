"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { openCertificateInNewTab } from "@/lib/studentCertificateApi";

type Props = {
  accessToken: string;
  certificateId: number;
  className?: string;
  label?: string;
  showInPageLink?: boolean;
};

export default function CertificateOpenButton({
  accessToken,
  certificateId,
  className = "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors",
  label = "View & Download",
  showInPageLink = true,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await openCertificateInNewTab(accessToken, certificateId);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not open certificate";
      if (message.includes("Pop-up blocked")) {
        toast.error(message, {
          action: {
            label: "Open in page",
            onClick: () => {
              window.location.href = `/user/dashboard/certificates/${certificateId}`;
            },
          },
        });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        <Download className="h-4 w-4" />
        {loading ? "Opening…" : label}
      </button>
      {showInPageLink && (
        <Link
          href={`/user/dashboard/certificates/${certificateId}`}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          In-page view
        </Link>
      )}
    </div>
  );
}
