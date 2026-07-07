"use client";

import { useEffect, useState } from "react";
import DesktopCourseViewer from "./DesktopCourseViewer";
import MobileCourseViewer from "./MobileCourseViewer";
import { CourseDetails, AssignmentSubmissionStatusMap, QuizSubmissionStatusMap } from "./types";

interface VideoWrapperProps {
  courseDetails: CourseDetails;
  userCompletedLessonIds: Set<number>;
  courseSlug: string;
  accessToken: string;
  studentId: string;
  apiProgressPercent?: number | null;
  assignmentSubmissionStatuses?: AssignmentSubmissionStatusMap;
  quizSubmissionStatuses?: QuizSubmissionStatusMap;
  completedQuizIds?: number[];
}

export default function VideoWrapper({
  courseDetails,
  userCompletedLessonIds,
  courseSlug,
  accessToken,
  studentId,
  apiProgressPercent,
  assignmentSubmissionStatuses,
  quizSubmissionStatuses,
  completedQuizIds,
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
    assignmentSubmissionStatuses,
    quizSubmissionStatuses,
    completedQuizIds,
  };

  return isMobile ? (
    <MobileCourseViewer {...viewerProps} />
  ) : (
    <DesktopCourseViewer {...viewerProps} />
  );
}
