"use client";

import { useEffect, useState } from "react";
import DesktopCourseViewer from "./DesktopCourseViewer";
import MobileCourseViewer from "./MobileCourseViewer";

export default function VideoWrapper({ courseDetails }: any) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (isMobile === null) return null;

  return isMobile ? (
    <MobileCourseViewer courseDetails={courseDetails} userCompletedLessonIds={new Set()} />
  ) : (
    <DesktopCourseViewer courseDetails={courseDetails} userCompletedLessonIds={new Set()} />
  );
}
