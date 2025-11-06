"use client";

import {
  CourseChapter,
  CourseDetails,
  CourseLesson,
  Chapter,
  Lesson,
} from "./types";

// Helper to format duration from seconds to MM:SS
export function formatDuration(seconds?: number | null): string {
  if (seconds === undefined || seconds === null) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

// Maps CourseLesson from API to internal Lesson type for component use
export function mapCourseLessonToLesson(
  lessonData: CourseLesson,
  completedLessonIds: Set<number>
): Lesson {
  let videoSourceType: Lesson["videoSource"]["type"] = "none";
  let videoSourceValue: string = "";

  if (
    lessonData.lesson_type === "video" &&
    lessonData.source &&
    typeof lessonData.source.data.data === "string"
  ) {
    const sourceContent = lessonData.source.data.data;

    console.log("SOURCE CONTENT", lessonData);

    if (sourceContent.includes("<iframe")) {
      videoSourceType = "iframe";
      videoSourceValue = sourceContent;
    } else {
      videoSourceType = "youtubeId";
      const youtubeIdMatch = sourceContent.match(
        /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );

      if (youtubeIdMatch && youtubeIdMatch[1]) {
        videoSourceValue = youtubeIdMatch[1];
      } else {
        videoSourceValue = sourceContent; // Assume the string itself is the YouTube ID
      }
    }
  }

  return {
    id: lessonData.id,
    title: lessonData.title,
    duration: formatDuration(Number(lessonData.source.data.playback_times)), // Make sure playback_times is a number
    completed: completedLessonIds.has(lessonData.id),
    videoSource: {
      type: videoSourceType,
      value: videoSourceValue,
    },
    description: lessonData.description,
    resources: lessonData.resources,
  };
}

// Maps CourseChapter from API to internal Chapter type for component use
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
    totalLessons: totalLessons,
    completedLessons: completedLessons,
  };
}

// Processes the full CourseDetails object to extract data for CourseViewerProps
export function processCourseDetailsForViewer(
  courseDetails: CourseDetails,
  userCompletedLessonIds: Set<number>
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
  const overallProgressPercentage =
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
      percentage: overallProgressPercentage,
    },
  };
}
