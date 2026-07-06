"use client";

import { formatDate } from "@/lib/helpers";
import { getQuizPassClasses } from "@/lib/quizHelpers";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { LuLoaderCircle } from "react-icons/lu";

interface Props {
  result: QuizSubmissionResult;
  onRetry?: () => void;
  canRetry?: boolean;
  retrying?: boolean;
}

export default function QuizResultView({
  result,
  onRetry,
  canRetry,
  retrying,
}: Props) {
  const passLabel = result.passed ? "Passed" : "Failed";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 ${getQuizPassClasses(result.passed)}`}
        >
          {result.passed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {passLabel}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          You scored {result.score}/{result.max_score}
        </h2>
        <p className="text-3xl font-bold text-blue-600 mb-2">
          {result.percentage}%
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
          <span>{result.quiz_title}</span>
          <span>•</span>
          <span>Attempt {result.attempt_number}</span>
          <span>•</span>
          <span>{formatDate(result.submitted_at)}</span>
        </div>

        {result.status === "pending_review" && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <HelpCircle className="w-4 h-4" />
            Some answers are under review. Your final score may change.
          </p>
        )}
      </div>

      {result.reveal_answers && result.answers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Answer review</h3>
          {result.answers.map((answer, index) => (
            <div
              key={answer.question_id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-medium text-gray-900">
                  <span className="text-blue-600 mr-2">Q{index + 1}.</span>
                  {answer.question_title}
                </h4>
                <div className="flex items-center gap-2 shrink-0">
                  {answer.is_correct === true && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {answer.is_correct === false && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {answer.is_correct === null && (
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-xs font-medium text-gray-500">
                    {answer.marks_awarded} mark
                    {answer.marks_awarded === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="text-sm space-y-2">
                <p className="text-gray-600">
                  Your answer:{" "}
                  <span className="font-medium text-gray-900">
                    {formatAnswer(answer.submitted_answer)}
                  </span>
                </p>

                {answer.correct_answer && (
                  <p className="text-gray-600">
                    Correct answer:{" "}
                    <span className="font-medium text-green-700">
                      {formatCorrectAnswer(answer.correct_answer)}
                    </span>
                  </p>
                )}

                {answer.answer_explanation && (
                  <div
                    className="mt-2 p-3 bg-blue-50 rounded-lg text-gray-700 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: answer.answer_explanation,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
          >
            {retrying && <LuLoaderCircle className="animate-spin w-4 h-4" />}
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

function formatAnswer(value: string | boolean | string[]): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

function formatCorrectAnswer(
  correct: { value: string | boolean } | { values: string[] }
): string {
  if ("values" in correct) return correct.values.join(", ");
  if (typeof correct.value === "boolean") {
    return correct.value ? "True" : "False";
  }
  return String(correct.value);
}
