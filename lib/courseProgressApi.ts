import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";

export interface CourseProgressData {
  lessons_completed: number;
  lessons_total: number;
  quizzes_completed: number;
  quizzes_total: number;
  assignments_completed: number;
  assignments_total: number;
  progress_percent: number;
  count_lessons: boolean;
  count_quizzes: boolean;
  count_assignments: boolean;
  completed_lesson_ids: number[];
}

export interface LessonVideoProgressData {
  lesson_id: number;
  max_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  completed: boolean;
  updated_at: string;
}

export const LESSON_COMPLETE_THRESHOLD = 0.8;

export const WATCH_SAVE_INTERVAL_MS = 15_000;

export function watchPositionStorageKey(
  studentId: string | number,
  lessonId: number
): string {
  return `watch:${studentId}:${lessonId}`;
}

function loadWatchPositionFromStorage(
  studentId: string | number,
  lessonId: number
): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(
      watchPositionStorageKey(studentId, lessonId)
    );
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveWatchPositionToStorage(
  studentId: string | number,
  lessonId: number,
  maxPositionSeconds: number
): void {
  if (typeof window === "undefined" || maxPositionSeconds <= 0) return;
  try {
    const key = watchPositionStorageKey(studentId, lessonId);
    const existing = Number(localStorage.getItem(key) || 0);
    const next = Math.max(existing, maxPositionSeconds);
    localStorage.setItem(key, String(next));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearWatchPositionStorage(
  studentId: string | number,
  lessonId: number
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(watchPositionStorageKey(studentId, lessonId));
  } catch {
    // Ignore private mode errors.
  }
}

function studentHeaders(accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (publicAppKey) headers["app-key"] = publicAppKey;
  return headers;
}

export async function getLessonVideoProgress(
  courseSlug: string,
  lessonId: number,
  accessToken: string
): Promise<LessonVideoProgressData | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  const res = await fetch(
    `${apiBase}/course/${courseSlug}/lessons/${lessonId}/progress`,
    { headers: studentHeaders(accessToken) }
  );

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  return json?.data ?? null;
}

export async function loadWatchPosition(
  courseSlug: string,
  lessonId: number,
  accessToken: string,
  studentId?: string | number
): Promise<number> {
  const localPosition = studentId
    ? loadWatchPositionFromStorage(studentId, lessonId)
    : 0;

  let apiPosition = 0;
  let apiFound = false;

  try {
    const progress = await getLessonVideoProgress(
      courseSlug,
      lessonId,
      accessToken
    );
    if (progress) {
      apiPosition = progress.max_position_seconds ?? 0;
      apiFound = true;
    }
  } catch {
    return localPosition;
  }

  if (!apiFound) {
    return localPosition;
  }

  if (localPosition > apiPosition) {
    return localPosition;
  }

  if (studentId && localPosition > 0) {
    clearWatchPositionStorage(studentId, lessonId);
  }

  return apiPosition;
}

export async function saveWatchPosition(
  courseSlug: string,
  lessonId: number,
  maxPositionSeconds: number,
  durationSeconds: number,
  accessToken: string,
  studentId?: string | number
): Promise<void> {
  if (maxPositionSeconds <= 0) return;

  const apiBase = publicApiBaseUrl;
  if (apiBase) {
    try {
      const body: Record<string, number> = {
        max_position_seconds: maxPositionSeconds,
      };
      if (durationSeconds > 0) {
        body.duration_seconds = durationSeconds;
      }

      const res = await fetch(
        `${apiBase}/course/${courseSlug}/lessons/${lessonId}/progress`,
        {
          method: "PATCH",
          headers: studentHeaders(accessToken),
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        if (studentId) clearWatchPositionStorage(studentId, lessonId);
        return;
      }
    } catch {
      // Fall back to localStorage when the API is unreachable.
    }
  }

  if (studentId) {
    saveWatchPositionToStorage(studentId, lessonId, maxPositionSeconds);
  }
}

export async function postLessonComplete(
  courseSlug: string,
  lessonId: number,
  accessToken: string
): Promise<CourseProgressData | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  const res = await fetch(
    `${apiBase}/course/${courseSlug}/lessons/${lessonId}/complete`,
    {
      method: "POST",
      headers: studentHeaders(accessToken),
    }
  );

  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  return json?.data ?? null;
}
