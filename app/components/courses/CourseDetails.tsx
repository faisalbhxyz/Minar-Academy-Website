"use client";

import Image from "next/image";
import React, { useState } from "react";
import CourseSubjects from "./CourseSubjects";
import CourseInstructor from "./CourseInstructor";
import StudentReview from "./StudentReview";
import GeneraleQuestions from "./GeneraleQuestions";
import { MdOutlineCheckCircle } from "react-icons/md";
import ProgramPath from "./ProgramPath";
import Blueprint from "./Blueprint";
import useAppStore from "@/hooks/useAppStore";
import CourseVideoCard from "./CourseVideoCard";
import LessonVideoCard from "./LessonVideoCard";

export default function CourseDetails({
  course,
}: {
  course: CourseDetails | undefined;
}) {
  const { isVideoPlay } = useAppStore();
  const [isActive, setIsActive] = useState(1);

  if (!course) {
    return <p className="text-red-500">Course not found.</p>;
  }
  return (
    <div className="flex items-start my-10 gap-10">
      <div className="w-full">
        {/* Course Image */}
        <div className="w-full rounded-lg overflow-hidden">
          {/* {isVideoPlay && instructor.demoVideoId ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden relative">
              <YtVideoPlay videoId={instructor.demoVideoId} />
            </div>
          ) : ( */}
          <CourseVideoCard
            title={course.title}
            image={course.featured_image}
            video={course.intro_video?.data.source}
          />
        </div>

        {/* Course Title */}
        <p className="text-2xl mt-5">{course.title}</p>

        {/* Stats */}
        {/* <div className="flex flex-col md:flex-row border rounded-lg mt-5 bg-gray-100">
          {[
            { label: "Students", value: 0 },
            {
              label: "Hours of Lessons",
              value: course.general_settings.duration,
            },
            {
              label: "Total Lessons",
              value:
                course.course_chapters &&
                course.course_chapters.reduce((sum, chapter) => {
                  return sum + (chapter.course_lessons?.length || 0);
                }, 0),
            },
          ].map((item, i) => (
            <div key={i} className="w-full flex flex-col items-center p-5">
              <p className="text-3xl">{item.value}</p>
              <p>{item.label}</p>
            </div>
          ))}
        </div> */}
        <div className="lg:hidden mt-5">
          <ProgramPath course={course} />
        </div>
        {/* Tabs */}
        <div className="mt-10">
          <div className="overflow-x-auto">
            <ul className="min-w-4xl flex items-center gap-5 border-b border-gray-300">
              {[{ id: 1, label: "কোর্স বর্ণনা" }].map((tab) => (
                <li
                  key={tab.id}
                  className={`${
                    isActive === tab.id && "border-primary text-primary"
                  } px-6 py-2 border-b text-[#424242] transition duration-300 border-transparent cursor-pointer`}
                  onClick={() => setIsActive(tab.id)}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Tab Content */}
          <div className="mt-5">
            {isActive === 1 && (
              <div className="px-6"
                dangerouslySetInnerHTML={{ __html: course.description || "" }}
              ></div>
            )}
          </div>
        </div>
        <CourseSubjects chapters={course.course_chapters} />
        <CourseInstructor instructors={course.course_instructors} />
        {/* <StudentReview /> */}
        {/* <GeneraleQuestions /> */}
        {/* <Blueprint /> */}
        {/* <ConsultationForm /> */}
        <LessonVideoCard />
      </div>

      {/* Sticky Sidebar */}
      <div className="w-96 min-w-96 hidden lg:block sticky top-24">
        <ProgramPath course={course} />
      </div>
    </div>
  );
}
