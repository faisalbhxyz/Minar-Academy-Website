import React from "react";
import axiosInstance from "@/lib/axiosInstance";
import CoursesMenu from "../../CoursesMenu";
import { getAllCategories } from "@/app/actions";
import ProgramCard from "@/app/components/courses/ProgramCard";

const getCoursesByCategory = async (
  slug: string
): Promise<CourseDetails[] | null> => {
  try {
    const res = await axiosInstance.get(`/course/category/${slug}`, {
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getAllCategories();

  const courses = await getCoursesByCategory(slug);

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
