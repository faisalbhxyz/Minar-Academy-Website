"use client";

import { FaFilePdf } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";

import PdfViewer from "@/app/components/resource/PdfViewer";

type Props = {
  note: {
    title: string;
    subtitle?: string | null;
    pdfUrl: string;
    pdfFileName: string;
  };
  meta: {
    classTitle: string;
    subjectTitle: string;
    paperTitle: string;
  };
};

export default function NoteDetail({ note, meta }: Props) {
  const downloadName = note.pdfFileName || `${note.title}.pdf`;

  return (
    <div className="wrapper py-10 flex flex-col md:flex-row items-start gap-5">
      <PdfViewer pdfUrl={note.pdfUrl} title={note.title} />

      <div className="w-full md:w-96 md:min-w-96 border p-5 rounded-xl">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <span className="text-red-500 bg-red-100 p-2 rounded-full">
            <FaFilePdf size={33} />
          </span>
          <div>
            <p className="font-semibold text-lg">{note.title}</p>
            {note.subtitle ? (
              <p className="text-sm text-gray-600">{note.subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 py-4 border-b border-gray-200 text-gray-700">
          <p>{meta.classTitle}</p>
          <p>{meta.subjectTitle}</p>
          <p>{meta.paperTitle}</p>
        </div>

        <a
          href={note.pdfUrl}
          download={downloadName}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 my-4 px-6 py-3 text-white bg-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          <MdOutlineFileDownload size={23} /> ডাউনলোড করুন
        </a>
      </div>
    </div>
  );
}
