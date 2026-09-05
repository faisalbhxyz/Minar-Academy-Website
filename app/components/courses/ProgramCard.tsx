import Link from "next/link";
import React from "react";
import SafeImage from "@/app/components/SafeImage";

type ProgramCardProps = {
  item: CourseDetails;
};

export default function ProgramCard({ item }: ProgramCardProps) {
  return (
    <Link
      href={`/course/${item.slug}`}
      className="border rounded-xl overflow-hidden hover:shadow-xl duration-300 hover:-translate-y-2"
    >
      <SafeImage
        src={item.featured_image}
        alt={item.title}
        width={800}
        height={500}
        className="h-auto w-full object-cover"
      />
      <div className="p-4 space-y-3">
        <p className="mt-2 text-lg font-medium">{item.title}</p>
        {item.regular_price && item.regular_price > 0 ? (
          <div className="flex items-center gap-4 mt-5">
            <p className="text-xl font-semibold">মাত্র ৳{item?.sale_price}</p>
            <p className="line-through text-lg text-gray-500">
              ৳{item?.regular_price}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-5">
            <p className="text-xl font-semibold">ফ্রী</p>
          </div>
        )}
      </div>
    </Link>
  );
}
