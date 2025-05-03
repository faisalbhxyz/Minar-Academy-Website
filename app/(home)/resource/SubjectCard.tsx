import React from "react";
import Link from "next/link";
import Image from "next/image";

export type Subject = {
  id: number;
  name: string;
  image: string;
  description: string;
};

type Props = {
  subject: Subject;
};

const SubjectCard: React.FC<Props> = ({ subject }) => {
  return (
    <Link
      href={`/resource/single/${subject.id}`}
      className="border hover:border-primary rounded-lg transition-all overflow-hidden"
    >
      <div className="bg-indigo-200 h-40 flex justify-center p-1">
        <Image
          src={subject.image}
          alt={subject.name}
          width={200}
          height={200}
          className="w-auto h-full"
        />
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xl font-semibold">{subject.name}</p>
        <p className="text-sm text-gray-600">{subject.description}</p>
        <p className="text-primary font-medium">PDF</p>
      </div>
    </Link>
  );
};

export default SubjectCard;
