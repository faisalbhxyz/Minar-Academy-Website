import React from "react";
import CourseDetails from "@/app/components/courses/CourseDetails";
import { courses } from "@/lib/constants";
import { getCourseByID } from "@/app/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId = parseInt((await params).id, 10);
  // const courseDetails = courses.find((item) => item.id === courseId);

  const courseDetails = await getCourseByID(courseId);

  console.log(courseDetails);
  

  if (!courseDetails) {
    return <div className="wrapper my-10">Course not found.</div>;
  }

  return (
    <div className="wrapper my-10">
      <CourseDetails course={courseDetails} />
    </div>
  );
}
