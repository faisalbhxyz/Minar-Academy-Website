import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import * as api from "@/api";
import {
  LESSON_COMPLETE_THRESHOLD,
  WATCH_SAVE_INTERVAL_MS,
  shouldResumeAt,
} from "@/lib/watchProgress";
import {
  flushPendingWatchQueue,
  flushWatchSeconds,
  type WatchTimeSource,
} from "@/lib/watchTime";
import { useLearningStore } from "@/store/learningStore";
import type { CourseProgressData } from "@/types/api";

type Args = {
  courseSlug: string;
  lessonId: number;
  courseId?: number;
  userId?: number;
  source?: WatchTimeSource;
  alreadyCompleted?: boolean;
  onCourseCompleted?: (progress: CourseProgressData) => void;
};

/** Ignore gaps larger than this — pause / background / seek jump. */
const MAX_TICK_GAP_SECONDS = 4;

function withCompletedLesson(
  progress: CourseProgressData | null | undefined,
  lessonId: number
): CourseProgressData | undefined {
  if (!progress) return undefined;
  const ids = (progress.completed_lesson_ids ?? []).map(Number);
  if (!ids.includes(lessonId)) ids.push(lessonId);
  return { ...progress, completed_lesson_ids: ids };
}

export function useLessonWatch({
  courseSlug,
  lessonId,
  courseId,
  userId,
  source = "enrolled",
  alreadyCompleted = false,
  onCourseCompleted,
}: Args) {
  const queryClient = useQueryClient();
  const getWatchPosition = useLearningStore((s) => s.getWatchPosition);
  const setWatchPosition = useLearningStore((s) => s.setWatchPosition);
  const setCourseProgress = useLearningStore((s) => s.setCourseProgress);
  const addDailyWatchSeconds = useLearningStore((s) => s.addDailyWatchSeconds);

  const [startAt, setStartAt] = useState(0);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [completing, setCompleting] = useState(false);
  const [watchPercent, setWatchPercent] = useState(0);

  const maxPos = useRef(0);
  /** Last known playhead — used for resume-on-reopen (may be below max after seek). */
  const currentPos = useRef(0);
  const durationRef = useRef(0);
  const lastSave = useRef(0);
  const lastTickAt = useRef<number | null>(null);
  const pendingDailyWatch = useRef(0);
  const completePosted = useRef(alreadyCompleted);
  const completedRef = useRef(alreadyCompleted);
  const completingRef = useRef(false);
  const lessonIdRef = useRef(lessonId);
  const courseIdRef = useRef(courseId);
  const sourceRef = useRef(source);

  const invalidateLearningQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["learning-report"] });
    void queryClient.invalidateQueries({ queryKey: ["learning-report-api"] });
  }, [queryClient]);

  const flushDailyWatch = useCallback(() => {
    if (!userId || pendingDailyWatch.current < 1) {
      void flushPendingWatchQueue().catch(() => undefined);
      return;
    }
    const seconds = Math.floor(pendingDailyWatch.current);
    pendingDailyWatch.current -= seconds;
    if (seconds <= 0) return;

    // Offline UX cache — server wins after successful GET.
    addDailyWatchSeconds(userId, seconds);

    void flushWatchSeconds({
      seconds,
      courseId: courseIdRef.current,
      lessonId: lessonIdRef.current,
      source: sourceRef.current,
    })
      .then(() => {
        invalidateLearningQueries();
      })
      .catch(() => undefined);
  }, [addDailyWatchSeconds, invalidateLearningQueries, userId]);

  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    lessonIdRef.current = lessonId;
    maxPos.current = 0;
    currentPos.current = 0;
    durationRef.current = 0;
    lastSave.current = 0;
    lastTickAt.current = null;
    pendingDailyWatch.current = 0;
    completePosted.current = false;
    completedRef.current = false;
    completingRef.current = false;
    setCompleted(false);
    setCompleting(false);
    setWatchPercent(0);
    setReady(false);

    let cancelled = false;

    const load = async () => {
      void flushPendingWatchQueue().catch(() => undefined);

      // Prefer local last-quit position; fall back to API max for other devices.
      const local = userId ? getWatchPosition(userId, lessonId) : 0;
      let apiPos = 0;
      try {
        const remote = await api.fetchLessonVideoProgress(courseSlug, lessonId);
        if (cancelled || lessonIdRef.current !== lessonId) return;
        apiPos = remote?.max_position_seconds ?? 0;
        if (remote?.completed) {
          completePosted.current = true;
          completedRef.current = true;
          setCompleted(true);
          setWatchPercent(100);
        } else if (remote?.progress_percent) {
          setWatchPercent(Math.min(100, Math.round(remote.progress_percent)));
        }
      } catch {
        // Local resume is enough offline.
      }
      const saved = local > 0 ? local : apiPos;
      if (!cancelled && lessonIdRef.current === lessonId) {
        maxPos.current = Math.max(saved, apiPos);
        currentPos.current = saved;
        setStartAt(saved);
        setReady(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
      // Persist quit position before this lesson's effect tears down.
      if (userId && currentPos.current > 0) {
        setWatchPosition(userId, lessonId, currentPos.current);
      }
      flushDailyWatch();
    };
  }, [
    courseSlug,
    flushDailyWatch,
    getWatchPosition,
    lessonId,
    setWatchPosition,
    userId,
  ]);

  useEffect(() => {
    if (!alreadyCompleted) return;
    completePosted.current = true;
    completedRef.current = true;
    setCompleted(true);
    setWatchPercent(100);
  }, [alreadyCompleted]);

  const persistProgress = useCallback(
    async (resumePosition: number, duration: number, maxPosition?: number) => {
      if (resumePosition <= 0 && (maxPosition ?? 0) <= 0) return;
      // Local store = last playhead so reopen resumes where the user quit.
      if (userId && resumePosition > 0) {
        setWatchPosition(userId, lessonIdRef.current, resumePosition);
      }
      flushDailyWatch();
      const apiPosition = Math.max(resumePosition, maxPosition ?? 0);
      if (apiPosition <= 0) return;
      try {
        await api.saveLessonVideoProgress(
          courseSlug,
          lessonIdRef.current,
          apiPosition,
          duration
        );
        invalidateLearningQueries();
      } catch {
        // Local resume + local daily watch still apply offline.
      }
    },
    [
      courseSlug,
      flushDailyWatch,
      invalidateLearningQueries,
      setWatchPosition,
      userId,
    ]
  );

  const applyCourseProgress = useCallback(
    (progress: CourseProgressData | null | undefined) => {
      if (!progress || !userId) return;
      setCourseProgress(userId, courseSlug, {
        percent: progress.progress_percent,
        completedIds: progress.completed_lesson_ids ?? [],
      });
      queryClient.setQueryData(["course-progress", courseSlug], progress);
      void queryClient.invalidateQueries({
        queryKey: ["course-progress", courseSlug],
      });
      invalidateLearningQueries();
      if (progress.progress_percent >= 100) {
        onCourseCompleted?.(progress);
      }
    },
    [
      courseSlug,
      invalidateLearningQueries,
      onCourseCompleted,
      queryClient,
      setCourseProgress,
      userId,
    ]
  );

  const completeLesson = useCallback(async (): Promise<boolean> => {
    if (completedRef.current) return true;
    if (completingRef.current) return false;

    completingRef.current = true;
    completePosted.current = true;
    setCompleting(true);

    const activeLessonId = lessonIdRef.current;
    const duration = durationRef.current;
    const position =
      duration > 0
        ? Math.max(maxPos.current, duration)
        : Math.max(maxPos.current, 1);
    maxPos.current = position;
    currentPos.current = position;

    try {
      await persistProgress(position, duration, position);
      const progress = withCompletedLesson(
        await api.markLessonComplete(courseSlug, activeLessonId),
        activeLessonId
      );
      if (lessonIdRef.current !== activeLessonId) return false;
      applyCourseProgress(progress);
      completedRef.current = true;
      setCompleted(true);
      setWatchPercent(100);
      return true;
    } catch (error) {
      if (lessonIdRef.current === activeLessonId) {
        completePosted.current = completedRef.current;
      }
      throw error;
    } finally {
      if (lessonIdRef.current === activeLessonId) {
        completingRef.current = false;
        setCompleting(false);
      }
    }
  }, [applyCourseProgress, courseSlug, persistProgress]);

  const onTick = useCallback(
    (current: number, duration: number) => {
      currentPos.current = Math.max(0, current);
      if (current > maxPos.current) maxPos.current = current;
      if (duration > 0) durationRef.current = duration;

      const now = Date.now();
      if (lastTickAt.current != null) {
        const gapSec = (now - lastTickAt.current) / 1000;
        // Progress posts only while playing — count wall time between ticks.
        if (gapSec > 0 && gapSec <= MAX_TICK_GAP_SECONDS) {
          pendingDailyWatch.current += gapSec;
        }
      }
      lastTickAt.current = now;

      if (duration > 0 && !completedRef.current) {
        const pct = Math.min(
          100,
          Math.round((maxPos.current / duration) * 100)
        );
        setWatchPercent((prev) => (pct > prev ? pct : prev));
      }

      if (now - lastSave.current >= WATCH_SAVE_INTERVAL_MS) {
        lastSave.current = now;
        void persistProgress(
          currentPos.current,
          durationRef.current,
          maxPos.current
        );
      }

      if (
        !completePosted.current &&
        !completedRef.current &&
        duration > 0 &&
        maxPos.current / duration >= LESSON_COMPLETE_THRESHOLD
      ) {
        void completeLesson().catch(() => undefined);
      }
    },
    [completeLesson, persistProgress]
  );

  const flush = useCallback(() => {
    lastTickAt.current = null;
    void persistProgress(
      currentPos.current,
      durationRef.current,
      maxPos.current
    );
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
