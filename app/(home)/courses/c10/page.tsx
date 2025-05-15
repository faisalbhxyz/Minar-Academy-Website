import React from "react";
import ProgramCard from "@/app/components/courses/ProgramCard";
import CoursesMenu from "../CoursesMenu";
import { courses } from "@/lib/constants";

export default function Page() {
  const academicPrograms = courses.filter((course) =>
    course.tag.includes("ten")
  );
  const animatedPrograms = courses.filter(
    (course) => course.category === "Animated"
  );

  return (
    <>
      <CoursesMenu />
      <div className="wrapper mt-20 pb-10 border-b border-gray-300">
        <p className="text-3xl font-semibold mb-6">একাডেমিক প্রোগ্রাম</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {academicPrograms.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="wrapper mb-20 pt-10">
        <p className="text-3xl font-semibold mb-6">অ্যানিমেটেড লেসনস বান্ডেল</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {animatedPrograms.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
