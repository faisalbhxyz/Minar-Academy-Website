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

export function getQuizPassingMarks(
  maxScore: number,
  minimumPassPercentage: number
): number {
  return Math.round(((maxScore * minimumPassPercentage) / 100) * 100) / 100;
}

export function countQuizAnswerStats(answers: QuizSubmissionAnswer[]): {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
} {
  let correct = 0;
  let incorrect = 0;

  for (const answer of answers) {
    if (answer.is_correct === true) correct++;
    else if (answer.is_correct === false) incorrect++;
  }

  return {
    correct,
    incorrect,
    unanswered: 0,
    total: answers.length,
  };
}

export function getQuizResultDisplayStats(
  result: QuizSubmissionResult,
  quiz: Pick<CourseQuiz, "minimum_pass_percentage">
): {
  questionCount: number;
  correct: number;
  incorrect: number;
  passingMarks: number;
} {
  const derived = countQuizAnswerStats(result.answers);
  const questionCount =
    result.total_questions ??
    (derived.total || getQuizQuestionCount(quiz as StudentQuizDetail));

  return {
    questionCount,
    correct: result.correct_count ?? derived.correct,
    incorrect: result.incorrect_count ?? derived.incorrect,
    passingMarks:
      result.pass_marks ??
      getQuizPassingMarks(
        result.max_score,
        result.minimum_pass_percentage ?? quiz.minimum_pass_percentage
      ),
  };
}

export function getQuizAttemptResultLabel(
  result: Pick<QuizSubmissionResult, "status" | "passed">
): string {
  if (result.status === "pending_review") return "Pending";
  return result.passed ? "Passed" : "Failed";
}

export function getQuizAttemptResultClasses(
  result: Pick<QuizSubmissionResult, "status" | "passed">
): string {
  if (result.status === "pending_review") {
    return "bg-orange-100 text-orange-700";
  }
  return result.passed
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

export function formatQuizMarks(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
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
  if (quiz.total_visible_questions > 0) {
    return quiz.total_visible_questions;
  }
  return quiz.questions?.length ?? 0;
}

export function formatQuizTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatQuizTimerDetailed(seconds: number): string {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${h}h ${m}m ${s}s`;
}

export function formatQuizTimeLimitLabel(
  limit: number,
  option: string
): string {
  if (!limit) return "No time limit";

  const units: Record<string, [string, string]> = {
    minutes: ["Minute", "Minutes"],
    hours: ["Hour", "Hours"],
    days: ["Day", "Days"],
    weeks: ["Week", "Weeks"],
    months: ["Month", "Months"],
  };

  const [singular, plural] = units[option] ?? [
    option.charAt(0).toUpperCase() + option.slice(1),
    `${option.charAt(0).toUpperCase() + option.slice(1)}s`,
  ];
  return `${limit} ${limit === 1 ? singular : plural}`;
}

export function quizTimeLimitToSeconds(
  limit: number,
  option: string
): number {
  if (!limit) return 0;

  const multipliers: Record<string, number> = {
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000,
  };

  return limit * (multipliers[option] ?? 60);
}

export function getQuizMaxAttempts(
  quiz: Pick<CourseQuiz, "enable_retry" | "retry_attempts">
): number | null {
  if (!quiz.enable_retry) return 1;
  if (quiz.retry_attempts === 0) return null;
  return quiz.retry_attempts;
}

export function formatQuizAttemptsLabel(
  attemptsUsed: number,
  maxAttempts: number | null
): string {
  if (maxAttempts === null) {
    return `${attemptsUsed} / Unlimited`;
  }
  return `${attemptsUsed}/${maxAttempts}`;
}

export function formatQuizAttemptsAllowed(
  quiz: Pick<CourseQuiz, "enable_retry" | "retry_attempts">
): string {
  const maxAttempts = getQuizMaxAttempts(quiz);
  if (maxAttempts === null) return "Unlimited";
  return String(maxAttempts);
}

export function findCourseQuiz(
  course: CourseDetails | null,
  quizId: number
): CourseQuiz | null {
  if (!course?.course_chapters?.length) return null;

  for (const chapter of course.course_chapters) {
    const quiz = chapter.quizzes?.find(
      (item) => item.id === quizId && item.is_published
    );
    if (quiz) return quiz;
  }

  return null;
}

export function deriveQuizAttemptState(
  quiz: CourseQuiz,
  submissions: QuizSubmissionRecord[]
): Pick<StudentQuizDetail, "attempts_used" | "can_retry"> {
  const attempts_used = submissions.filter(
    (submission) => submission.quiz_id === quiz.id
  ).length;

  let can_retry = true;
  if (!quiz.enable_retry) {
    can_retry = attempts_used === 0;
  } else if (quiz.retry_attempts > 0) {
    can_retry = attempts_used < quiz.retry_attempts;
  }

  return { attempts_used, can_retry };
}

export function buildQuizPreviewDetail(
  quiz: CourseQuiz,
  submissions: QuizSubmissionRecord[]
): StudentQuizDetail {
  const attemptState = deriveQuizAttemptState(quiz, submissions);

  return {
    ...quiz,
    ...attemptState,
    questions: quiz.questions ?? [],
  };
}

export type QuizSubmissionStatus =
  | "not_attempted"
  | QuizSubmissionRecord["status"];

export function buildQuizSubmissionStatusMap(
  submissions: QuizSubmissionRecord[]
): Record<number, Exclude<QuizSubmissionStatus, "not_attempted">> {
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

  return Object.fromEntries(
    [...latestByQuizId.entries()].map(([quizId, submission]) => [
      quizId,
      submission.status,
    ])
  );
}

export function isQuizQuestionTypeSupported(type: string): boolean {
  return ["single_choice", "multiple_choice", "true_false"].includes(type);
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
