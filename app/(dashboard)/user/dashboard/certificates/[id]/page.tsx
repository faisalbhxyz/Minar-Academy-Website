import { getStudentCertificateById } from "@/app/actions";
import CertificateEmbed from "@/app/components/dashboard/certificates/CertificateEmbed";
import CertificateOpenButton from "@/app/components/dashboard/certificates/CertificateOpenButton";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CertificateDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const certificateId = Number(id);
  if (!Number.isFinite(certificateId)) notFound();

  const certificate = await getStudentCertificateById(certificateId, session);
  if (!certificate) notFound();

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/user/dashboard/certificates"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to certificates
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {certificate.course_title}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Certificate No: {certificate.certificate_number}
          </p>
        </div>
        <CertificateOpenButton
          accessToken={session.accessToken}
          certificateId={certificate.id}
          label="Open in new tab"
          showInPageLink={false}
        />
      </div>

      <CertificateEmbed
        accessToken={session.accessToken}
        certificateId={certificate.id}
      />
    </div>
  );
}
