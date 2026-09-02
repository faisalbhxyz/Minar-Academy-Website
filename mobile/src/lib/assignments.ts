import { t } from "@/i18n";
import type {
  AssignmentSubmissionRecord,
  AssignmentSubmissionSummary,
  AssignmentTimeLimitOption,
  CourseAssignment,
  DashboardAssignmentItem,
  Enrollment,
} from "@/types/api";

const TIME_LIMIT_MS: Record<AssignmentTimeLimitOption, number> = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
};

export function buildDashboardAssignments(
  enrollments: Enrollment[],
  submissions: AssignmentSubmissionRecord[]
): DashboardAssignmentItem[] {
  const submissionByAssignmentId = new Map(
    submissions.map((submission) => [submission.assignment_id, submission])
  );

  const items: DashboardAssignmentItem[] = [];

  for (const enrollment of enrollments) {
    const course = enrollment.course;
    if (!course?.course_chapters?.length) continue;

    for (const chapter of course.course_chapters) {
      for (const assignment of chapter.assignments ?? []) {
        if (!assignment.is_published) continue;

        const record = submissionByAssignmentId.get(assignment.id);
        items.push({
          courseSlug: course.slug,
          courseTitle: course.title,
          chapterTitle: chapter.title,
          assignment,
          submission: record
            ? {
                id: record.id,
                score: record.score,
                max_score: record.max_score,
                percentage: record.percentage,
                passed: record.passed,
                status: record.status,
                submitted_at: record.submitted_at,
                response_text: record.response_text,
                files: record.files,
              }
            : undefined,
        });
      }
    }
  }

  return items.sort((a, b) =>
    a.assignment.title.localeCompare(b.assignment.title)
  );
}

export function formatAssignmentTimeLimit(
  limit: number,
  option: AssignmentTimeLimitOption
): string {
  if (!limit) return t("common.noTimeLimit");
  const unit = t(`assignments.time.${option}`);
  return t("assignments.time.limitFormat", { limit, unit });
}

export function getAssignmentDeadlineSeconds(
  assignment: Pick<CourseAssignment, "time_limit"> & {
    deadline_at?: string | null;
    seconds_remaining?: number | null;
  }
): number | null {
  if (assignment.seconds_remaining != null) {
    return Math.max(0, assignment.seconds_remaining);
  }
  if (assignment.deadline_at) {
    const remainingMs = new Date(assignment.deadline_at).getTime() - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
  return null;
}

export function formatDeadlineRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return t("common.deadlineExpired");
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(t("assignments.time.countDays", { count: days }));
  if (hours > 0) parts.push(t("assignments.time.countHours", { count: hours }));
  if (minutes > 0 || parts.length === 0) {
    parts.push(t("assignments.time.countMinutes", { count: minutes }));
  }
  return parts.join(", ");
}

export function assignmentResultLabel(
  submission: AssignmentSubmissionSummary
): string {
  if (submission.status === "pending_review") {
    return t("assignments.detail.pendingReview");
  }
  if (submission.status === "graded") {
    return submission.passed ? t("common.pass") : t("common.fail");
  }
  return t("common.submitted");
}

export function isAssignmentResponseEmpty(html: string): boolean {
  return !html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatMaxFileSize(bytes?: number): string {
  const size = bytes ?? 2 * 1024 * 1024;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(0)} MB`;
}

export function timeLimitToMilliseconds(
  limit: number,
  option: AssignmentTimeLimitOption
): number {
  return limit * (TIME_LIMIT_MS[option] ?? TIME_LIMIT_MS.days);
}
