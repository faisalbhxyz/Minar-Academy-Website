import Image from "next/image";
import Link from "next/link";
import React from "react";

export type Program = {
  id: number;
  title: string;
  price: string;
  image: string;
};

type ProgramCardProps = {
  item: Program;
};

export default function ProgramCard({ item }: ProgramCardProps) {
  return (
    <Link
      href={`/courses/${item.id}`}
      className="border rounded-xl overflow-hidden hover:shadow-xl duration-300 hover:-translate-y-2"
    >
      <Image src={item.image} alt={item.title} width={500} height={300} />
      <div className="p-4 space-y-3">
        <p className="mt-2 text-lg font-medium">{item.title}</p>
        <p className="text-sm text-gray-600">মাত্র ৳{item.price}</p>
      </div>
    </Link>
  );
}
