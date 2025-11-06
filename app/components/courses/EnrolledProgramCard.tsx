import Image from "next/image";
import Link from "next/link";
import React from "react"; // Importing Star icon from lucide-react
import { FaRegStar } from "react-icons/fa6";

type ProgramCardProps = {
  item: CourseDetails;
};

export default function ProgramCard({ item }: ProgramCardProps) {
  // Calculate progress if not directly provided, though it's best to provide it
  const calculatedProgress = 0;
  //   item.totalLessons > 0 ? Math.round((item.completedLessons / item.totalLessons) * 100) : 0;
  const progressToDisplay = 0;
  //   item.progressPercentage || calculatedProgress;

  return (
    <div
      className="block w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden
                 hover:shadow-xl duration-300 transform hover:-translate-y-2
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {/* Image Section */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
        <Image
          src={
            item.featured_image
              ? item.featured_image
              : "https://placehold.co/800x500/007BFF/FFFFFF?text=Course+Image" // Placeholder image
          }
          alt={item.title || "Course Featured Image"}
          layout="fill" // Use layout="fill" for responsive images
          objectFit="cover" // Cover the area without distorting aspect ratio
          className="rounded-t-xl"
        />
      </div>

      {/* Content Section */}
      <div className="px-2 py-4 space-y-3">
        {/* Rating Section */}
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
          {/* <span className="text-gray-700 font-semibold text-sm">{0}</span> */}
        </div>

        {/* Title */}
        <p className="text-base font-semibold text-gray-900 leading-tight mt-2">
          {item.title}
        </p>

        <div className="flex items-center gap-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressToDisplay}%` }}
            ></div>
          </div>

          {/* Progress Percentage Text */}
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
