"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import axiosInstance from "@/lib/axiosInstance";
import { Session } from "next-auth";

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

    return res.data.data ?? [];
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
    return res.data.data;
  } catch (error) {
    console.log(error);
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
    return res.data.data ?? [];
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

export const getStudentQuiz = async (
  courseSlug: string,
  quizId: number,
  session: Session
): Promise<StudentQuizDetail | null> => {
  try {
    const res = await axiosInstance.get(
      `/course/${courseSlug}/quizzes/${quizId}`,
      { headers: studentAuthHeaders(session) }
    );
    return res.data.data;
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return null;
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
