"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import axiosInstance from "@/lib/axiosInstance";
import { buildLearningReportSummary } from "@/lib/learningReport";
import type { EnrollmentWithProgress } from "@/lib/learningReport";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import { Session } from "next-auth";

function withNormalizedCourseMedia<T extends { featured_image?: string | null }>(
  course: T
): T {
  return {
    ...course,
    featured_image: normalizeMediaUrl(course.featured_image) ?? course.featured_image,
  };
}

export const doCretendentialLogin = async (
  email: string,
  password: string,
  deviceId: string,
  deviceName?: string
) => {
  try {
    await signIn("credentials", {
      email,
      password,
      device_id: deviceId,
      device_name: deviceName ?? "",
      redirect: false,
    });
  } catch (error: any) {
    return {
      error: error.cause?.err.response.data.message || "Something went wrong.",
    };
  }
};

export const doCretendentialLogout = async () => {
  try {
    const session = await auth();
    if (session?.accessToken) {
      await axiosInstance.post(
        "/student/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
    }
  } catch {
    // Continue with local sign-out even if the API call fails.
  }
  await signOut();
};

export const getAllCourses = async (
  showItems?: number
): Promise<CourseDetails[]> => {
  try {
    const queryParam = showItems ? `showItems=${showItems}` : `showItems=all`;

    const res = await axiosInstance.get(`/course?${queryParam}`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });

    return (res.data.data ?? []).map(withNormalizedCourseMedia);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

export const getCourseBySlug = async (
  slug: string
): Promise<CourseDetails | null> => {
  try {
    const res = await axiosInstance.get(`/course/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data ? withNormalizedCourseMedia(res.data.data) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getCourseProgress = async (
  slug: string,
  session: Session
): Promise<CourseProgressData | null> => {
  try {
    const res = await axiosInstance.get(`/course/${slug}/progress`, {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch course progress:", error);
    return null;
  }
};

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get("/category", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getStudentDetails = async (session: Session): Promise<Student> => {
  try {
    const res = await axiosInstance.get("/student/details", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return res.data.data;
  } catch (error) {
    return {} as Student;
  }
};

export const getStudentEnrollments = async (
  session: Session
): Promise<Enrollment[]> => {
  try {
    const res = await axiosInstance.get("/enrolled/courses", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return (res.data.data ?? []).map((enrollment: Enrollment) => {
      if (!enrollment?.course) return enrollment;
      return {
        ...enrollment,
        course: withNormalizedCourseMedia(enrollment.course),
      };
    });
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getPaymentMethods = async (): Promise<IPaymentMethod[]> => {
  try {
    const res = await axiosInstance.get("/payment-methods", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const studentAuthHeaders = (session: Session) => ({
  "Content-Type": "application/json",
  "app-key": process.env.NEXT_PUBLIC_APP_KEY,
  Authorization: `Bearer ${session.accessToken}`,
});

export const getStudentAssignment = async (
  courseSlug: string,
  assignmentId: number,
  session: Session
): Promise<StudentAssignmentDetail | null> => {
  try {
    const res = await axiosInstance.get(
      `/course/${courseSlug}/assignments/${assignmentId}`,
      { headers: studentAuthHeaders(session) }
    );
    return res.data.data;
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
    return null;
  }
};

export const getStudentAssignmentSubmissions = async (
  session: Session,
  courseId?: number
): Promise<AssignmentSubmissionRecord[]> => {
  try {
    const query = courseId ? `?course_id=${courseId}` : "";
    const res = await axiosInstance.get(
      `/student/assignment-submissions${query}`,
      { headers: studentAuthHeaders(session) }
    );
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch assignment submissions:", error);
    return [];
  }
};

export const getStudentAssignmentSubmission = async (
  submissionId: number,
  session: Session
): Promise<AssignmentSubmissionRecord | null> => {
  try {
    const res = await axiosInstance.get(
      `/student/assignment-submissions/${submissionId}`,
      { headers: studentAuthHeaders(session) }
    );
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch assignment submission:", error);
    return null;
  }
};

export const getStudentQuiz = async (
  courseSlug: string,
  quizId: number,
  session: Session
): Promise<StudentQuizFetchResult> => {
  try {
    const res = await axiosInstance.get(
      `/course/${courseSlug}/quizzes/${quizId}`,
      { headers: studentAuthHeaders(session) }
    );
    return { ok: true, quiz: res.data.data };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
    };
    const status = axiosError.response?.status ?? 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      (status === 403
        ? "You must be enrolled in this course to take the quiz."
        : status === 404
          ? "Quiz not found or is not published."
          : "Failed to load quiz.");
    console.error("Failed to fetch quiz:", error);
    return { ok: false, status, message };
  }
};

export const getStudentQuizSubmissions = async (
  session: Session,
  courseId?: number
): Promise<QuizSubmissionRecord[]> => {
  try {
    const query = courseId ? `?course_id=${courseId}` : "";
    const res = await axiosInstance.get(`/student/quiz-submissions${query}`, {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch quiz submissions:", error);
    return [];
  }
};

export const getStudentCertificates = async (
  session: Session
): Promise<Certificate[]> => {
  try {
    const res = await axiosInstance.get("/student/certificates", {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    return [];
  }
};

export const getStudentCertificateById = async (
  certificateId: number,
  session: Session
): Promise<Certificate | null> => {
  try {
    const res = await axiosInstance.get(`/student/certificates/${certificateId}`, {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch certificate:", error);
    return null;
  }
};

export const getCourseCertificate = async (
  courseSlug: string,
  session: Session
): Promise<Certificate | null> => {
  try {
    const res = await axiosInstance.get(`/course/${courseSlug}/certificate`, {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? null;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return null;
    console.error("Failed to fetch course certificate:", error);
    return null;
  }
};

export const getCourseReviews = async (
  courseSlug: string,
  session?: Session
): Promise<CourseReviewsSummary | null> => {
  try {
    const headers = session
      ? studentAuthHeaders(session)
      : {
          "Content-Type": "application/json",
          "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        };
    const res = await axiosInstance.get(`/course/${courseSlug}/reviews`, {
      headers,
    });
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch course reviews:", error);
    return null;
  }
};

export const submitCourseReviewAction = async (
  courseSlug: string,
  payload: { rating: number; comment?: string; tags?: string[] },
  session: Session
): Promise<CourseReview | null> => {
  try {
    const res = await axiosInstance.post(
      `/course/${courseSlug}/review`,
      payload,
      { headers: studentAuthHeaders(session) }
    );
    return res.data.data ?? null;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "রিভিউ জমা দেওয়া যায়নি।";
    throw new Error(message);
  }
};

export const getEnrolledCoursesWithAssignments = async (
  session: Session
): Promise<Enrollment[]> => {
  const enrollments = await getStudentEnrollments(session);
  if (enrollments.length === 0) return [];

  const enriched = await Promise.all(
    enrollments.map(async (enrollment) => {
      const hasAssignments = enrollment.course?.course_chapters?.some(
        (chapter) => (chapter.assignments?.length ?? 0) > 0
      );

      if (hasAssignments) return enrollment;

      const courseDetails = await getCourseBySlug(enrollment.course.slug);
      if (!courseDetails) return enrollment;

      return {
        ...enrollment,
        course: courseDetails,
      };
    })
  );

  return enriched;
};

export const getEnrollmentsWithProgress = async (
  session: Session
): Promise<EnrollmentWithProgress[]> => {
  const enrollments = await getStudentEnrollments(session);
  if (enrollments.length === 0) return [];

  return Promise.all(
    enrollments
      .filter((enrollment) => enrollment.course)
      .map(async (enrollment) => ({
        enrollment,
        progress: await getCourseProgress(enrollment.course.slug, session),
      }))
  );
};

export const getStudentLearningReport = async (session: Session) => {
  const [items, certificates, apiInsights] = await Promise.all([
    getEnrollmentsWithProgress(session),
    getStudentCertificates(session),
    fetchLearningReportServer(session, "7d"),
  ]);
  const summary = buildLearningReportSummary(items, certificates.length);
  if (apiInsights) {
    summary.inProgressCourses = apiInsights.courses_in_progress;
    summary.completedCourses = Math.max(
      summary.completedCourses,
      apiInsights.courses_completed
    );
  }
  return { items, summary, apiInsights, certificateCount: certificates.length };
};

export const fetchLearningReportServer = async (
  session: Session,
  period: LearningReportPeriod = "7d"
): Promise<StudentLearningReportData | null> => {
  try {
    const res = await axiosInstance.get("/student/learning-report", {
      headers: studentAuthHeaders(session),
      params: { period },
    });
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to fetch learning report:", error);
    return null;
  }
};

export const getStudentNotifications = async (
  session: Session
): Promise<StudentNotification[]> => {
  try {
    const res = await axiosInstance.get("/student/notifications", {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};

export const markStudentNotificationRead = async (
  notificationId: number
): Promise<boolean> => {
  const session = await auth();
  if (!session?.accessToken) return false;
  try {
    const res = await axiosInstance.patch(
      `/student/notifications/${notificationId}/read`,
      {},
      { headers: studentAuthHeaders(session) }
    );
    return res.status >= 200 && res.status < 300;
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    return false;
  }
};

export const getStudentOrders = async (
  session: Session
): Promise<StudentOrder[]> => {
  try {
    const res = await axiosInstance.get("/student/orders", {
      headers: studentAuthHeaders(session),
    });
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};
