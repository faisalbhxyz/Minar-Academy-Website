"use client";

import {
  CourseChapter,
  CourseDetails,
  CourseLesson,
  Chapter,
  Lesson,
} from "./types";

export function formatDuration(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function parsePlaybackTime(value?: string | number | null): number | null {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "number" && !Number.isNaN(value)) return value;

  const str = String(value).trim();
  const asNumber = Number(str);
  if (!Number.isNaN(asNumber) && /^\d+(\.\d+)?$/.test(str)) return asNumber;

  const parts = str.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
}

export function extractYouTubeIdFromIframe(html: string): string | null {
  const match = html.match(
    /src=["'](?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"']+)/
  );
  if (!match?.[1]) return null;
  return match[1].split("?")[0];
}

export function extractYouTubeId(content: string): string | null {
  if (content.includes("<iframe")) {
    return extractYouTubeIdFromIframe(content);
  }

  const urlMatch = content.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (urlMatch?.[1]) return urlMatch[1];

  const trimmed = content.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function extractVimeoId(content: string): string | null {
  if (content.includes("<iframe")) {
    const match = content.match(
      /player\.vimeo\.com\/video\/(\d+)|vimeo\.com\/(?:video\/)?(\d+)/
    );
    return match?.[1] ?? match?.[2] ?? null;
  }

  const urlMatch = content.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return urlMatch?.[1] ?? null;
}

function resolveVideoEmbed(
  lessonData: CourseLesson
): Pick<Lesson, "videoSource" | "videoProvider" | "videoEmbedId"> {
  const empty = {
    videoSource: { type: "none" as const, value: "" },
    videoProvider: null,
    videoEmbedId: "",
  };

  if (
    lessonData.lesson_type !== "video" ||
    !lessonData.source ||
    typeof lessonData.source.data.data !== "string"
  ) {
    return empty;
  }

  const sourceContent = lessonData.source.data.data;
  const sourceType = lessonData.source_type;

  if (sourceType === "vimeo") {
    const vimeoId = extractVimeoId(sourceContent);
    if (!vimeoId) return empty;
    return {
      videoSource: {
        type: sourceContent.includes("<iframe") ? "iframe" : "youtubeId",
        value: sourceContent,
      },
      videoProvider: "vimeo",
      videoEmbedId: vimeoId,
    };
  }

  const youtubeId = extractYouTubeId(sourceContent);
  if (!youtubeId) return empty;

  return {
    videoSource: {
      type: sourceContent.includes("<iframe") ? "iframe" : "youtubeId",
      value: sourceContent,
    },
    videoProvider: "youtube",
    videoEmbedId: youtubeId,
  };
}

export function mapCourseLessonToLesson(
  lessonData: CourseLesson,
  completedLessonIds: Set<number>
): Lesson {
  const video = resolveVideoEmbed(lessonData);
  const playbackSeconds =
    parsePlaybackTime(lessonData.source?.data?.playback_times) ??
    parsePlaybackTime(
      (lessonData.source?.data as { playback_time?: string | null })
        ?.playback_time
    );

  return {
    id: lessonData.id,
    title: lessonData.title,
    duration: formatDuration(playbackSeconds),
    completed: completedLessonIds.has(lessonData.id),
    ...video,
    description: lessonData.description,
    resources: lessonData.resources,
  };
}

export function mapCourseChapterToChapter(
  chapterData: CourseChapter,
  completedLessonIds: Set<number>
): Chapter {
  const lessons =
    chapterData.course_lessons?.map((lesson) =>
      mapCourseLessonToLesson(lesson, completedLessonIds)
    ) || [];

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) => lesson.completed).length;

  return {
    id: chapterData.id,
    title: chapterData.title,
    lessons: lessons,
    quizzes:
      chapterData.quizzes
        ?.filter((q) => q.is_published)
        .map((q) => ({
          id: q.id,
          title: q.title,
          chapterId: chapterData.id,
        })) ?? [],
    assignments:
      chapterData.assignments
        ?.filter((a) => a.is_published)
        .map((a) => ({
          id: a.id,
          title: a.title,
          chapterId: chapterData.id,
        })) ?? [],
    totalLessons: totalLessons,
    completedLessons: completedLessons,
  };
}

export function processCourseDetailsForViewer(
  courseDetails: CourseDetails,
  userCompletedLessonIds: Set<number>,
  apiProgressPercent?: number | null
) {
  const chapters = courseDetails.course_chapters.map((chapter) =>
    mapCourseChapterToChapter(chapter, userCompletedLessonIds)
  );

  const totalLessonsOverall = chapters.reduce(
    (acc, chapter) => acc + chapter.totalLessons,
    0
  );
  const completedLessonsOverall = chapters.reduce(
    (acc, chapter) => acc + chapter.completedLessons,
    0
  );
  const lessonProgressPercentage =
    totalLessonsOverall > 0
      ? Math.round((completedLessonsOverall / totalLessonsOverall) * 100)
      : 0;

  const initialActiveLesson = chapters[0]?.lessons[0] || null;
  const initialCurrentLessonTitle =
    initialActiveLesson?.title || courseDetails.title;

  return {
    chapters,
    initialActiveLesson,
    initialCurrentLessonTitle,
    progress: {
      completed: completedLessonsOverall,
      total: totalLessonsOverall,
      percentage:
        apiProgressPercent != null ? apiProgressPercent : lessonProgressPercentage,
    },
  };
}
