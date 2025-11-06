import React from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getAllCategories } from "@/app/actions";
import ProgramCard from "@/app/components/courses/ProgramCard";
import CoursesMenu from "../CoursesMenu";

const getCoursesByMenu = async (
  slug: string
): Promise<CourseDetails[] | null> => {
  try {
    const res = await axiosInstance.get(`/course/menu/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default async function Page({
  params,
}: {
  params: Promise<{ menu: string }>;
}) {
  const { menu } = await params;
  const categories = await getAllCategories();

  const courses = await getCoursesByMenu(menu);

  console.log("ALL COURSES", courses);
  

  return (
    <>
      <CoursesMenu categories={categories} />
      <div className="wrapper my-20">
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {courses.map((item) => (
              <ProgramCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-2 text-2xl font-medium text-center">
            No Courses Found
          </div>
        )}
      </div>
    </>
  );
}
