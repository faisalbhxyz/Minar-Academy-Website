import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMiniArrowSmallRight } from "react-icons/hi2";

const courses = [
  {
    id: 1,
    title: "বিএস প্রশ্ন সমাধান",
    image: "/images/thumbnail.png",
    authorized: "Akib Chowdhuri",
  },
  {
    id: 2,
    title: "বিএস প্রশ্ন সমাধান",
    image: "/images/thumbnail.png",
    authorized: "Akib Chowdhuri",
  },
  {
    id: 3,
    title: "বিএস প্রশ্ন সমাধান",
    image: "/images/thumbnail.png",
    authorized: "Akib Chowdhuri",
  },
  {
    id: 4,
    title: "বিএস প্রশ্ন সমাধান",
    image: "/images/thumbnail.png",
    authorized: "Akib Chowdhuri",
  },
];

export default function Course() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 py-10 mt-10">
      <p className="text-center text-5xl font-bold mb-10">
        অনলাইন ব্যাচে সকল কোর্সে ভর্তি চলছে!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <Link href={""}>
              <Image
                src={course.image}
                alt={course.title}
                width={300}
                height={200}
                className="w-full h-auto object-cover rounded-t-xl"
              />
            </Link>
            <div className="p-4 flex flex-col justify-between">
              <Link href="" className="text-xl font-semibold">
                {course.title}
              </Link>
              <div className="mt-5 space-y-3">
                <p className="text-gray-600 text-sm">By {course.authorized}</p>
                <Link
                  href={""}
                  className="text-primary text-sm flex items-center"
                >
                  বিস্তারিত <HiMiniArrowSmallRight size={22} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
