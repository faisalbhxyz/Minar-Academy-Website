"use client";

import {
  fetchQuizQuestion,
  fetchStudentQuiz,
  quizPageToQuestion,
} from "@/lib/quizClient";
import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import {
  formatQuizTimeLimit,
  formatQuizTimer,
  getQuizQuestionCount,
  isSingleQuizDisplay,
} from "@/lib/quizHelpers";
import { ifSessionReplaced } from "@/lib/sessionReplaced";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";
import { Clock, ListChecks } from "lucide-react";
import QuizQuestionField from "./QuizQuestionField";
import QuizResultView from "./QuizResultView";

type AnswerMap = Record<number, string | boolean | string[]>;
type QuestionCache = Record<number, QuizQuestion>;

interface Props {
  courseSlug: string;
  quiz: StudentQuizDetail;
  accessToken: string;
  latestSubmission?: QuizSubmissionRecord;
}

export default function QuizAttemptForm({
  courseSlug,
  quiz: initialQuiz,
  accessToken,
  latestSubmission,
}: Props) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(initialQuiz);
  const [phase, setPhase] = useState<"intro" | "attempt" | "result">("intro");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(
    initialQuiz.current_question_index ?? 0
  );
  const [questionCache, setQuestionCache] = useState<QuestionCache>(() =>
    seedQuestionCache(initialQuiz)
  );
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [refreshingQuiz, setRefreshingQuiz] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const submittingRef = useRef(false);
  const questionCacheRef = useRef<QuestionCache>(seedQuestionCache(initialQuiz));

  const singleView = isSingleQuizDisplay(quiz);
  const totalQuestions = getQuizQuestionCount(quiz);
  const allQuestions = singleView
    ? collectCachedQuestions(questionCache, totalQuestions)
    : (quiz.questions ?? []);

  const applyQuizSession = useCallback((nextQuiz: StudentQuizDetail) => {
    setQuiz(nextQuiz);
    const cache = seedQuestionCache(nextQuiz);
    questionCacheRef.current = cache;
    setQuestionCache(cache);
    setCurrentIndex(nextQuiz.current_question_index ?? 0);
    setSecondsLeft(
      nextQuiz.seconds_remaining != null ? nextQuiz.seconds_remaining : null
    );
  }, []);

  const loadQuestionAtIndex = useCallback(
    async (index: number): Promise<boolean> => {
      if (!singleView) {
        setCurrentIndex(index);
        return true;
      }

      if (questionCacheRef.current[index]) {
        setCurrentIndex(index);
        return true;
      }

      setLoadingQuestion(true);
      try {
        const res = await fetchQuizQuestion(
          courseSlug,
          quiz.id,
          index,
          accessToken
        );
        if (!res.ok) {
          toast.error(res.message);
          if (res.message.toLowerCase().includes("time limit exceeded")) {
            router.refresh();
          }
          return false;
        }

        const question = quizPageToQuestion(res.data);
        questionCacheRef.current = {
          ...questionCacheRef.current,
          [index]: question,
        };
        setQuestionCache((prev) => ({ ...prev, [index]: question }));
        setCurrentIndex(index);
        if (res.data.seconds_remaining != null) {
          setSecondsLeft(res.data.seconds_remaining);
        }
        return true;
      } finally {
        setLoadingQuestion(false);
      }
    },
    [singleView, courseSlug, quiz.id, accessToken, router]
  );

  const setAnswer = (questionId: number, value: string | boolean | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateAnswers = (): boolean => {
    const toValidate = allQuestions.length > 0 ? allQuestions : quiz.questions ?? [];
    for (const question of toValidate.filter((q) => q.answer_required)) {
      const value = answers[question.id];
      if (value === undefined || value === null) {
        toast.error(`Please answer: ${question.title}`);
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        toast.error(`Please select at least one option for: ${question.title}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submittingRef.current) return;
    if (!autoSubmit && !validateAnswers()) return;

    if (!publicApiBaseUrl || !publicAppKey) {
      toast.error("App configuration is missing");
      return;
    }

    const knownQuestions =
      allQuestions.length > 0 ? allQuestions : (quiz.questions ?? []);

    const payload: QuizAnswerPayload[] = knownQuestions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        question_id: q.id,
        value: answers[q.id],
      }));

    if (payload.length === 0 && !autoSubmit) {
      toast.error("Please answer at least one question");
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;

    try {
      const res = await fetch(
        `${publicApiBaseUrl}/course/${courseSlug}/quizzes/${quiz.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "app-key": publicAppKey,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ answers: payload }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (await ifSessionReplaced(res, json)) return;

      if (!res.ok) {
        const message = json.message || json.error || "Failed to submit quiz";
        if (message.toLowerCase().includes("time limit exceeded")) {
          toast.error(
            "Time limit exceeded. Please refresh the page to see your result."
          );
          router.refresh();
        } else {
          toast.error(message);
        }
        return;
      }

      setResult(json.data);
      setPhase("result");
      toast.success(json.message || "Quiz submitted successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    toast.info("Time is up. Submitting your quiz...");
    void handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, quiz.id, courseSlug, accessToken]);

  useEffect(() => {
    if (phase !== "attempt" || secondsLeft === null) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // secondsLeft intentionally omitted — timer should not restart on each tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, handleTimeUp]);

  const handleStartAttempt = async () => {
    setRefreshingQuiz(true);
    try {
      const fresh = await fetchStudentQuiz(courseSlug, quiz.id, accessToken);
      if (!fresh.ok) {
        toast.error(fresh.message);
        if (fresh.status === 400 || fresh.status === 403) {
          router.refresh();
        }
        return;
      }

      applyQuizSession(fresh.quiz);
      setAnswers({});
      setPhase("attempt");
    } finally {
      setRefreshingQuiz(false);
    }
  };

  const handleRetry = async () => {
    setRefreshingQuiz(true);
    try {
      const fresh = await fetchStudentQuiz(courseSlug, quiz.id, accessToken);
      if (!fresh.ok) {
        toast.error(fresh.message);
        router.refresh();
        return;
      }

      if (!fresh.quiz.can_retry) {
        toast.error("Maximum attempts reached. You cannot retake this quiz.");
        applyQuizSession(fresh.quiz);
        setPhase("intro");
        return;
      }

      applyQuizSession(fresh.quiz);
      setAnswers({});
      setResult(null);
      setPhase("intro");
    } finally {
      setRefreshingQuiz(false);
    }
  };

  if (phase === "result" && result) {
    return (
      <QuizResultView
        result={result}
        canRetry={quiz.can_retry}
        onRetry={handleRetry}
        retrying={refreshingQuiz}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {quiz.instructions && (
            <div
              className="mt-3 text-gray-600 text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: quiz.instructions }}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="w-4 h-4" />
            {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
          </span>
          {quiz.time_limit > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatQuizTimeLimit(quiz.time_limit, quiz.time_limit_option)}
            </span>
          )}
          <span>Pass mark: {quiz.minimum_pass_percentage}%</span>
          {quiz.attempts_used > 0 && (
            <span>Attempts used: {quiz.attempts_used}</span>
          )}
          {quiz.attempt_number != null && quiz.attempt_number > 0 && (
            <span>Current attempt: {quiz.attempt_number}</span>
          )}
        </div>

        {latestSubmission && !quiz.can_retry && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm space-y-2">
            <p className="font-medium text-gray-900">Your latest result</p>
            <p className="text-gray-700">
              Score: {latestSubmission.score}/{latestSubmission.max_score} (
              {latestSubmission.percentage}%) —{" "}
              {latestSubmission.passed ? "Passed" : "Failed"}
            </p>
            {latestSubmission.status === "pending_review" && (
              <p className="text-amber-700">Some answers are under review.</p>
            )}
          </div>
        )}

        {!quiz.can_retry && quiz.attempts_used > 0 ? (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            Maximum attempts reached. You cannot retake this quiz.
          </p>
        ) : (
          <button
            type="button"
            disabled={refreshingQuiz}
            onClick={() => void handleStartAttempt()}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
          >
            {refreshingQuiz && <LuLoaderCircle className="animate-spin" />}
            {quiz.attempts_used > 0 ? "Retake quiz" : "Start quiz"}
          </button>
        )}
      </div>
    );
  }

  const activeQuestion = singleView ? questionCache[currentIndex] : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div>
          <h2 className="font-semibold text-gray-900">{quiz.title}</h2>
          {singleView && (
            <p className="text-sm text-gray-500">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          )}
        </div>
        {secondsLeft !== null && (
          <div
            className={`text-sm font-mono font-semibold px-3 py-1 rounded-lg ${
              secondsLeft <= 60
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {formatQuizTimer(secondsLeft)}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {singleView ? (
          loadingQuestion && !activeQuestion ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <LuLoaderCircle className="animate-spin w-6 h-6 mr-2" />
              Loading question...
            </div>
          ) : activeQuestion ? (
            <QuizQuestionField
              key={activeQuestion.id}
              question={activeQuestion}
              value={answers[activeQuestion.id]}
              onChange={(value) =>
                setAnswer(
                  activeQuestion.id,
                  value as string | boolean | string[]
                )
              }
              questionNumber={currentIndex + 1}
            />
          ) : null
        ) : (
          (quiz.questions ?? []).map((question, idx) => (
            <QuizQuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) =>
                setAnswer(question.id, value as string | boolean | string[])
              }
              questionNumber={idx + 1}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {singleView ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0 || loadingQuestion}
              onClick={() => void loadQuestionAtIndex(currentIndex - 1)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                disabled={loadingQuestion}
                onClick={() => void loadQuestionAtIndex(currentIndex + 1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60"
              >
                {loadingQuestion && <LuLoaderCircle className="animate-spin" />}
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || loadingQuestion}
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting && <LuLoaderCircle className="animate-spin" />}
                Submit quiz
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting && <LuLoaderCircle className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit quiz"}
          </button>
        )}
      </div>
    </div>
  );
}

function seedQuestionCache(quiz: StudentQuizDetail): QuestionCache {
  const cache: QuestionCache = {};
  const questions = quiz.questions ?? [];
  if (questions.length === 0) return cache;

  if (isSingleQuizDisplay(quiz)) {
    const index = quiz.current_question_index ?? 0;
    cache[index] = questions[0];
  } else {
    questions.forEach((question, index) => {
      cache[index] = question;
    });
  }

  return cache;
}

function collectCachedQuestions(
  cache: QuestionCache,
  totalQuestions: number
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let index = 0; index < totalQuestions; index++) {
    const question = cache[index];
    if (question) questions.push(question);
  }
  return questions;
}
