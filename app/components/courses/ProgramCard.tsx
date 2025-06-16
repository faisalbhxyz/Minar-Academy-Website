import Image from "next/image";
import Link from "next/link";
import React from "react";

type ProgramCardProps = {
  item: CourseDetails;
};

export default function ProgramCard({ item }: ProgramCardProps) {
  return (
    <Link
      href={`/courses/${item.id}`}
      className="border rounded-xl overflow-hidden hover:shadow-xl duration-300 hover:-translate-y-2"
    >
      <Image
        src={
          item.featured_image ? item.featured_image : "/images/placeholder.svg"
        }
        alt={item.title}
        width={800}
        height={500}
      />
      <div className="p-4 space-y-3">
        <p className="mt-2 text-lg font-medium">{item.title}</p>
        <div className="flex items-center gap-4 mt-5">
          <p className="text-xl font-semibold">মাত্র ৳{item?.sale_price}</p>
          <p className="line-through text-lg text-gray-500">
            ৳{item?.regular_price}
          </p>
        </div>
      </div>
    </Link>
  );
}
