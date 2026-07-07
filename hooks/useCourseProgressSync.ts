"use client";

import {
  COURSE_PROGRESS_UPDATED_EVENT,
  getCourseProgressClient,
  type CourseProgressData,
} from "@/lib/courseProgressApi";
import { useCallback, useEffect } from "react";

interface Options {
  courseSlug: string;
  accessToken?: string;
  onProgressUpdate: (data: CourseProgressData) => void;
}

export function useCourseProgressSync({
  courseSlug,
  accessToken,
  onProgressUpdate,
}: Options) {
  const refreshProgress = useCallback(async () => {
    if (!accessToken) return;
    const progress = await getCourseProgressClient(courseSlug, accessToken);
    if (progress) onProgressUpdate(progress);
  }, [accessToken, courseSlug, onProgressUpdate]);

  useEffect(() => {
    const handleProgressEvent = (event: Event) => {
      const detail = (event as CustomEvent<{
        courseSlug: string;
        data: CourseProgressData;
      }>).detail;

      if (detail?.courseSlug === courseSlug && detail.data) {
        onProgressUpdate(detail.data);
      }
    };

    window.addEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleProgressEvent);
    return () =>
      window.removeEventListener(
        COURSE_PROGRESS_UPDATED_EVENT,
        handleProgressEvent
      );
  }, [courseSlug, onProgressUpdate]);

  useEffect(() => {
    if (!accessToken) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshProgress();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [accessToken, refreshProgress]);
}
