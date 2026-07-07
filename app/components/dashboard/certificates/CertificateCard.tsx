import { Award } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificateHelpers";
import CertificateOpenButton from "./CertificateOpenButton";

export default function CertificateCard({
  certificate,
  accessToken,
}: {
  certificate: Certificate;
  accessToken: string;
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

      <div className="shrink-0">
        <CertificateOpenButton
          accessToken={accessToken}
          certificateId={certificate.id}
        />
      </div>
    </div>
  );
}
