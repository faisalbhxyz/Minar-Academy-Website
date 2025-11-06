import ProgramCard from "@/app/components/courses/ProgramCard";
import React from "react";
import CoursesMenu from "../CoursesMenu";
import { courses } from "@/lib/constants";
import { getAllCategories, getAllCourses } from "@/app/actions";

export default async function Page() {
  // const academicPrograms = courses.filter(
  //   (course) => course.category === "Academic"
  // );

  // console.log(academicPrograms);

  const courses = await getAllCourses();

  console.log("ALL COURSES",courses);
  

  const categories = await getAllCategories();

  // const boardExams = courses.filter(
  //   (course) => course.general_settings.category.name === "Board"
  // );

  return (
    <>
      <CoursesMenu categories={categories}/>
      <div className="wrapper my-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {courses.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
