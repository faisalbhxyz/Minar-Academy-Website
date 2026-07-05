import ProgramCard from "@/app/components/courses/ProgramCard";
import React from "react";
import CoursesMenu from "../CoursesMenu";
import { getAllCategories, getAllCourses } from "@/app/actions";

export default async function Page() {
  const courses = await getAllCourses();
  const categories = await getAllCategories();

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
