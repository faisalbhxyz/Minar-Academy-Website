import api from "@/api/client";
import type {
  AcademicNoteClass,
  AcademicNoteClassDetail,
  AcademicNotePaperDetail,
  ApiEnvelope,
  AssignmentSubmissionRecord,
  Banner,
  Category,
  Certificate,
  CourseDetails,
  CourseProgressData,
  CourseReview,
  CourseReviewsSummary,
  LessonOfflineDownloadData,
  LessonVideoProgressData,
  Enrollment,
  FreeLessonCatalogApiItem,
  FreeLessonLibraryApiItem,
  FreeLessonsMeta,
  Instructor,
  LearningReportPeriod,
  LoginResponse,
  PaymentMethod,
  QuizSubmissionRecord,
  QuizSubmissionResult,
  Student,
  StudentAssignmentDetail,
  StudentClassProfile,
  StudentLearningReportData,
  StudentNotification,
  StudentOrder,
  SubmitCourseReviewPayload,
  WatchTimeAcceptData,
  WatchTimeBatchData,
  WatchTimeEventPayload,
} from "@/types/api";
import { getDeviceId, getDeviceName } from "@/lib/storage";
import { isAxiosError } from "axios";

export async function login(email: string, password: string) {
  const device_id = await getDeviceId();
  const device_name = getDeviceName();
  const { data } = await api.post<LoginResponse>("/student/login", {
    email,
    password,
    device_id,
    device_name,
  });
  return data;
}

export async function register(payload: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}) {
  const { data } = await api.post("/student/register", payload);
  return data;
}

export async function logout() {
  await api.post("/student/logout");
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post<{
    message?: string;
    dev_reset_link?: string;
  }>("/student/forgot-password", {
    email,
    reset_url: "https://minaracademy.com/auth/reset-password",
  });
  return data;
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
}) {
  const { data } = await api.post<{ message?: string }>(
    "/student/reset-password",
    payload
  );
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  password: string;
  confirm_password: string;
}) {
  const { data } = await api.post<{ message?: string }>(
    "/student/change-password",
    payload
  );
  return data;
}

export async function fetchInstructors() {
  const { data } = await api.get<ApiEnvelope<Instructor[]>>("/instructor/all");
  return data.data ?? [];
}

export async function fetchAcademicNoteClasses() {
  const { data } = await api.get<ApiEnvelope<AcademicNoteClass[]>>(
    "/academic-notes"
  );
  return data.data ?? [];
}

export async function fetchAcademicNoteClassDetail(classSlug: string) {
  const { data } = await api.get<ApiEnvelope<AcademicNoteClassDetail>>(
    `/academic-notes/${classSlug}`
  );
  return data.data;
}

export async function fetchAcademicNotesByPaper(
  classSlug: string,
  subjectSlug: string,
  paperSlug: string
) {
  const { data } = await api.get<ApiEnvelope<AcademicNotePaperDetail>>(
    `/academic-notes/${classSlug}/${subjectSlug}/${paperSlug}`
  );
  return data.data;
}

export async function fetchStudentAssignment(
  courseSlug: string,
  assignmentId: number
) {
  const { data } = await api.get<ApiEnvelope<StudentAssignmentDetail>>(
    `/course/${courseSlug}/assignments/${assignmentId}`
  );
  return data.data;
}

export async function fetchAssignmentSubmissions(courseId?: number) {
  const { data } = await api.get<ApiEnvelope<AssignmentSubmissionRecord[]>>(
    "/student/assignment-submissions",
    { params: courseId ? { course_id: courseId } : undefined }
  );
  return data.data ?? [];
}

export type AssignmentUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function submitAssignment(
  courseSlug: string,
  assignmentId: number,
  payload: {
    responseText?: string;
    files?: AssignmentUploadFile[];
  }
) {
  const formData = new FormData();
  if (payload.responseText?.trim()) {
    formData.append("response_text", payload.responseText);
  }
  for (const file of payload.files ?? []) {
    formData.append("files", file as unknown as Blob);
  }

  const { data } = await api.post<ApiEnvelope<AssignmentSubmissionRecord>>(
    `/course/${courseSlug}/assignments/${assignmentId}/submit`,
    formData,
    { timeout: 90_000 }
  );
  return data.data;
}

export async function fetchQuizSubmissions(courseId?: number) {
  const { data } = await api.get<ApiEnvelope<QuizSubmissionRecord[]>>(
    "/student/quiz-submissions",
    { params: courseId ? { course_id: courseId } : undefined }
  );
  return data.data ?? [];
}

export async function fetchQuizSubmissionDetail(submissionId: number) {
  const { data } = await api.get<ApiEnvelope<QuizSubmissionResult>>(
    `/student/quiz-submissions/${submissionId}`
  );
  return data.data;
}

export async function fetchCourseProgress(courseSlug: string) {
  const { data } = await api.get<ApiEnvelope<CourseProgressData>>(
    `/course/${courseSlug}/progress`
  );
  return data.data;
}

export async function markLessonComplete(
  courseSlug: string,
  lessonId: number
) {
  const { data } = await api.post<ApiEnvelope<CourseProgressData>>(
    `/course/${courseSlug}/lessons/${lessonId}/complete`
  );
  return data.data;
}

/** Authenticated direct file URL for offline save (not the lesson share /view link). */
export async function fetchLessonOfflineDownload(
  courseSlug: string,
  lessonId: number
): Promise<LessonOfflineDownloadData> {
  try {
    const { data } = await api.get<ApiEnvelope<LessonOfflineDownloadData>>(
      `/course/${courseSlug}/lessons/${lessonId}/download`,
      { params: { format: "json" } }
    );
    if (!data.data?.download_url) {
      throw new Error("MISSING_DOWNLOAD_URL");
    }
    return data.data;
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const body = err.response?.data as
        | { error?: string; code?: string; message?: string }
        | undefined;
      const code = body?.error ?? body?.code ?? "";
      const error = new Error(code || `DOWNLOAD_HTTP_${status}`);
      (error as Error & { status?: number; code?: string }).status = status;
      (error as Error & { status?: number; code?: string }).code = code;
      throw error;
    }
    throw err;
  }
}

export async function fetchLessonVideoProgress(
  courseSlug: string,
  lessonId: number
): Promise<LessonVideoProgressData | null> {
  try {
    const { data } = await api.get<ApiEnvelope<LessonVideoProgressData>>(
      `/course/${courseSlug}/lessons/${lessonId}/progress`
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function saveLessonVideoProgress(
  courseSlug: string,
  lessonId: number,
  maxPositionSeconds: number,
  durationSeconds: number
): Promise<void> {
  if (maxPositionSeconds <= 0) return;
  const body: Record<string, number> = {
    max_position_seconds: maxPositionSeconds,
  };
  if (durationSeconds > 0) {
    body.duration_seconds = durationSeconds;
  }
  await api.patch(
    `/course/${courseSlug}/lessons/${lessonId}/progress`,
    body
  );
}

export async function fetchBanners() {
  const { data } = await api.get<ApiEnvelope<Banner[]>>("/banners");
  return data.data ?? [];
}

export async function fetchCourses(showItems: number | "all" = 12) {
  const { data } = await api.get<ApiEnvelope<CourseDetails[]>>("/course", {
    params: { showItems },
  });
  return data.data ?? [];
}

export async function fetchCourseBySlug(slug: string) {
  const { data } = await api.get<ApiEnvelope<CourseDetails>>(`/course/${slug}`);
  return data.data;
}

export async function searchCourses(search: string) {
  const { data } = await api.get<ApiEnvelope<CourseDetails[]>>(
    "/course/search",
    { params: { search } }
  );
  return data.data ?? [];
}

export async function fetchCategories() {
  const { data } = await api.get<ApiEnvelope<Category[]>>("/category");
  return data.data ?? [];
}

export async function fetchCoursesByCategory(slug: string) {
  const { data } = await api.get<ApiEnvelope<CourseDetails[]>>(
    `/course/category/${slug}`
  );
  return data.data ?? [];
}

/** Web parity: filter courses by class subcategory slug. */
export async function fetchCoursesByMenu(slug: string) {
  const { data } = await api.get<ApiEnvelope<CourseDetails[]>>(
    `/course/menu/${slug}`
  );
  return data.data ?? [];
}

export async function fetchFreeLessonsCatalog(params?: {
  classSlug?: string;
  limit?: number;
  offset?: number;
}) {
  const { data } = await api.get<{
    data: FreeLessonCatalogApiItem[];
    meta?: FreeLessonsMeta;
    message?: string;
  }>("/free-lessons", {
    params: {
      class_slug: params?.classSlug || undefined,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    },
  });
  return {
    items: data.data ?? [],
    meta: data.meta,
  };
}

export async function fetchMyFreeLessons() {
  const { data } = await api.get<ApiEnvelope<FreeLessonLibraryApiItem[]>>(
    "/student/free-lessons"
  );
  return data.data ?? [];
}

export async function addMyFreeLessons(lessonIds: number[]) {
  const { data } = await api.post<ApiEnvelope<FreeLessonLibraryApiItem[]>>(
    "/student/free-lessons",
    { lesson_ids: lessonIds }
  );
  return data.data ?? [];
}

export async function removeMyFreeLesson(lessonId: number) {
  const { data } = await api.delete<{ message?: string }>(
    `/student/free-lessons/${lessonId}`
  );
  return data;
}

export async function fetchStudentDetails() {
  const { data } = await api.get<ApiEnvelope<Student>>("/student/details");
  return data.data;
}

export async function fetchClassProfile() {
  const { data } = await api.get<ApiEnvelope<StudentClassProfile | null>>(
    "/student/class-profile"
  );
  return data.data ?? null;
}

export type UpdateClassProfilePayload = {
  class_level?: string;
  hsc_batch?: string | null;
  department?: string | null;
  preferred_class_slug?: string | null;
  onboarding_completed?: boolean;
};

export async function updateClassProfile(payload: UpdateClassProfilePayload) {
  const { data } = await api.put<ApiEnvelope<StudentClassProfile>>(
    "/student/class-profile",
    payload
  );
  return data.data;
}

export type ProfileImageAsset = {
  uri: string;
  name: string;
  type: string;
};

export async function updateStudentProfile(fields: {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  profile_image?: ProfileImageAsset | null;
}): Promise<Student> {
  const formData = new FormData();
  formData.append("first_name", fields.first_name);
  if (fields.last_name !== undefined && fields.last_name !== null) {
    formData.append("last_name", fields.last_name);
  }
  if (fields.phone !== undefined && fields.phone !== null) {
    formData.append("phone", fields.phone);
  }
  if (fields.profile_image) {
    formData.append(
      "profile_image",
      fields.profile_image as unknown as Blob
    );
  }

  const { data } = await api.put<ApiEnvelope<Student>>(
    "/student/update",
    formData,
    { timeout: 65_000 }
  );
  return data.data;
}

export async function fetchEnrollments() {
  const { data } = await api.get<ApiEnvelope<Enrollment[]>>(
    "/enrolled/courses"
  );
  return data.data ?? [];
}

export async function fetchPaymentMethods() {
  const { data } = await api.get<ApiEnvelope<PaymentMethod[]>>(
    "/payment-methods"
  );
  return data.data ?? [];
}

export async function createOrder(payload: {
  course_id: number;
  payment_method: string;
  transaction_id: string | null;
}) {
  const { data } = await api.post("/order/create", payload);
  return data;
}

export async function fetchStudentCertificates() {
  const { data } = await api.get<ApiEnvelope<Certificate[]>>(
    "/student/certificates"
  );
  return data.data ?? [];
}

export async function fetchStudentCertificate(certificateId: number) {
  const { data } = await api.get<ApiEnvelope<Certificate>>(
    `/student/certificates/${certificateId}`
  );
  return data.data;
}

export async function fetchCertificateHTML(certificateId: number) {
  const { data } = await api.get<string>(
    `/student/certificates/${certificateId}/html`,
    { responseType: "text", transformResponse: [(raw) => raw] }
  );
  return typeof data === "string" ? data : String(data);
}

export async function fetchCourseReviews(courseSlug: string) {
  const { data } = await api.get<ApiEnvelope<CourseReviewsSummary>>(
    `/course/${courseSlug}/reviews`
  );
  return data.data;
}

export async function submitCourseReview(
  courseSlug: string,
  payload: SubmitCourseReviewPayload
) {
  const { data } = await api.post<ApiEnvelope<CourseReview>>(
    `/course/${courseSlug}/review`,
    payload
  );
  return data.data;
}

export async function fetchLearningReport(period: LearningReportPeriod = "7d") {
  const { data } = await api.get<ApiEnvelope<StudentLearningReportData>>(
    "/student/learning-report",
    { params: { period } }
  );
  return data.data;
}

export async function postWatchTime(payload: WatchTimeEventPayload) {
  const { data } = await api.post<ApiEnvelope<WatchTimeAcceptData>>(
    "/student/watch-time",
    payload
  );
  return data.data;
}

export async function postWatchTimeBatch(events: WatchTimeEventPayload[]) {
  const { data } = await api.post<ApiEnvelope<WatchTimeBatchData>>(
    "/student/watch-time/batch",
    { events }
  );
  return data.data;
}

export async function fetchNotifications() {
  const { data } = await api.get<ApiEnvelope<StudentNotification[]>>(
    "/student/notifications"
  );
  return data.data ?? [];
}

export async function markNotificationRead(notificationId: number) {
  await api.patch(`/student/notifications/${notificationId}/read`);
}

export async function registerPushToken(payload: {
  token: string;
  platform: "android" | "ios";
  device_id: string;
  provider?: "expo" | "fcm";
}) {
  await api.post("/student/push-token", payload);
}

export async function unregisterPushToken(payload: {
  device_id: string;
  token?: string;
}) {
  await api.delete("/student/push-token", { data: payload });
}

export async function fetchStudentOrders() {
  const { data } = await api.get<ApiEnvelope<StudentOrder[]>>(
    "/student/orders"
  );
  return data.data ?? [];
}

export type DeviceFlagPayload = {
  device_id: string;
  user_id: number | null;
  timestamp: string;
  flags?: {
    isRooted: boolean;
    isDebugged: boolean;
    canMockLocation: boolean;
    isEmulator: boolean;
    isExternalStorage: boolean;
  };
};

/** Logs rooted / suspicious devices for server-side review. */
export async function reportDeviceFlag(
  payload: DeviceFlagPayload
): Promise<void> {
  await api.post("/device-flag", payload);
}
