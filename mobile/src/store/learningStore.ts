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
};

function courseKey(userId: number, courseSlug: string): string {
  return `${userId}:${courseSlug}`;
}

function lessonKey(userId: number, lessonId: number): string {
  return `${userId}:${lessonId}`;
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
      } satisfies PersistedState)
    );
  }, 250);
}

export const useLearningStore = create<LearningState>((set, get) => ({
  ready: false,
  lastByUserCourse: {},
  progressByUserCourse: {},
  watchByUserLesson: {},

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
    set((state) => {
      const existing = state.watchByUserLesson[key] ?? 0;
      if (seconds <= existing) return state;
      const next = {
        ...state,
        watchByUserLesson: {
          ...state.watchByUserLesson,
          [key]: seconds,
        },
      };
      schedulePersist(next);
      return next;
    });
  },

  getWatchPosition: (userId, lessonId) => {
    return get().watchByUserLesson[lessonKey(userId, lessonId)] ?? 0;
  },
}));
