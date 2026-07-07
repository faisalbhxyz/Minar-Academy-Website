import { getStudentCertificates } from "@/app/actions";
import CertificateCard from "@/app/components/dashboard/certificates/CertificateCard";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const certificates = await getStudentCertificates(session);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-7 w-7 text-amber-600" />
          My Certificates
        </h1>
        <p className="text-gray-600 mt-1">
          আপনার অর্জিত সার্টিফিকেট দেখুন এবং PDF হিসেবে ডাউনলোড করুন।
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-800">এখনো কোনো সার্টিফিকেট নেই</p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            কোর্সের নির্ধারিত সম্পূর্ণতার শতাংশ পূরণ করলে সার্টিফিকেট স্বয়ংক্রিয়ভাবে
            ইস্যু হবে এবং এখানে দেখা যাবে।
          </p>
          <Link
            href="/user/dashboard/enrolled-courses"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Enrolled courses এ যান
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              accessToken={session.accessToken}
            />
          ))}
        </div>
      )}
    </div>
  );
}
