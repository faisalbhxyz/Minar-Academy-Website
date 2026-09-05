import type {
  AssignmentSubmissionRecord,
  Certificate,
  CourseProgressData,
  Enrollment,
  QuizSubmissionRecord,
  StudentLearningReportData,
} from "@/types/api";

export function buildCertificateIdByCourseId(
  certificates: Certificate[]
): Map<number, number> {
  const map = new Map<number, number>();
  for (const certificate of certificates) {
    map.set(certificate.course_id, certificate.id);
  }
  return map;
}

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

export type LearningTimeCategory =
  | "live_class"
  | "video"
  | "quiz"
  | "exam"
  | "written_exam";

export type LearningTimePeriod = "7d" | "30d" | "90d";

export type DailyLearningTime = {
  dateKey: string;
  label: string;
  byCategory: Record<LearningTimeCategory, number>;
  totalSeconds: number;
};

export type LearningReportMetrics = {
  overallPercent: number;
  trophyCount: number;
  correctAnswerRate: number;
  classParticipationRate: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
};

export type LearningTimeSnapshot = {
  period: LearningTimePeriod;
  days: DailyLearningTime[];
  totalSeconds: number;
  averageSecondsPerDay: number;
};

export type FullLearningReport = {
  items: EnrollmentWithProgress[];
  summary: LearningReportSummary;
  metrics: LearningReportMetrics;
  learningTime: LearningTimeSnapshot;
  apiInsights?: StudentLearningReportData | null;
};

const QUIZ_ESTIMATE_SECONDS = 8 * 60;
const ASSIGNMENT_ESTIMATE_SECONDS = 25 * 60;
const PERIOD_DAYS: Record<LearningTimePeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const DAY_LABEL_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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

export function buildLearningReportMetrics(
  summary: LearningReportSummary,
  quizSubmissions: QuizSubmissionRecord[],
  certificateCount: number
): LearningReportMetrics {
  const gradedQuizzes = quizSubmissions.filter(
    (submission) => submission.status === "graded" && submission.max_score > 0
  );

  const correctAnswerRate =
    gradedQuizzes.length > 0
      ? Math.round(
          gradedQuizzes.reduce((sum, item) => sum + item.percentage, 0) /
            gradedQuizzes.length
        )
      : 0;

  const classParticipationRate =
    summary.totalLessons > 0
      ? Math.round(
          (summary.totalLessonsCompleted / summary.totalLessons) * 100
        )
      : 0;

  return {
    overallPercent: summary.overallPercent,
    trophyCount: certificateCount,
    correctAnswerRate,
    classParticipationRate,
    assignmentsCompleted: summary.totalAssignmentsCompleted,
    assignmentsTotal: summary.totalAssignments,
  };
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabel(date: Date, short = true): string {
  const key = DAY_LABEL_KEYS[date.getDay()];
  if (!short) return key;
  return key.charAt(0).toUpperCase() + key.slice(1, 3);
}

function emptyCategoryTotals(): Record<LearningTimeCategory, number> {
  return {
    live_class: 0,
    video: 0,
    quiz: 0,
    exam: 0,
    written_exam: 0,
  };
}

function addSeconds(
  bucket: DailyLearningTime,
  category: LearningTimeCategory,
  seconds: number
): void {
  if (seconds <= 0) return;
  bucket.byCategory[category] += seconds;
  bucket.totalSeconds += seconds;
}

export function buildLearningTimeSnapshot(
  period: LearningTimePeriod,
  quizSubmissions: QuizSubmissionRecord[],
  assignmentSubmissions: AssignmentSubmissionRecord[]
): LearningTimeSnapshot {
  const dayCount = PERIOD_DAYS[period];
  const today = startOfDay(new Date());
  const buckets: DailyLearningTime[] = [];

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.push({
      dateKey: dateKey(date),
      label: period === "7d" ? dayLabel(date) : String(date.getDate()),
      byCategory: emptyCategoryTotals(),
      totalSeconds: 0,
    });
  }

  const bucketByKey = new Map(
    buckets.map((bucket) => [bucket.dateKey, bucket] as const)
  );
  const periodStart = buckets[0]?.dateKey;

  for (const submission of quizSubmissions) {
    const submitted = startOfDay(new Date(submission.submitted_at));
    const key = dateKey(submitted);
    if (!periodStart || key < periodStart || key > dateKey(today)) continue;
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;
    addSeconds(bucket, "quiz", QUIZ_ESTIMATE_SECONDS);
  }

  for (const submission of assignmentSubmissions) {
    const submitted = startOfDay(new Date(submission.submitted_at));
    const key = dateKey(submitted);
    if (!periodStart || key < periodStart || key > dateKey(today)) continue;
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;
    addSeconds(bucket, "written_exam", ASSIGNMENT_ESTIMATE_SECONDS);
  }

  const totalSeconds = buckets.reduce((sum, day) => sum + day.totalSeconds, 0);
  const averageSecondsPerDay =
    dayCount > 0 ? Math.round(totalSeconds / dayCount) : 0;

  return {
    period,
    days: buckets,
    totalSeconds,
    averageSecondsPerDay,
  };
}

export function formatLearningDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 sec";
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatAverageLearningDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  if (totalSeconds < 60) return `${totalSeconds}s`;
  return `${Math.round(totalSeconds / 60)}m`;
}

export async function fetchEnrollmentsWithProgress(): Promise<
  EnrollmentWithProgress[]
> {
  const api = await import("@/api");
  const enrollments = await api.fetchEnrollments();
  const withProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      try {
        const progress = await api.fetchCourseProgress(enrollment.course.slug);
        return { enrollment, progress };
      } catch {
        return { enrollment, progress: null };
      }
    })
  );
  return withProgress;
}

function normalizeApiDateKey(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

export function buildLearningTimeFromApi(
  period: LearningTimePeriod,
  apiData: StudentLearningReportData | null | undefined,
  localWatchByDate?: Record<string, number> | null,
  preferServer = false
): LearningTimeSnapshot | null {
  const serverFetched = apiData != null;
  const hasApiRows = Boolean(apiData?.daily_watch_seconds?.length);
  const hasLocal = Boolean(
    localWatchByDate && Object.keys(localWatchByDate).length > 0
  );
  // Successful empty GET still yields a zero snapshot when preferServer.
  if (!serverFetched && !hasLocal) return null;
  if (preferServer && serverFetched && !hasApiRows && !hasLocal) {
    // Fall through to build zero buckets from empty API.
  } else if (!hasApiRows && !hasLocal && !preferServer) {
    return null;
  }

  const dayCount = PERIOD_DAYS[period];
  const today = startOfDay(new Date());
  const secondsByDate = new Map<string, number>();

  if (apiData?.daily_watch_seconds) {
    for (const row of apiData.daily_watch_seconds) {
      const key = normalizeApiDateKey(row.date);
      if (!key) continue;
      secondsByDate.set(key, Math.max(secondsByDate.get(key) ?? 0, row.seconds));
    }
  }

  // Server wins after successful GET (including empty). Local only when offline / GET failed.
  if (!preferServer && localWatchByDate) {
    for (const [key, seconds] of Object.entries(localWatchByDate)) {
      secondsByDate.set(key, Math.max(secondsByDate.get(key) ?? 0, seconds));
    }
  }

  const buckets: DailyLearningTime[] = [];

  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = dateKey(date);
    const seconds = secondsByDate.get(key) ?? 0;
    const bucket: DailyLearningTime = {
      dateKey: key,
      label: period === "7d" ? dayLabel(date) : String(date.getDate()),
      byCategory: emptyCategoryTotals(),
      totalSeconds: 0,
    };
    addSeconds(bucket, "video", seconds);
    buckets.push(bucket);
  }

  const totalSeconds = buckets.reduce((sum, day) => sum + day.totalSeconds, 0);
  return {
    period,
    days: buckets,
    totalSeconds,
    averageSecondsPerDay:
      dayCount > 0 ? Math.round(totalSeconds / dayCount) : 0,
  };
}

export function mergeMetricsWithApi(
  metrics: LearningReportMetrics,
  apiData: StudentLearningReportData | null | undefined
): LearningReportMetrics {
  if (!apiData) return metrics;
  return {
    ...metrics,
    correctAnswerRate: Math.round(apiData.quiz_accuracy_percent),
    trophyCount: Math.max(metrics.trophyCount, apiData.courses_completed),
  };
}

export async function fetchFullLearningReport(
  period: LearningTimePeriod = "7d",
  userId?: number
): Promise<FullLearningReport> {
  const api = await import("@/api");
  const { useLearningStore } = await import("@/store/learningStore");

  const [items, certificates, quizSubmissions, assignmentSubmissions, apiInsights] =
    await Promise.all([
      fetchEnrollmentsWithProgress(),
      api.fetchStudentCertificates(),
      api.fetchQuizSubmissions(),
      api.fetchAssignmentSubmissions(),
      api.fetchLearningReport(period).catch(() => null),
    ]);

  const summary = buildLearningReportSummary(items, certificates.length);
  if (apiInsights) {
    summary.inProgressCourses = apiInsights.courses_in_progress;
    summary.completedCourses = Math.max(
      summary.completedCourses,
      apiInsights.courses_completed
    );
  }

  const metrics = mergeMetricsWithApi(
    buildLearningReportMetrics(summary, quizSubmissions, certificates.length),
    apiInsights
  );

  const dayCount = PERIOD_DAYS[period];
  const today = startOfDay(new Date());
  const periodStart = new Date(today);
  periodStart.setDate(today.getDate() - (dayCount - 1));
  const localWatch =
    userId != null
      ? useLearningStore
          .getState()
          .getDailyWatchSeconds(userId, dateKey(periodStart), dateKey(today))
      : null;

  const reportFetchedOk = apiInsights != null;
  const fromApi = buildLearningTimeFromApi(
    period,
    apiInsights,
    localWatch,
    reportFetchedOk
  );
  const fromFallback = buildLearningTimeSnapshot(
    period,
    quizSubmissions,
    assignmentSubmissions
  );

  // Successful GET is authoritative (even zeros). Estimates only when GET failed.
  const learningTime = reportFetchedOk
    ? fromApi ?? {
        period,
        days: fromFallback.days.map((day) => ({
          ...day,
          byCategory: emptyCategoryTotals(),
          totalSeconds: 0,
        })),
        totalSeconds: 0,
        averageSecondsPerDay: 0,
      }
    : fromApi && fromApi.totalSeconds > 0
      ? fromApi
      : fromFallback.totalSeconds > 0
        ? fromFallback
        : fromApi ?? fromFallback;

  return {
    items,
    summary,
    metrics,
    learningTime,
    apiInsights,
  };
}
