"use client";

import {
  fetchQuizQuestion,
  fetchStudentQuiz,
  postQuizSkip,
  quizPageToQuestion,
} from "@/lib/quizClient";
import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import {
  getQuizQuestionCount,
  isSingleQuizDisplay,
  quizTimeLimitToSeconds,
  formatQuizAttemptsAllowed,
} from "@/lib/quizHelpers";
import { syncCourseProgressAfterQuiz } from "@/lib/courseProgressApi";
import { ifSessionReplaced } from "@/lib/sessionReplaced";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";
import QuizIntroCard from "./QuizIntroCard";
import QuizQuestionField from "./QuizQuestionField";
import QuizResultView from "./QuizResultView";
import QuizTimerRing from "./QuizTimerRing";

type AnswerMap = Record<number, string | boolean | string[]>;
type QuestionCache = Record<number, QuizQuestion>;

interface Props {
  courseSlug: string;
  quiz: StudentQuizDetail;
  accessToken: string;
  latestSubmission?: QuizSubmissionRecord;
  returnTo?: "course" | "quizzes";
}

export default function QuizAttemptForm({
  courseSlug,
  quiz: initialQuiz,
  accessToken,
  latestSubmission,
  returnTo = "quizzes",
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
  const [skippingQuiz, setSkippingQuiz] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
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

    const limitSeconds = quizTimeLimitToSeconds(
      nextQuiz.time_limit,
      nextQuiz.time_limit_option
    );
    const remaining =
      nextQuiz.seconds_remaining != null ? nextQuiz.seconds_remaining : null;

    setSecondsLeft(remaining);
    setTotalTimeSeconds(
      remaining != null && limitSeconds > 0
        ? Math.max(remaining, limitSeconds)
        : limitSeconds > 0
          ? limitSeconds
          : remaining ?? 0
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

  const validateCurrentQuestion = (question: QuizQuestion): boolean => {
    if (!question.answer_required) return true;

    const value = answers[question.id];
    if (value === undefined || value === null) {
      toast.error(`Please answer: ${question.title}`);
      return false;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      toast.error(`Please answer: ${question.title}`);
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      toast.error(`Please select at least one option for: ${question.title}`);
      return false;
    }
    return true;
  };

  const validateAnswers = (): boolean => {
    const toValidate =
      allQuestions.length > 0 ? allQuestions : (quiz.questions ?? []);
    for (const question of toValidate.filter((q) => q.answer_required)) {
      const value = answers[question.id];
      if (value === undefined || value === null) {
        toast.error(`Please answer: ${question.title}`);
        return false;
      }
      if (typeof value === "string" && value.trim().length === 0) {
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

  const buildSubmitPayload = (): QuizAnswerPayload[] => {
    const knownQuestionIds = new Set(
      (allQuestions.length > 0 ? allQuestions : (quiz.questions ?? [])).map(
        (question) => question.id
      )
    );

    return Object.entries(answers)
      .filter(([questionId, value]) => {
        if (!knownQuestionIds.has(Number(questionId))) return false;
        if (value === undefined || value === null) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      })
      .map(([questionId, value]) => ({
        question_id: Number(questionId),
        value:
          typeof value === "string"
            ? value.trim()
            : (value as string | boolean | string[]),
      }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submittingRef.current) return;
    if (!autoSubmit && !validateAnswers()) return;

    if (!publicApiBaseUrl || !publicAppKey) {
      toast.error("App configuration is missing");
      return;
    }

    const payload = buildSubmitPayload();

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
      void syncCourseProgressAfterQuiz(courseSlug, accessToken);
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

  const handleSubmitAndNext = async () => {
    if (singleView) {
      const question = questionCache[currentIndex];
      if (question && !validateCurrentQuestion(question)) return;

      if (currentIndex < totalQuestions - 1) {
        await loadQuestionAtIndex(currentIndex + 1);
        return;
      }
    }

    await handleSubmit();
  };

  const handleSkipQuestion = async () => {
    if (singleView && currentIndex < totalQuestions - 1) {
      await loadQuestionAtIndex(currentIndex + 1);
      return;
    }

    await handleSubmit(true);
  };

  const handleSkipQuiz = async () => {
    if (skippingQuiz) return;

    setSkippingQuiz(true);
    try {
      const res = await postQuizSkip(courseSlug, quiz.id, accessToken);
      if (!res.ok) {
        toast.error(res.message);
        if (res.status === 400 || res.status === 403) {
          router.refresh();
        }
        return;
      }

      await syncCourseProgressAfterQuiz(courseSlug, accessToken);
      toast.success(res.message);

      if (returnTo === "course") {
        router.push(`/user/course/${courseSlug}`);
        router.refresh();
        return;
      }

      setResult(res.result);
      setPhase("result");
      router.refresh();
    } finally {
      setSkippingQuiz(false);
    }
  };

  if (phase === "result" && result) {
    return (
      <QuizResultView
        result={result}
        quiz={quiz}
        accessToken={accessToken}
        canRetry={quiz.can_retry}
        onRetry={handleRetry}
        retrying={refreshingQuiz}
        courseSlug={courseSlug}
        returnTo={returnTo}
      />
    );
  }

  if (phase === "intro") {
    return (
      <QuizIntroCard
        quiz={quiz}
        totalQuestions={totalQuestions}
        latestSubmission={latestSubmission}
        onStart={() => void handleStartAttempt()}
        onSkip={() => void handleSkipQuiz()}
        starting={refreshingQuiz}
        skipping={skippingQuiz}
      />
    );
  }

  const activeQuestion = singleView ? questionCache[currentIndex] : undefined;
  const isLastQuestion = singleView && currentIndex >= totalQuestions - 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {singleView && (
            <span>
              Questions No:{" "}
              <span className="font-medium text-gray-900">
                {currentIndex + 1}/{totalQuestions}
              </span>
            </span>
          )}
          <span>
            Attempts Allowed:{" "}
            <span className="font-medium text-gray-900">
              {formatQuizAttemptsAllowed(quiz)}
            </span>
          </span>
        </div>

        {secondsLeft !== null && (
          <QuizTimerRing
            secondsLeft={secondsLeft}
            totalSeconds={totalTimeSeconds}
          />
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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {singleView ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0 || loadingQuestion || submitting}
                onClick={() => void loadQuestionAtIndex(currentIndex - 1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                disabled={submitting || loadingQuestion}
                onClick={() => void handleSubmitAndNext()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {submitting && <LuLoaderCircle className="animate-spin w-4 h-4" />}
                {isLastQuestion ? "Submit Quiz" : "Submit & Next"}
              </button>
            </div>
            <button
              type="button"
              disabled={submitting || loadingQuestion}
              onClick={() => void handleSkipQuestion()}
              className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50 transition"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {submitting && <LuLoaderCircle className="animate-spin w-4 h-4" />}
            {submitting ? "Submitting..." : "Submit Quiz"}
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
