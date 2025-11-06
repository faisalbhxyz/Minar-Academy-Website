"use client";

import React, { useState, useEffect } from "react";
import CourseSidebar from "./CourseSidebar";
import CourseHeader from "./CourseHeader";
import VideoPlayerSection from "./VideoPlayerSection";
import LessonContent from "./LessonContent";
import { CourseViewerProps, Lesson } from "./types";
import { processCourseDetailsForViewer } from "./utils";

const CourseViewer: React.FC<CourseViewerProps> = ({
  courseDetails,
  userCompletedLessonIds,
}) => {
  const { chapters, initialActiveLesson, initialCurrentLessonTitle, progress } =
    processCourseDetailsForViewer(courseDetails, userCompletedLessonIds);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(initialActiveLesson);
  const [currentLessonTitle, setCurrentLessonTitle] = useState(initialCurrentLessonTitle);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // open by default on desktop, closed on mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentLessonTitle(activeLesson?.title || courseDetails.title);
  }, [activeLesson, courseDetails.title]);

  // Layout dynamically changes depending on isMobile
  const layoutClass = isMobile
    ? "flex h-screen w-full bg-gray-100 font-inter overflow-hidden"
    : "grid min-h-screen w-full bg-gray-100 font-inter md:grid-cols-[18rem_1fr]";

  return (
    <div className={layoutClass}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-none md:w-72
        ${sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-0"}`}
      >
        <div className="md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <CourseSidebar
            chapters={chapters}
            activeLesson={activeLesson}
            setActiveLesson={setActiveLesson}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col bg-gray-50 ${
          isMobile ? "overflow-hidden" : "min-h-screen"
        }`}
      >
        {/* Header */}
        <CourseHeader
          currentLessonTitle={currentLessonTitle}
          progress={progress}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <main
          className={`flex-1 ${
            isMobile
              ? "overflow-y-auto bg-gray-50 p-3"
              : "bg-gray-50 px-4 py-6 space-y-8"
          }`}
        >
          <div
            className={
              isMobile
                ? "flex flex-col gap-6"
                : "mx-auto max-w-6xl space-y-8"
            }
          >
            {/* Video Section */}
            <div
              className={`w-full rounded-xl overflow-hidden bg-black ${
                isMobile ? "" : "aspect-video"
              }`}
            >
              <VideoPlayerSection
                activeLesson={activeLesson}
                currentLessonTitle={currentLessonTitle}
                instructorName={courseDetails.course_instructors
                  .map((instructor) => instructor.name)
                  .join(", ")}
                instructorTitle="Instructor"
              />
            </div>

            {/* Lesson Content */}
            <LessonContent activeLesson={activeLesson} />
          </div>
        </main>
      </div>

      {/* Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
        />
      )}
    </div>
  );
};

export default CourseViewer;
