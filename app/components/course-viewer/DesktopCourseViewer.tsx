// FULLY NEW, FROM-SCRATCH DESIGN — PIXEL PERFECT LIKE ATTACHED IMAGE
// NO PREVIOUS COMPONENTS USED AT ALL except <LessonVideoPlayer>
// First lesson autoloads, sidebar switches lesson
// Clean modern UI inspired EXACTLY by your screenshot

"use client";

import React, { useState } from "react";
import LessonVideoPlayer from "./LessonVideoPlayer";
import { CourseDetails, Chapter, Lesson } from "./types";
import { processCourseDetailsForViewer } from "./utils";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Eye, ListChecks } from "lucide-react";

interface Props {
  courseDetails: CourseDetails;
  userCompletedLessonIds: Set<number>;
}

export default function DesktopCourseViewer({
  courseDetails,
  userCompletedLessonIds,
}: Props) {
  const { chapters, initialActiveLesson, initialCurrentLessonTitle, progress } =
    processCourseDetailsForViewer(courseDetails, userCompletedLessonIds);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    initialActiveLesson
  );

  const handleDownloadLessonResource = async (resource: {
    file_path: string;
    title: string;
  }) => {
    try {
      const res = await fetch(resource.file_path, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Failed to fetch file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title; // filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] py-6 px-4 font-inter">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 max-w-6xl mx-auto mb-4 flex gap-2">
        <span className="cursor-pointer hover:text-black">কোর্সসমূহ</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-black">
          {courseDetails.title}
        </span>
        <span>/</span>
        <span className="text-black font-medium">{activeLesson?.title}</span>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6">
        {/* LEFT SIDE */}
        <div className="w-full space-y-6">
          {/* VIDEO PLAYER */}
          <div className="w-full rounded-xl overflow-hidden bg-black shadow-md aspect-video">
            {activeLesson && activeLesson.videoSource.value && (
              <LessonVideoPlayer
                key={activeLesson.id}
                provider="youtube"
                videoId={activeLesson.videoSource.value}
                autoPlay
              />
            )}
          </div>

          {/* LESSON TITLE */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {activeLesson?.title}
            </h1>
            <p className="text-gray-500 text-sm">{activeLesson?.title}</p>
          </div>

          {/* ACTION BUTTONS */}
          {/* <div className="flex items-center gap-4 text-gray-600 text-sm">
            <button className="flex items-center gap-1 hover:text-black">
              <span>🔗</span> শেয়ার
            </button>
            <button className="flex items-center gap-1 hover:text-black">
              <span>🚫</span> রিপোর্ট
            </button>
            <button className="ml-auto flex items-center gap-1 hover:text-black">
              <span>⬇️</span> ডাউনলোড
            </button>
          </div> */}

          {/* CHAPTER MATERIAL SECTION */}
          {activeLesson &&
            activeLesson.resources &&
            activeLesson.resources.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h2 className="font-semibold mb-3">চ্যাপ্টার ম্যাটেরিয়াল</h2>
                {activeLesson.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-2"
                  >
                    {/* File Info */}
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-600 text-xl">📄</span>
                      <span className="font-medium">{resource.title}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* View Button */}
                      <button
                        onClick={() =>
                          window.open(resource.file_path, "_blank")
                        }
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownloadLessonResource(resource)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* RIGHT SIDE SIDEBAR */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">কোর্স সিলেবাস</h3>
            <span className="text-sm text-gray-500">
              {progress.percentage}% সম্পন্ন
            </span>
          </div>

          {/* CHAPTERS + LESSONS */}
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="border-b pb-3">
                <div className="font-semibold text-gray-900 mb-2">
                  {chapter.title}
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                        activeLesson?.id === lesson.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{lesson.completed ? "✔️" : "▶️"}</span>
                      <span className="text-sm font-medium">
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                  {chapter.quizzes.map((quiz) => (
                    <Link
                      key={`quiz-${quiz.id}`}
                      href={`/user/dashboard/quizzes/${courseDetails.slug}/${quiz.id}`}
                      className="flex items-center gap-2 p-2 rounded transition hover:bg-purple-50 text-purple-700"
                    >
                      <ListChecks className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{quiz.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
