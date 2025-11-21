import React from "react";
import CourseDetails from "@/app/components/courses/CourseDetails";
import { getCourseBySlug } from "@/app/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const courseDetails = await getCourseBySlug(slug);
  if (!courseDetails) {
    return <div className="wrapper my-10">Course not found.</div>;
  }

  return (
    <div className="wrapper my-10">
      <CourseDetails course={courseDetails} />
    </div>
  );
}
