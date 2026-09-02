import { t } from "@/i18n";
import type {
  DashboardQuizItem,
  Enrollment,
  QuizSubmissionRecord,
} from "@/types/api";

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

export function quizResultLabel(
  submission: Pick<QuizSubmissionRecord, "status" | "passed">
): string {
  if (submission.status === "pending_review") return t("quiz.take.pendingReview");
  return submission.passed ? t("common.pass") : t("common.fail");
}

export function formatSubmittedAnswer(
  value: string | boolean | string[] | undefined
): string {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? t("common.true") : t("common.false");
  if (Array.isArray(value)) return value.join(", ") || "—";
  return value || "—";
}
