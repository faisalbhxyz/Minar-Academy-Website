import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
import CertificateCard from "./CertificateCard";

export default function DashboardCertificatesSection({
  certificates,
  accessToken,
}: {
  certificates: Certificate[];
  accessToken: string;
}) {
  if (certificates.length === 0) return null;

  const preview = certificates.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            My Certificates
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            কোর্স সম্পন্ন করার পর প্রাপ্ত সার্টিফিকেট দেখুন ও ডাউনলোড করুন।
          </p>
        </div>
        {certificates.length > 3 && (
          <Link
            href="/user/dashboard/certificates"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 shrink-0"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-3">
        {preview.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            accessToken={accessToken}
          />
        ))}
      </div>

      {certificates.length <= 3 && certificates.length > 0 && (
        <Link
          href="/user/dashboard/certificates"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          All certificates
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}
