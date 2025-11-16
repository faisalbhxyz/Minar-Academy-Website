"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Disclosure,
  DisclosurePanel,
  DisclosureButton,
} from "@headlessui/react";
import { ArrowLeftIcon, ChevronDown, ChevronUp } from "lucide-react";
import { CourseViewerProps, Lesson } from "./types";
import { processCourseDetailsForViewer } from "./utils";
import LessonVideoPlayer from "./LessonVideoPlayer";

interface Material {
  id: number;
  title: string;
}

const staticMaterials: Material[] = [
  { id: 1, title: "কোর্স নোট (PDF)" },
  { id: 2, title: "চেকলিস্ট (PDF)" },
  { id: 3, title: "প্র্যাকটিস এক্সারসাইজ" },
];

const MobileCourseViewer: React.FC<CourseViewerProps> = ({ courseDetails }) => {
  const { chapters, initialActiveLesson, initialCurrentLessonTitle, progress } =
    processCourseDetailsForViewer(courseDetails, new Set());

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lastPlayedLessonId, setLastPlayedLessonId] = useState<number | null>(
    null
  );

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
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                            setOpenChapterId(chapter.id); // Keep this chapter open
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
        <LessonVideoPlayer
          provider="youtube"
          videoId={activeLesson.videoSource.value}
          autoPlay
        />
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
      </div>
    </div>
  );
};

export default MobileCourseViewer;
