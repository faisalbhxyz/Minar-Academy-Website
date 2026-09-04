import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { LastLessonSnapshot } from "@/lib/watchProgress";

const STORAGE_KEY = "minar_learning_v1";

type CourseProgressCache = {
  percent: number;
  completedIds: number[];
};

type PersistedState = {
  lastByUserCourse: Record<string, LastLessonSnapshot>;
  progressByUserCourse: Record<string, CourseProgressCache>;
  watchByUserLesson: Record<string, number>;
  /** Local YYYY-MM-DD → watched seconds (actual play time), keyed by `${userId}:${date}`. */
  dailyWatchByUserDate: Record<string, number>;
};

type LearningState = PersistedState & {
  ready: boolean;
  hydrate: () => Promise<void>;
  setLastLesson: (userId: number, snapshot: LastLessonSnapshot) => void;
  getLastLesson: (
    userId: number,
    courseSlug: string
  ) => LastLessonSnapshot | undefined;
  setCourseProgress: (
    userId: number,
    courseSlug: string,
    progress: CourseProgressCache
  ) => void;
  getCourseProgress: (
    userId: number,
    courseSlug: string
  ) => CourseProgressCache | undefined;
  setWatchPosition: (
    userId: number,
    lessonId: number,
    seconds: number
  ) => void;
  getWatchPosition: (userId: number, lessonId: number) => number;
  addDailyWatchSeconds: (userId: number, seconds: number, at?: Date) => void;
  getDailyWatchSeconds: (
    userId: number,
    fromDateKey: string,
    toDateKey: string
  ) => Record<string, number>;
};

function courseKey(userId: number, courseSlug: string): string {
  return `${userId}:${courseSlug}`;
}

function lessonKey(userId: number, lessonId: number): string {
  return `${userId}:${lessonId}`;
}

function dailyWatchKey(userId: number, dateKey: string): string {
  return `${userId}:${dateKey}`;
}

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function userCourseKey(userId: number, courseSlug: string): string {
  return courseKey(userId, courseSlug);
}

export function useLatestLastLesson(userId?: number): LastLessonSnapshot | undefined {
  return useLearningStore((state) => {
    if (!userId) return undefined;
    const prefix = `${userId}:`;
    let latest: LastLessonSnapshot | undefined;
    for (const [key, snapshot] of Object.entries(state.lastByUserCourse)) {
      if (!key.startsWith(prefix)) continue;
      if (!latest || snapshot.updatedAt > latest.updatedAt) {
        latest = snapshot;
      }
    }
    return latest;
  });
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(state: PersistedState): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lastByUserCourse: state.lastByUserCourse,
        progressByUserCourse: state.progressByUserCourse,
        watchByUserLesson: state.watchByUserLesson,
        dailyWatchByUserDate: state.dailyWatchByUserDate,
      } satisfies PersistedState)
    );
  }, 250);
}

export const useLearningStore = create<LearningState>((set, get) => ({
  ready: false,
  lastByUserCourse: {},
  progressByUserCourse: {},
  watchByUserLesson: {},
  dailyWatchByUserDate: {},

  hydrate: async () => {
    if (get().ready) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        set({
          lastByUserCourse: parsed.lastByUserCourse ?? {},
          progressByUserCourse: parsed.progressByUserCourse ?? {},
          watchByUserLesson: parsed.watchByUserLesson ?? {},
          dailyWatchByUserDate: parsed.dailyWatchByUserDate ?? {},
          ready: true,
        });
        return;
      }
    } catch {
      // Ignore corrupt cache.
    }
    set({ ready: true });
  },

  setLastLesson: (userId, snapshot) => {
    const key = courseKey(userId, snapshot.courseSlug);
    set((state) => {
      const next = {
        ...state,
        lastByUserCourse: {
          ...state.lastByUserCourse,
          [key]: { ...snapshot, updatedAt: new Date().toISOString() },
        },
      };
      schedulePersist(next);
      return next;
    });
  },

  getLastLesson: (userId, courseSlug) => {
    return get().lastByUserCourse[courseKey(userId, courseSlug)];
  },

  setCourseProgress: (userId, courseSlug, progress) => {
    const key = courseKey(userId, courseSlug);
    set((state) => {
      const next = {
        ...state,
        progressByUserCourse: {
          ...state.progressByUserCourse,
          [key]: progress,
        },
      };
      schedulePersist(next);
      return next;
    });
  },

  getCourseProgress: (userId, courseSlug) => {
    return get().progressByUserCourse[courseKey(userId, courseSlug)];
  },

  setWatchPosition: (userId, lessonId, seconds) => {
    if (seconds <= 0) return;
    const key = lessonKey(userId, lessonId);
    const nextSeconds = Math.floor(seconds);
    set((state) => {
      const existing = state.watchByUserLesson[key] ?? 0;
      // Overwrite freely — resume must match last quit position, not only max.
      if (nextSeconds === existing) return state;
      const next = {
        ...state,
        watchByUserLesson: {
          ...state.watchByUserLesson,
          [key]: nextSeconds,
        },
      };
      schedulePersist(next);
      return next;
    });
  },

  getWatchPosition: (userId, lessonId) => {
    return get().watchByUserLesson[lessonKey(userId, lessonId)] ?? 0;
  },

  addDailyWatchSeconds: (userId, seconds, at = new Date()) => {
    const add = Math.floor(seconds);
    if (add <= 0) return;
    const key = dailyWatchKey(userId, localDateKey(at));
    set((state) => {
      const next = {
        ...state,
        dailyWatchByUserDate: {
          ...state.dailyWatchByUserDate,
          [key]: (state.dailyWatchByUserDate[key] ?? 0) + add,
        },
      };
      schedulePersist(next);
      return next;
    });
  },

  getDailyWatchSeconds: (userId, fromDateKey, toDateKey) => {
    const prefix = `${userId}:`;
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(get().dailyWatchByUserDate)) {
      if (!key.startsWith(prefix) || value <= 0) continue;
      const dateKey = key.slice(prefix.length);
      if (dateKey < fromDateKey || dateKey > toDateKey) continue;
      out[dateKey] = value;
    }
    return out;
  },
}));
