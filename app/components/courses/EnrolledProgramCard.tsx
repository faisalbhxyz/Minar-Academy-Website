import Link from "next/link";
import React from "react";
import { FaRegStar } from "react-icons/fa6";
import SafeImage from "@/app/components/SafeImage";

type ProgramCardProps = {
  item: CourseDetails;
};

export default function EnrolledProgramCard({ item }: ProgramCardProps) {
  const progressToDisplay = 0;

  return (
    <div
      className="block w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden
                 hover:shadow-xl duration-300 transform hover:-translate-y-2
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
        <SafeImage
          src={item.featured_image}
          alt={item.title || "Course Featured Image"}
          fill
          className="rounded-t-xl object-cover"
          sizes="(max-width: 640px) 100vw, 400px"
        />
      </div>

      <div className="px-2 py-4 space-y-3">
        <div className="flex items-center gap-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <FaRegStar
              key={i}
              className={`${
                i < Math.floor(0) ? "fill-current" : "text-gray-300"
              }`}
              size={16}
            />
          ))}
        </div>

        <p className="text-base font-semibold text-gray-900 leading-tight mt-2">
          {item.title}
        </p>

        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressToDisplay}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{progressToDisplay}%</p>
        </div>

        <Link
          href={`/user/course/${item.slug}`}
          className="inline-block w-full text-center border border-primary text-primary text-sm font-medium rounded-md py-1 transition duration-300 ease-in-out hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 select-none"
        >
          Continue Course
        </Link>
      </div>
    </div>
  );
}
