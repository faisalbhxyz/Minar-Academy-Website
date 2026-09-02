export type EnrollmentWithProgress = {
  enrollment: Enrollment;
  progress: CourseProgressData | null;
};

export type LearningReportSummary = {
  enrolledCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  totalLessons: number;
  totalQuizzesCompleted: number;
  totalQuizzes: number;
  totalAssignmentsCompleted: number;
  totalAssignments: number;
  overallPercent: number;
};

export function isCourseInProgress(progress: CourseProgressData | null): boolean {
  if (!progress) return false;
  return progress.progress_percent > 0 && progress.progress_percent < 100;
}

export function isCourseCompleted(progress: CourseProgressData | null): boolean {
  if (!progress) return false;
  return progress.progress_percent >= 100;
}

export function buildLearningReportSummary(
  items: EnrollmentWithProgress[],
  certificateCount = 0
): LearningReportSummary {
  let inProgressCourses = 0;
  let completedCourses = 0;
  let totalLessonsCompleted = 0;
  let totalLessons = 0;
  let totalQuizzesCompleted = 0;
  let totalQuizzes = 0;
  let totalAssignmentsCompleted = 0;
  let totalAssignments = 0;
  let progressSum = 0;

  for (const { progress } of items) {
    if (!progress) continue;

    if (isCourseCompleted(progress)) completedCourses++;
    else if (isCourseInProgress(progress)) inProgressCourses++;

    totalLessonsCompleted += progress.lessons_completed;
    totalLessons += progress.lessons_total;
    totalQuizzesCompleted += progress.quizzes_completed;
    totalQuizzes += progress.quizzes_total;
    totalAssignmentsCompleted += progress.assignments_completed;
    totalAssignments += progress.assignments_total;
    progressSum += progress.progress_percent;
  }

  const enrolledCourses = items.length;
  const overallPercent =
    enrolledCourses > 0 ? Math.round(progressSum / enrolledCourses) : 0;

  return {
    enrolledCourses,
    inProgressCourses,
    completedCourses: Math.max(completedCourses, certificateCount),
    totalLessonsCompleted,
    totalLessons,
    totalQuizzesCompleted,
    totalQuizzes,
    totalAssignmentsCompleted,
    totalAssignments,
    overallPercent,
  };
}
