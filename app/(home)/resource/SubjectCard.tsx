import Link from "next/link";
import React from "react";

import PdfThumbnail from "@/app/components/resource/PdfThumbnail";

export type NoteCardItem = {
  id: number;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  pdfUrl: string;
  href: string;
};

type Props = {
  note: NoteCardItem;
};

const SubjectCard: React.FC<Props> = ({ note }) => {
  return (
    <Link
      href={note.href}
      className="border hover:border-primary rounded-lg transition-all overflow-hidden"
    >
      <PdfThumbnail
        pdfUrl={note.pdfUrl}
        alt={note.title}
        apiThumbnail={note.thumbnail}
      />
      <div className="p-4 space-y-3">
        <p className="text-xl font-semibold">{note.title}</p>
        {note.subtitle ? (
          <p className="text-sm text-gray-600">{note.subtitle}</p>
        ) : null}
        <p className="text-primary font-medium">PDF</p>
      </div>
    </Link>
  );
};

export default SubjectCard;
