import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import * as api from "@/api";
import {
  LESSON_COMPLETE_THRESHOLD,
  WATCH_SAVE_INTERVAL_MS,
  shouldResumeAt,
} from "@/lib/watchProgress";
import { useLearningStore } from "@/store/learningStore";
import type { CourseProgressData } from "@/types/api";

type Args = {
  courseSlug: string;
  lessonId: number;
  userId?: number;
  alreadyCompleted?: boolean;
  onCourseCompleted?: (progress: CourseProgressData) => void;
};

export function useLessonWatch({
  courseSlug,
  lessonId,
  userId,
  alreadyCompleted = false,
  onCourseCompleted,
}: Args) {
  const queryClient = useQueryClient();
  const getWatchPosition = useLearningStore((s) => s.getWatchPosition);
  const setWatchPosition = useLearningStore((s) => s.setWatchPosition);
  const setCourseProgress = useLearningStore((s) => s.setCourseProgress);

  const [startAt, setStartAt] = useState(0);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [completing, setCompleting] = useState(false);
  const [watchPercent, setWatchPercent] = useState(0);

  const maxPos = useRef(0);
  const durationRef = useRef(0);
  const lastSave = useRef(0);
  const completePosted = useRef(alreadyCompleted);
  const lessonIdRef = useRef(lessonId);

  useEffect(() => {
    lessonIdRef.current = lessonId;
    maxPos.current = 0;
    durationRef.current = 0;
    lastSave.current = 0;
    completePosted.current = alreadyCompleted;
    setCompleted(alreadyCompleted);
    setCompleting(false);
    setWatchPercent(alreadyCompleted ? 100 : 0);
    setReady(false);

    let cancelled = false;

    const load = async () => {
      const local = userId ? getWatchPosition(userId, lessonId) : 0;
      let apiPos = 0;
      try {
        const remote = await api.fetchLessonVideoProgress(courseSlug, lessonId);
        apiPos = remote?.max_position_seconds ?? 0;
        if (remote?.completed) {
          completePosted.current = true;
          if (!cancelled) {
            setCompleted(true);
            setWatchPercent(100);
          }
        } else if (remote?.progress_percent && !cancelled) {
          setWatchPercent(Math.min(100, Math.round(remote.progress_percent)));
        }
      } catch {
        // Local resume is enough offline.
      }
      const saved = Math.max(local, apiPos);
      if (!cancelled) {
        maxPos.current = saved;
        setStartAt(saved);
        setReady(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, alreadyCompleted, getWatchPosition, lessonId, userId]);

  useEffect(() => {
    if (!alreadyCompleted) return;
    completePosted.current = true;
    setCompleted(true);
    setWatchPercent(100);
  }, [alreadyCompleted]);

  const persistProgress = useCallback(
    (position: number, duration: number) => {
      if (position <= 0) return;
      if (userId) setWatchPosition(userId, lessonIdRef.current, position);
      void api
        .saveLessonVideoProgress(
          courseSlug,
          lessonIdRef.current,
          position,
          duration
        )
        .catch(() => undefined);
    },
    [courseSlug, setWatchPosition, userId]
  );

  const applyCourseProgress = useCallback(
    (progress: CourseProgressData | null | undefined) => {
      if (!progress || !userId) return;
      setCourseProgress(userId, courseSlug, {
        percent: progress.progress_percent,
        completedIds: progress.completed_lesson_ids ?? [],
      });
      queryClient.setQueryData(["course-progress", courseSlug], progress);
      if (progress.progress_percent >= 100) {
        onCourseCompleted?.(progress);
      }
    },
    [courseSlug, onCourseCompleted, queryClient, setCourseProgress, userId]
  );

  const completeLesson = useCallback(async () => {
    if (completePosted.current) return;
    completePosted.current = true;
    setCompleting(true);
    try {
      persistProgress(maxPos.current, durationRef.current);
      const progress = await api.markLessonComplete(
        courseSlug,
        lessonIdRef.current
      );
      applyCourseProgress(progress);
      setCompleted(true);
      setWatchPercent(100);
    } catch {
      completePosted.current = false;
    } finally {
      setCompleting(false);
    }
  }, [applyCourseProgress, courseSlug, persistProgress]);

  const onTick = useCallback(
    (current: number, duration: number) => {
      if (current > maxPos.current) maxPos.current = current;
      if (duration > 0) durationRef.current = duration;

      if (duration > 0 && !completePosted.current) {
        const pct = Math.min(
          100,
          Math.round((maxPos.current / duration) * 100)
        );
        setWatchPercent((prev) => (pct > prev ? pct : prev));
      }

      const now = Date.now();
      if (now - lastSave.current >= WATCH_SAVE_INTERVAL_MS) {
        lastSave.current = now;
        persistProgress(maxPos.current, durationRef.current);
      }

      if (
        !completePosted.current &&
        duration > 0 &&
        maxPos.current / duration >= LESSON_COMPLETE_THRESHOLD
      ) {
        void completeLesson();
      }
    },
    [completeLesson, persistProgress]
  );

  const flush = useCallback(() => {
    persistProgress(maxPos.current, durationRef.current);
  }, [persistProgress]);

  return {
    startAt: shouldResumeAt(startAt, durationRef.current),
    ready,
    completed,
    completing,
    watchPercent,
    onTick,
    flush,
    completeLesson,
  };
}
