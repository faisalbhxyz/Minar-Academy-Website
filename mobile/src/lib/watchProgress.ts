import type { LessonPlayerParams } from "@/navigation/types";
import type { CourseChapter, CourseDetails, CourseLesson } from "@/types/api";

export const LESSON_COMPLETE_THRESHOLD = 0.8;
export const WATCH_SAVE_INTERVAL_MS = 15_000;

export type LastLessonSnapshot = LessonPlayerParams & {
  updatedAt: string;
};

function sortLessons(lessons: CourseLesson[]): CourseLesson[] {
  return lessons
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function flattenChapterLessons(
  chapters: CourseChapter[] | undefined
): CourseLesson[] {
  if (!chapters?.length) return [];
  return chapters
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .flatMap((chapter) => sortLessons(chapter.course_lessons ?? []));
}

export function flattenPlayableLessons(
  chapters: CourseChapter[] | undefined
): CourseLesson[] {
  return flattenChapterLessons(chapters).filter(
    (lesson) => lesson.is_published || lesson.is_public
  );
}

/** Navigation list — includes enrolled-only lessons when the current lesson is not public. */
export function flattenLessonsForNavigation(
  chapters: CourseChapter[] | undefined,
  currentLessonId?: number
): CourseLesson[] {
  const all = flattenChapterLessons(chapters);
  const publicLessons = all.filter(
    (lesson) => lesson.is_published || lesson.is_public
  );
  if (!currentLessonId) return publicLessons;

  const currentId = Number(currentLessonId);
  if (publicLessons.some((lesson) => Number(lesson.id) === currentId)) {
    return publicLessons;
  }
  return all;
}

export function findContinueLesson(
  lessons: CourseLesson[],
  completedIds: Set<number>,
  lastLessonId?: number
): CourseLesson | undefined {
  if (!lessons.length) return undefined;

  if (lastLessonId) {
    const last = lessons.find((lesson) => lesson.id === lastLessonId);
    if (last && !completedIds.has(last.id)) return last;

    const lastIndex = lessons.findIndex((lesson) => lesson.id === lastLessonId);
    if (lastIndex >= 0) {
      const after = lessons
        .slice(lastIndex + 1)
        .find((lesson) => !completedIds.has(lesson.id));
      if (after) return after;
    }
  }

  return (
    lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons[0]
  );
}

export function lessonNeighbors(
  lessons: CourseLesson[],
  lessonId: number
): { prev?: CourseLesson; next?: CourseLesson; index: number } {
  const currentId = Number(lessonId);
  const index = lessons.findIndex(
    (lesson) => Number(lesson.id) === currentId
  );
  if (index < 0) return { index: -1 };
  return {
    index,
    prev: index > 0 ? lessons[index - 1] : undefined,
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export function lessonToPlayerParams(
  course: Pick<CourseDetails, "id" | "slug" | "title">,
  lesson: CourseLesson
): LessonPlayerParams {
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonDescription: lesson.description ?? null,
    lessonType: lesson.lesson_type,
    sourceType: lesson.source_type,
    sourceData: lesson.source?.data?.data ?? "",
  };
}

export function snapshotToPlayerParams(
  snapshot: LastLessonSnapshot
): LessonPlayerParams {
  return {
    courseId: snapshot.courseId,
    courseSlug: snapshot.courseSlug,
    courseTitle: snapshot.courseTitle,
    lessonId: snapshot.lessonId,
    lessonTitle: snapshot.lessonTitle,
    lessonDescription: snapshot.lessonDescription,
    lessonType: snapshot.lessonType,
    sourceType: snapshot.sourceType,
    sourceData: snapshot.sourceData,
  };
}

export function shouldResumeAt(
  savedSeconds: number,
  durationSeconds: number
): number {
  if (savedSeconds <= 3) return 0;
  if (durationSeconds > 0 && savedSeconds >= durationSeconds - 5) return 0;
  return savedSeconds;
}
