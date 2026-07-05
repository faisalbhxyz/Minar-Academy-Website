import Link from "next/link";
import { Award, ChevronRight, Download } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificateHelpers";

export default function CertificateCard({
  certificate,
}: {
  certificate: Certificate;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 rounded-full bg-amber-100 p-2.5 text-amber-700">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {certificate.course_title}
          </h3>
          <p className="text-sm text-gray-600">
            {certificate.student_name}
          </p>
          <p className="text-xs text-gray-500">
            Issued {formatCertificateDate(certificate.issued_at)} ·{" "}
            {certificate.certificate_number}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/user/dashboard/certificates/${certificate.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          View & Download
        </Link>
        <Link
          href={`/user/dashboard/certificates/${certificate.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:hidden"
        >
          Open
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
