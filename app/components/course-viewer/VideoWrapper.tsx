"use client";

import { useEffect, useState } from "react";
import DesktopCourseViewer from "./DesktopCourseViewer";
import MobileCourseViewer from "./MobileCourseViewer";
import { CourseDetails } from "./types";

interface VideoWrapperProps {
  courseDetails: CourseDetails;
  userCompletedLessonIds: Set<number>;
  courseSlug: string;
  accessToken: string;
  studentId: string;
  apiProgressPercent?: number | null;
}

export default function VideoWrapper({
  courseDetails,
  userCompletedLessonIds,
  courseSlug,
  accessToken,
  studentId,
  apiProgressPercent,
}: VideoWrapperProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (isMobile === null) return null;

  const viewerProps = {
    courseDetails,
    userCompletedLessonIds,
    courseSlug,
    accessToken,
    studentId,
    apiProgressPercent,
  };

  return isMobile ? (
    <MobileCourseViewer {...viewerProps} />
  ) : (
    <DesktopCourseViewer {...viewerProps} />
  );
}
