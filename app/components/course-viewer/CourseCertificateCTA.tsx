"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { openCertificateInNewTab } from "@/lib/studentCertificateApi";

type Props = {
  accessToken: string;
  courseCertificate: Certificate | null;
};

export default function CourseCertificateCTA({
  accessToken,
  courseCertificate,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!courseCertificate) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
        <Award className="mx-auto h-5 w-5 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600">
          কোর্স সম্পন্ন করলে সার্টিফিকেট আনলক হবে।
        </p>
      </div>
    );
  }

  const handleView = async () => {
    setLoading(true);
    try {
      await openCertificateInNewTab(accessToken, courseCertificate.id);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not open certificate";
      if (message.includes("Pop-up blocked")) {
        toast.error(message, {
          action: {
            label: "Open in dashboard",
            onClick: () => {
              window.location.href = `/user/dashboard/certificates/${courseCertificate.id}`;
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
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-medium text-amber-900 mb-2 flex items-center gap-1.5">
        <Award className="h-4 w-4" />
        আপনার সার্টিফিকেট প্রস্তুত!
      </p>
      <button
        type="button"
        onClick={handleView}
        disabled={loading}
        className="w-full rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white hover:bg-teal-900 transition-colors disabled:opacity-60"
      >
        {loading ? "Opening…" : "View Certificate"}
      </button>
    </div>
  );
}
