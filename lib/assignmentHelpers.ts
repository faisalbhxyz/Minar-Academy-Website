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
