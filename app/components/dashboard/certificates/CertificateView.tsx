"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Download, Printer } from "lucide-react";
import {
  formatCertificateDate,
  resolveCertificateTemplateUrl,
} from "@/lib/certificateHelpers";

type Props = {
  certificate: Certificate;
  showActions?: boolean;
};

export default function CertificateView({
  certificate,
  showActions = true,
}: Props) {
  const templateUrl = resolveCertificateTemplateUrl(certificate.template_path);

  useEffect(() => {
    document.body.classList.add("printing-certificate");
    return () => document.body.classList.remove("printing-certificate");
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-print-wrapper space-y-4">
      {showActions && (
        <div className="flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download / Save as PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      )}

      <div
        id="certificate-print"
        className="certificate-print-area relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        style={{ aspectRatio: "297 / 210" }}
      >
        <Image
          src={templateUrl}
          alt="Certificate template"
          fill
          className="object-cover"
          priority
          unoptimized
        />

        <div className="absolute inset-0 flex flex-col items-center px-[8%] py-[10%] text-center text-[#1a1a2e]">
          {certificate.title && (
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide uppercase">
              {certificate.title}
            </h1>
          )}

          {certificate.subtitle_one && (
            <p className="mt-[6%] text-sm sm:text-base md:text-lg text-gray-700">
              {certificate.subtitle_one}
            </p>
          )}

          <h2 className="mt-[4%] text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f3460] leading-tight">
            {certificate.student_name}
          </h2>

          {(certificate.subtitle_two || certificate.course_title) && (
            <p className="mt-[3%] max-w-[85%] text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              {certificate.subtitle_two}{" "}
              {certificate.course_title && (
                <strong className="font-semibold text-[#0f3460]">
                  {certificate.course_title}
                </strong>
              )}
            </p>
          )}

          {certificate.progress_percent >= 100 && (
            <p className="mt-[2%] text-xs sm:text-sm font-medium text-emerald-700">
              Completed {certificate.progress_percent}%
            </p>
          )}

          <div className="mt-auto w-full flex items-end justify-between gap-4 pt-[4%]">
            <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
              {certificate.owner_signature ? (
                <div className="relative h-10 sm:h-14 w-24 sm:w-32">
                  <Image
                    src={certificate.owner_signature}
                    alt="Owner signature"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-10 sm:h-14" />
              )}
              <span className="w-full border-t border-gray-400 pt-1 text-[10px] sm:text-xs text-gray-600">
                Authorized Signatory
              </span>
            </div>

            <div className="flex flex-col items-center text-center flex-shrink-0 px-2">
              <p className="text-[10px] sm:text-xs text-gray-600">
                Certificate No: {certificate.certificate_number}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                Issued: {formatCertificateDate(certificate.issued_at)}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
              {certificate.instructor_signature ? (
                <div className="relative h-10 sm:h-14 w-24 sm:w-32">
                  <Image
                    src={certificate.instructor_signature}
                    alt="Instructor signature"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-10 sm:h-14" />
              )}
              <span className="w-full border-t border-gray-400 pt-1 text-[10px] sm:text-xs text-gray-600">
                Instructor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
