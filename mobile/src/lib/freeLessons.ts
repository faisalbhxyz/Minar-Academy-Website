import * as api from "@/api";
import type {
  FreeLessonCatalogApiItem,
  FreeLessonLibraryApiItem,
} from "@/types/api";
import type { LessonPlayerParams } from "@/navigation/types";

export const FREE_LESSON_MAX_SELECT = 3;
export const FREE_LESSON_LIBRARY_MAX = 20;

export type FreeLessonCatalogItem = {
  lessonId: number;
  lessonTitle: string;
  chapterTitle: string;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  featuredImage?: string | null;
  lessonDescription?: string | null;
  lessonType?: string;
  sourceType: string;
  sourceData: string;
  offlineDownloadable?: boolean;
  classSlugs?: string[];
  watchPercent?: number;
  watchSeconds?: number;
  durationSeconds?: number | null;
  completed?: boolean;
  addedAt?: string;
};

function sourceDataFromApi(
  source: FreeLessonCatalogApiItem["source"]
): string {
  return source?.data?.data?.trim() ?? "";
}

export function mapFreeLessonApiItem(
  item: FreeLessonCatalogApiItem | FreeLessonLibraryApiItem
): FreeLessonCatalogItem {
  const library = item as FreeLessonLibraryApiItem;
  return {
    lessonId: item.lesson_id,
    lessonTitle: item.lesson_title,
    chapterTitle: item.chapter_title,
    courseId: item.course_id,
    courseSlug: item.course_slug,
    courseTitle: item.course_title,
    featuredImage: item.featured_image ?? null,
    lessonType: item.lesson_type,
    sourceType: item.source_type,
    sourceData: sourceDataFromApi(item.source),
    classSlugs: item.class_slugs,
    watchPercent: library.watch_percent,
    watchSeconds: library.watch_seconds,
    durationSeconds: library.duration_seconds ?? item.duration_seconds ?? null,
    completed: library.completed,
    addedAt: library.added_at,
  };
}

export async function fetchFreeLessonCatalog(options?: {
  classSlug?: string;
  /** When class filter returns empty, fall back to full catalog. */
  fallbackAll?: boolean;
}): Promise<FreeLessonCatalogItem[]> {
  const { items } = await api.fetchFreeLessonsCatalog({
    classSlug: options?.classSlug,
    limit: 100,
  });
  if (
    items.length === 0 &&
    options?.fallbackAll &&
    options.classSlug
  ) {
    const all = await api.fetchFreeLessonsCatalog({ limit: 100 });
    return all.items.map(mapFreeLessonApiItem);
  }
  return items.map(mapFreeLessonApiItem);
}

export async function getMyFreeLessons(): Promise<FreeLessonCatalogItem[]> {
  const items = await api.fetchMyFreeLessons();
  return items.map(mapFreeLessonApiItem);
}

/** POST selected lesson ids; returns full library from server. */
export async function mergeMyFreeLessons(
  selected: FreeLessonCatalogItem[]
): Promise<FreeLessonCatalogItem[]> {
  const lessonIds = selected.map((item) => item.lessonId).slice(0, FREE_LESSON_MAX_SELECT);
  if (lessonIds.length === 0) return [];
  const library = await api.addMyFreeLessons(lessonIds);
  const byId = new Map(library.map(mapFreeLessonApiItem).map((item) => [item.lessonId, item]));
  // Prefer returning the just-added selection with server fields when present.
  return selected.map((item) => byId.get(item.lessonId) ?? item);
}

export async function removeMyFreeLesson(lessonId: number): Promise<void> {
  await api.removeMyFreeLesson(lessonId);
}

export function freeLessonToPlayerParams(
  item: FreeLessonCatalogItem
): LessonPlayerParams {
  return {
    courseId: item.courseId,
    courseSlug: item.courseSlug,
    courseTitle: item.courseTitle,
    lessonId: item.lessonId,
    lessonTitle: item.lessonTitle,
    lessonDescription: item.lessonDescription ?? null,
    lessonType: item.lessonType,
    sourceType: item.sourceType,
    sourceData: item.sourceData,
    offlineDownloadable: item.offlineDownloadable === true,
  };
}

export function freeLessonWatchLabel(
  item: FreeLessonCatalogItem,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (item.completed || (item.watchPercent ?? 0) >= 100) {
    return t("home.freeClasses.watchedPercent", { percent: 100 });
  }
  const percent = Math.round(item.watchPercent ?? 0);
  if (percent > 0) {
    return t("home.freeClasses.watchedPercent", { percent });
  }
  return t("home.freeClasses.notWatched");
}
