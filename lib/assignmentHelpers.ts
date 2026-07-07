export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatSubmissionDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getAssignmentResultLabel(
  submission: AssignmentSubmissionSummary
): string {
  if (submission.status === "pending_review") return "Pending";
  if (submission.status === "graded") {
    return submission.passed ? "Passed" : "Failed";
  }
  return "Submitted";
}

export function getAssignmentResultClasses(
  submission: AssignmentSubmissionSummary
): string {
  if (submission.status === "pending_review") {
    return "bg-orange-100 text-orange-700";
  }
  if (submission.status === "graded") {
    return submission.passed
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  }
  return "bg-blue-100 text-blue-700";
}

export function formatAssignmentTimeLimit(
  limit: number,
  option: CourseAssignment["time_limit_option"]
): string {
  const units: Record<CourseAssignment["time_limit_option"], [string, string]> =
    {
      minutes: ["minute", "minutes"],
      hours: ["hour", "hours"],
      days: ["day", "days"],
      weeks: ["week", "weeks"],
      months: ["month", "months"],
    };

  const [singular, plural] = units[option] ?? [option, `${option}s`];
  return `${limit} ${limit === 1 ? singular : plural}`;
}

export function getAssignmentStatusLabel(
  status: AssignmentSubmissionSummary["status"]
): string {
  switch (status) {
    case "pending_review":
      return "Review pending";
    case "graded":
      return "Graded";
    case "submitted":
      return "Submitted";
    default:
      return status;
  }
}

export function getAssignmentStatusClasses(
  status: AssignmentSubmissionSummary["status"] | "not_submitted"
): string {
  switch (status) {
    case "pending_review":
      return "bg-amber-100 text-amber-800";
    case "graded":
      return "bg-green-100 text-green-800";
    case "submitted":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

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

        const submissionRecord = submissionByAssignmentId.get(assignment.id);

        items.push({
          courseSlug: course.slug,
          courseTitle: course.title,
          chapterTitle: chapter.title,
          assignment,
          submission: submissionRecord
            ? {
                id: submissionRecord.id,
                score: submissionRecord.score,
                max_score: submissionRecord.max_score,
                percentage: submissionRecord.percentage,
                passed: submissionRecord.passed,
                status: submissionRecord.status,
                submitted_at: submissionRecord.submitted_at,
              }
            : undefined,
        });
      }
    }
  }

  return items.sort((a, b) => a.assignment.title.localeCompare(b.assignment.title));
}

const TIME_LIMIT_MS: Record<CourseAssignment["time_limit_option"], number> = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
};

export function timeLimitToMilliseconds(
  limit: number,
  option: CourseAssignment["time_limit_option"]
): number {
  return limit * (TIME_LIMIT_MS[option] ?? TIME_LIMIT_MS.days);
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
  if (totalSeconds <= 0) return "Expired";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "Day" : "Days"}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "Hour" : "Hours"}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`);
  }

  return parts.join(", ");
}

export function isAssignmentResponseEmpty(html: string): boolean {
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !stripped;
}

export function submissionNeedsDetailFallback(
  submission: AssignmentSubmissionSummary
): boolean {
  const hasText =
    !!submission.response_text &&
    !isAssignmentResponseEmpty(submission.response_text);
  const hasFiles = (submission.files?.length ?? 0) > 0;
  return !hasText && !hasFiles;
}

export function buildAssignmentStatusMap(
  submissions: AssignmentSubmissionRecord[]
): Record<number, AssignmentSubmissionSummary["status"]> {
  return Object.fromEntries(
    submissions.map((submission) => [submission.assignment_id, submission.status])
  );
}

export function mimeTypesToAccept(mimeTypes?: string[]): string {
  if (!mimeTypes?.length) {
    return "image/*,.pdf,.doc,.docx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,text/plain";
  }
  return mimeTypes.join(",");
}

export function formatMaxFileSize(bytes?: number): string {
  const size = bytes ?? 2 * 1024 * 1024;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(0)} MB`;
}
