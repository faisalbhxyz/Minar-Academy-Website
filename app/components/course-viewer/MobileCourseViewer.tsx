"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Disclosure,
  DisclosurePanel,
  DisclosureButton,
} from "@headlessui/react";
import {
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { CourseViewerProps, Lesson } from "./types";
import { processCourseDetailsForViewer } from "./utils";
import LessonVideoPlayer from "./LessonVideoPlayer";
import { toast } from "sonner";
import type { CourseProgressData } from "@/lib/courseProgressApi";

const MobileCourseViewer: React.FC<CourseViewerProps> = ({
  courseDetails,
  userCompletedLessonIds,
  courseSlug,
  accessToken,
  studentId,
  apiProgressPercent: initialApiProgressPercent,
}) => {
  const [completedLessonIds, setCompletedLessonIds] = useState(
    userCompletedLessonIds
  );
  const [apiProgressPercent, setApiProgressPercent] = useState(
    initialApiProgressPercent ?? null
  );

  const { chapters } = useMemo(
    () =>
      processCourseDetailsForViewer(
        courseDetails,
        completedLessonIds,
        apiProgressPercent
      ),
    [courseDetails, completedLessonIds, apiProgressPercent]
  );

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lastPlayedLessonId, setLastPlayedLessonId] = useState<number | null>(
    null
  );

  const handleLessonCompleted = useCallback(
    (lessonId: number, data?: CourseProgressData | null) => {
      if (data?.completed_lesson_ids) {
        setCompletedLessonIds(new Set(data.completed_lesson_ids));
      } else {
        setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
      }
      if (data?.progress_percent != null) {
        setApiProgressPercent(data.progress_percent);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeLesson) return;
    const refreshed = chapters
      .flatMap((chapter) => chapter.lessons)
      .find((lesson) => lesson.id === activeLesson.id);
    if (
      refreshed &&
      (refreshed.completed !== activeLesson.completed ||
        refreshed.videoEmbedId !== activeLesson.videoEmbedId)
    ) {
      setActiveLesson(refreshed);
    }
  }, [chapters, activeLesson]);

  // NEW: Keep track of the currently open chapter
  const [openChapterId, setOpenChapterId] = useState<number | null>(null);

  // -------------------------
  // Floating Back Button Logic
  // -------------------------
  const [showBackButton, setShowBackButton] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    setShowBackButton(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowBackButton(false);
    }, 3000);
  };

  useEffect(() => {
    if (activeLesson) resetHideTimer();
  }, [activeLesson]);

  const handleVideoAreaInteract = () => {
    resetHideTimer();
  };

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

  // --------------------------------------------------------------------------
  // SCREEN 1 — CHAPTERS + LESSON LIST
  // --------------------------------------------------------------------------
  if (!activeLesson) {
    return (
      <div className="w-full min-h-screen bg-white pt-4 md:p-4 font-inter">
        <h2 className="text-xl font-bold mb-4">{courseDetails.title}</h2>
        <div className="flex flex-col gap-4">
          {chapters.map((chapter, cIndex: number) => (
            <Disclosure
              key={chapter.id}
              defaultOpen={openChapterId === chapter.id}
            >
              {({ open }) => (
                <div className="border rounded-lg">
                  <DisclosureButton className="w-full p-3 flex justify-between items-center bg-gray-100 font-semibold">
                    {/* Left side */}
                    <div className="flex flex-col text-left">
                      <span className="font-medium">
                        {cIndex + 1}. {chapter.title}
                      </span>

                      <span className="text-gray-500 text-sm mt-1 font-bold">
                        {chapter.lessons.length} videos
                      </span>
                    </div>

                    {/* Right side icon */}
                    <span className="ml-3 flex-shrink-0">
                      {open ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  </DisclosureButton>

                  <DisclosurePanel className="p-2 bg-white">
                    {chapter.lessons.map((lesson: Lesson, index: number) => {
                      const isActive = lastPlayedLessonId === lesson.id;
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setLastPlayedLessonId(lesson.id);
                            setOpenChapterId(chapter.id);
                          }}
                          className={`p-3 rounded-md cursor-pointer mb-2 border 
                            ${
                              isActive
                                ? "bg-blue-50 border-blue-400 text-blue-700"
                                : "bg-gray-50 border-gray-200"
                            }
                          `}
                        >
                          <h3 className="font-medium text-base flex items-center gap-2">
                            <span>{index + 1}.</span> {lesson.title}
                          </h3>
                        </div>
                      );
                    })}
                    {chapter.quizzes.map((quiz) => (
                      <Link
                        key={`quiz-${quiz.id}`}
                        href={`/user/dashboard/quizzes/${courseDetails.slug}/${quiz.id}`}
                        className="flex items-center gap-2 p-3 rounded-md mb-2 border bg-purple-50 border-purple-200 text-purple-800"
                      >
                        <ListChecks className="w-4 h-4 shrink-0" />
                        <span className="font-medium text-base">{quiz.title}</span>
                      </Link>
                    ))}
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2 — VIDEO WATCH PAGE
  // --------------------------------------------------------------------------
  return (
    <div
      className="w-full min-h-screen bg-white font-inter relative mt-4"
      onClick={handleVideoAreaInteract}
      onMouseMove={handleVideoAreaInteract}
    >
      {/* Video Player */}
      <div className="min-w-full bg-black aspect-video relative -m-3">
        {activeLesson.videoProvider && activeLesson.videoEmbedId ? (
          <LessonVideoPlayer
            key={activeLesson.id}
            provider={activeLesson.videoProvider}
            videoId={activeLesson.videoEmbedId}
            autoPlay
            lessonId={activeLesson.id}
            courseSlug={courseSlug}
            accessToken={accessToken}
            studentId={studentId}
            isAlreadyCompleted={completedLessonIds.has(activeLesson.id)}
            onLessonCompleted={handleLessonCompleted}
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center text-white text-sm">
            No video available for this lesson.
          </div>
        )}
      </div>

      {/* FLOATING BACK BUTTON */}
      {showBackButton && (
        <button
          onClick={() => setActiveLesson(null)}
          className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm transition-opacity z-50"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* Lesson Details */}
      <div className="p-4">
        <h2 className="text-lg font-bold">{activeLesson.title}</h2>
        <p className="text-gray-700 text-sm md:text-base font-medium">
          By{" "}
          <span className="font-semibold text-blue-600">
            {courseDetails.course_instructors
              .map(
                (i) => `${i.instructor.first_name} ${i.instructor.last_name}`
              )
              .join(", ")}
          </span>
        </p>

        <div className="w-full h-px bg-gray-200 my-4" />

        {/* Lesson Materials */}
        {activeLesson.resources && activeLesson.resources.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mt-4 -mx-4">
            <h3 className="font-semibold mb-3 text-base md:text-lg">
              চ্যাপ্টার ম্যাটেরিয়াল
            </h3>
            <div className="flex flex-col gap-2">
              {activeLesson.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <span className="text-yellow-600 text-xl">📄</span>
                    <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {resource.title}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* View Button */}
                    <button
                      onClick={() => window.open(resource.file_path, "_blank")}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCourseViewer;
