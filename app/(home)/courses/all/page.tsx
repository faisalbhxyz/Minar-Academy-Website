import ProgramCard from "@/app/components/courses/ProgramCard";
import React from "react";
import CoursesMenu from "../CoursesMenu";
import { courses } from "@/lib/constants";

export default function Page() {
  const boardExams = courses.filter((course) => course.category === "Board");
  // const academicPrograms = courses.filter(
  //   (course) => course.category === "Academic"
  // );

  // console.log(academicPrograms);

  return (
    <>
      <CoursesMenu />

      <div className="wrapper my-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {boardExams.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
