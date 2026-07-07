import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { ifSessionReplaced } from "@/lib/sessionReplaced";

function quizHeaders(accessToken: string): HeadersInit {
  return {
    "app-key": publicAppKey ?? "",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchStudentQuiz(
  courseSlug: string,
  quizId: number,
  accessToken: string
): Promise<StudentQuizFetchResult> {
  if (!publicApiBaseUrl || !publicAppKey) {
    return { ok: false, status: 500, message: "App configuration is missing" };
  }

  try {
    const res = await fetch(
      `${publicApiBaseUrl}/course/${courseSlug}/quizzes/${quizId}`,
      { headers: quizHeaders(accessToken), cache: "no-store" }
    );
    const json = await res.json().catch(() => ({}));

    if (await ifSessionReplaced(res, json)) {
      return { ok: false, status: 401, message: "Session expired" };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json.message || json.error || "Failed to load quiz",
      };
    }

    return { ok: true, quiz: json.data as StudentQuizDetail };
  } catch {
    return { ok: false, status: 500, message: "Failed to load quiz" };
  }
}

export async function fetchQuizQuestion(
  courseSlug: string,
  quizId: number,
  questionIndex: number,
  accessToken: string
): Promise<
  | { ok: true; data: QuizQuestionPageResponse }
  | { ok: false; status: number; message: string }
> {
  if (!publicApiBaseUrl || !publicAppKey) {
    return { ok: false, status: 500, message: "App configuration is missing" };
  }

  try {
    const res = await fetch(
      `${publicApiBaseUrl}/course/${courseSlug}/quizzes/${quizId}/questions/${questionIndex}`,
      { headers: quizHeaders(accessToken), cache: "no-store" }
    );
    const json = await res.json().catch(() => ({}));

    if (await ifSessionReplaced(res, json)) {
      return { ok: false, status: 401, message: "Session expired" };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json.message || json.error || "Failed to load question",
      };
    }

    return { ok: true, data: json.data as QuizQuestionPageResponse };
  } catch {
    return { ok: false, status: 500, message: "Failed to load question" };
  }
}

export async function postQuizSkip(
  courseSlug: string,
  quizId: number,
  accessToken: string
): Promise<
  | { ok: true; result: QuizSubmissionResult; message: string }
  | { ok: false; status: number; message: string }
> {
  if (!publicApiBaseUrl || !publicAppKey) {
    return { ok: false, status: 500, message: "App configuration is missing" };
  }

  try {
    const res = await fetch(
      `${publicApiBaseUrl}/course/${courseSlug}/quizzes/${quizId}/skip`,
      {
        method: "POST",
        headers: quizHeaders(accessToken),
      }
    );
    const json = await res.json().catch(() => ({}));

    if (await ifSessionReplaced(res, json)) {
      return { ok: false, status: 401, message: "Session expired" };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json.message || json.error || "Failed to skip quiz",
      };
    }

    return {
      ok: true,
      result: json.data as QuizSubmissionResult,
      message: json.message || "Quiz skipped",
    };
  } catch {
    return { ok: false, status: 500, message: "Failed to skip quiz" };
  }
}

export async function fetchQuizSubmissionDetail(
  submissionId: number,
  accessToken: string
): Promise<
  | { ok: true; result: QuizSubmissionResult }
  | { ok: false; status: number; message: string }
> {
  if (!publicApiBaseUrl || !publicAppKey) {
    return { ok: false, status: 500, message: "App configuration is missing" };
  }

  try {
    const res = await fetch(
      `${publicApiBaseUrl}/student/quiz-submissions/${submissionId}`,
      { headers: quizHeaders(accessToken), cache: "no-store" }
    );
    const json = await res.json().catch(() => ({}));

    if (await ifSessionReplaced(res, json)) {
      return { ok: false, status: 401, message: "Session expired" };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json.message || json.error || "Failed to load submission",
      };
    }

    return { ok: true, result: json.data as QuizSubmissionResult };
  } catch {
    return { ok: false, status: 500, message: "Failed to load submission" };
  }
}

export function quizPageToQuestion(data: QuizQuestionPageResponse): QuizQuestion {
  return {
    id: data.id,
    quiz_id: data.quiz_id,
    title: data.title,
    details: data.details,
    type: data.type,
    marks: data.marks,
    options: data.options,
    answer_explanation: null,
    answer_required: data.answer_required,
    media: data.media,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
