import api from "@/api/client";
import type {
  ApiEnvelope,
  QuizAnswerPayload,
  QuizSubmissionResult,
  StudentQuizDetail,
} from "@/types/api";

export async function fetchStudentQuiz(courseSlug: string, quizId: number) {
  const { data } = await api.get<ApiEnvelope<StudentQuizDetail>>(
    `/course/${courseSlug}/quizzes/${quizId}`
  );
  return data.data;
}

export async function submitQuiz(
  courseSlug: string,
  quizId: number,
  answers: QuizAnswerPayload[]
) {
  const { data } = await api.post<
    ApiEnvelope<QuizSubmissionResult> & { message?: string }
  >(`/course/${courseSlug}/quizzes/${quizId}/submit`, { answers });
  return {
    result: data.data,
    message: data.message,
  };
}
