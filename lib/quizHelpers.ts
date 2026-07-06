export function formatQuizTimeLimit(
  limit: number,
  option: string
): string {
  if (!limit) return "No time limit";

  const units: Record<string, [string, string]> = {
    minutes: ["minute", "minutes"],
    hours: ["hour", "hours"],
    days: ["day", "days"],
    weeks: ["week", "weeks"],
    months: ["month", "months"],
  };

  const [singular, plural] = units[option] ?? [option, `${option}s`];
  return `${limit} ${limit === 1 ? singular : plural}`;
}

export function getQuizStatusLabel(
  status: QuizSubmissionRecord["status"]
): string {
  switch (status) {
    case "pending_review":
      return "Under review";
    case "graded":
      return "Graded";
    default:
      return status;
  }
}

export function getQuizStatusClasses(
  status: QuizSubmissionRecord["status"] | "not_attempted"
): string {
  switch (status) {
    case "pending_review":
      return "bg-amber-100 text-amber-800";
    case "graded":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getQuizPassClasses(passed: boolean): string {
  return passed
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
}

export function isSingleQuizDisplay(quiz: StudentQuizDetail): boolean {
  if (quiz.display_mode === "single") return true;
  if (quiz.display_mode === "all") return false;
  return Boolean(quiz.single_quiz_view);
}

export function getQuizQuestionCount(quiz: StudentQuizDetail): number {
  if (quiz.total_questions != null && quiz.total_questions > 0) {
    return quiz.total_questions;
  }
  return quiz.questions?.length ?? 0;
}

export function formatQuizTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function buildDashboardQuizzes(
  enrollments: Enrollment[],
  submissions: QuizSubmissionRecord[]
): DashboardQuizItem[] {
  const latestByQuizId = new Map<number, QuizSubmissionRecord>();

  for (const submission of submissions) {
    const existing = latestByQuizId.get(submission.quiz_id);
    if (
      !existing ||
      new Date(submission.submitted_at) > new Date(existing.submitted_at)
    ) {
      latestByQuizId.set(submission.quiz_id, submission);
    }
  }

  const items: DashboardQuizItem[] = [];

  for (const enrollment of enrollments) {
    const course = enrollment.course;
    if (!course?.course_chapters?.length) continue;

    for (const chapter of course.course_chapters) {
      for (const quiz of chapter.quizzes ?? []) {
        if (!quiz.is_published) continue;

        items.push({
          courseSlug: course.slug,
          courseTitle: course.title,
          chapterTitle: chapter.title,
          quiz,
          latestSubmission: latestByQuizId.get(quiz.id),
        });
      }
    }
  }

  return items.sort((a, b) => a.quiz.title.localeCompare(b.quiz.title));
}
