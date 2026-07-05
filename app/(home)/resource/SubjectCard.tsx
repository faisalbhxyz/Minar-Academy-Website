import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaFilePdf } from "react-icons/fa6";

export type NoteCardItem = {
  id: number;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  pdfUrl: string;
};

type Props = {
  note: NoteCardItem;
};

const SubjectCard: React.FC<Props> = ({ note }) => {
  return (
    <Link
      href={note.pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="border hover:border-primary rounded-lg transition-all overflow-hidden"
    >
      <div className="bg-indigo-200 h-40 flex justify-center items-center p-1">
        {note.thumbnail ? (
          <Image
            src={note.thumbnail}
            alt={note.title}
            width={200}
            height={200}
            className="w-auto h-full object-contain"
          />
        ) : (
          <span className="text-indigo-500">
            <FaFilePdf size={64} />
          </span>
        )}
      </div>
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
