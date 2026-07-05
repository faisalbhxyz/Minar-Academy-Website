"use client";

import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import { formatQuizTimeLimit } from "@/lib/quizHelpers";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";
import { Clock, ListChecks } from "lucide-react";
import QuizQuestionField from "./QuizQuestionField";
import QuizResultView from "./QuizResultView";

type AnswerMap = Record<number, string | boolean | string[]>;

interface Props {
  courseSlug: string;
  quiz: StudentQuizDetail;
  accessToken: string;
}

export default function QuizAttemptForm({
  courseSlug,
  quiz: initialQuiz,
  accessToken,
}: Props) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(initialQuiz);
  const [phase, setPhase] = useState<"intro" | "attempt" | "result">("intro");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const submittingRef = useRef(false);

  const questions = quiz.questions ?? [];
  const singleView = quiz.single_quiz_view;
  const visibleQuestions = singleView
    ? questions.slice(currentIndex, currentIndex + 1)
    : questions;

  const timeLimitSeconds = useMemo(() => {
    if (!quiz.time_limit) return null;
    const multipliers: Record<string, number> = {
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
      months: 2592000,
    };
    return quiz.time_limit * (multipliers[quiz.time_limit_option] ?? 60);
  }, [quiz.time_limit, quiz.time_limit_option]);

  const setAnswer = (questionId: number, value: string | boolean | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateAnswers = (): boolean => {
    const required = questions.filter((q) => q.answer_required);
    for (const question of required) {
      const value = answers[question.id];
      if (value === undefined || value === null) {
        toast.error(`Please answer: ${question.title}`);
        if (singleView) {
          const idx = questions.findIndex((q) => q.id === question.id);
          if (idx >= 0) setCurrentIndex(idx);
        }
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

    const payload: QuizAnswerPayload[] = questions
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

      if (!res.ok) {
        toast.error(json.message || json.error || "Failed to submit quiz");
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
    if (phase !== "attempt" || !timeLimitSeconds) return;

    setSecondsLeft(timeLimitSeconds);
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
  }, [phase, timeLimitSeconds, handleTimeUp]);

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setQuiz((prev) => ({
      ...prev,
      attempts_used: prev.attempts_used + 1,
      can_retry:
        prev.enable_retry &&
        prev.attempts_used + 1 < (prev.retry_attempts || 1),
    }));
    setPhase("intro");
  };

  if (phase === "result" && result) {
    return (
      <QuizResultView
        result={result}
        canRetry={quiz.can_retry}
        onRetry={handleRetry}
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
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
          {quiz.time_limit > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatQuizTimeLimit(quiz.time_limit, quiz.time_limit_option)}
            </span>
          )}
          <span>
            Pass mark: {quiz.minimum_pass_percentage}%
          </span>
          {quiz.attempts_used > 0 && (
            <span>Attempts used: {quiz.attempts_used}</span>
          )}
        </div>

        {!quiz.can_retry && quiz.attempts_used > 0 ? (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            Maximum attempts reached. You cannot retake this quiz.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setPhase("attempt")}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            {quiz.attempts_used > 0 ? "Retake quiz" : "Start quiz"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div>
          <h2 className="font-semibold text-gray-900">{quiz.title}</h2>
          {singleView && (
            <p className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
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
            {formatTimer(secondsLeft)}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {visibleQuestions.map((question, idx) => (
          <QuizQuestionField
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => setAnswer(question.id, value as string | boolean | string[])}
            questionNumber={singleView ? currentIndex + 1 : idx + 1}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {singleView ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
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

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
