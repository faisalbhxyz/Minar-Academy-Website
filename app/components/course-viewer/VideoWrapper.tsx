"use client";

import { useEffect, useState } from "react";
import DesktopCourseViewer from "./DesktopCourseViewer";
import MobileCourseViewer from "./MobileCourseViewer";
import {
  CourseDetails,
  AssignmentSubmissionStatusMap,
  QuizSubmissionStatusMap,
} from "./types";

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
  courseCertificate?: Certificate | null;
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
  courseCertificate,
}: VideoWrapperProps) {
  // Mobile-first default avoids a blank screen while hydrating on phones.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    courseCertificate,
  };

  return isMobile ? (
    <MobileCourseViewer {...viewerProps} />
  ) : (
    <DesktopCourseViewer {...viewerProps} />
  );
}
