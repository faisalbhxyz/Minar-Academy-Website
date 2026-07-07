"use client";

import { formatSubmissionDateTime } from "@/lib/assignmentHelpers";
import { fetchQuizSubmissionDetail } from "@/lib/quizClient";
import {
  formatQuizMarks,
  formatQuizTimeLimitLabel,
  getQuizAttemptResultClasses,
  getQuizAttemptResultLabel,
  getQuizResultDisplayStats,
} from "@/lib/quizHelpers";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";

interface Props {
  result: QuizSubmissionResult;
  quiz: StudentQuizDetail;
  accessToken: string;
  onRetry?: () => void;
  canRetry?: boolean;
  retrying?: boolean;
  courseSlug?: string;
  returnTo?: "course" | "quizzes";
  autoOpenDetails?: boolean;
  skipInitialDetailFetch?: boolean;
}

export default function QuizResultView({
  result: initialResult,
  quiz,
  accessToken,
  onRetry,
  canRetry,
  retrying,
  courseSlug,
  returnTo = "quizzes",
  autoOpenDetails = false,
  skipInitialDetailFetch = false,
}: Props) {
  const [result, setResult] = useState(initialResult);
  const [detailsOpen, setDetailsOpen] = useState(autoOpenDetails);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsLoaded, setDetailsLoaded] = useState(skipInitialDetailFetch);

  const { questionCount, correct, incorrect, passingMarks } =
    getQuizResultDisplayStats(result, quiz);

  const loadSubmissionDetail = useCallback(async () => {
    if (loadingDetails || detailsLoaded) return;

    setLoadingDetails(true);
    try {
      const res = await fetchQuizSubmissionDetail(result.id, accessToken);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }

      setResult(res.result);
      setDetailsLoaded(true);
    } finally {
      setLoadingDetails(false);
    }
  }, [accessToken, detailsLoaded, loadingDetails, result.id]);

  useEffect(() => {
    if (autoOpenDetails && !skipInitialDetailFetch) {
      void loadSubmissionDetail();
    }
  }, [autoOpenDetails, loadSubmissionDetail, skipInitialDetailFetch]);

  const handleToggleDetails = () => {
    const nextOpen = !detailsOpen;
    setDetailsOpen(nextOpen);
    if (nextOpen) {
      void loadSubmissionDetail();
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Quiz</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {result.quiz_title}
        </h1>
      </div>

      <div className="border-y border-gray-200 py-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-gray-600">
          <div>
            <dt className="mb-1">Questions:</dt>
            <dd className="font-medium text-gray-900">{questionCount}</dd>
          </div>
          {quiz.time_limit > 0 && (
            <div>
              <dt className="mb-1">Quiz Time:</dt>
              <dd className="font-medium text-gray-900">
                {formatQuizTimeLimitLabel(
                  quiz.time_limit,
                  quiz.time_limit_option
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="mb-1">Total Marks:</dt>
            <dd className="font-medium text-gray-900">
              {formatQuizMarks(result.score)}/{formatQuizMarks(result.max_score)}
            </dd>
          </div>
          <div>
            <dt className="mb-1">Passing Marks:</dt>
            <dd className="font-medium text-gray-900">
              {formatQuizMarks(passingMarks)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 font-medium text-gray-700">Question</th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Total Marks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Correct Answer
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Incorrect Answer
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Earned Marks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">Result</th>
              <th className="px-4 py-3 font-medium text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-4 py-4 text-gray-900">
                {formatSubmissionDateTime(result.submitted_at)}
              </td>
              <td className="px-4 py-4 text-gray-900">{questionCount}</td>
              <td className="px-4 py-4 text-gray-900">
                {formatQuizMarks(result.max_score)}
              </td>
              <td className="px-4 py-4 text-gray-900">{correct}</td>
              <td className="px-4 py-4 text-gray-900">{incorrect}</td>
              <td className="px-4 py-4 text-gray-900">
                {formatQuizMarks(result.score)} ({result.percentage}%)
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getQuizAttemptResultClasses(result)}`}
                >
                  {getQuizAttemptResultLabel(result)}
                </span>
              </td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={handleToggleDetails}
                  disabled={loadingDetails}
                  className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition disabled:opacity-60"
                >
                  {loadingDetails && (
                    <LuLoaderCircle className="animate-spin w-3.5 h-3.5" />
                  )}
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {result.instructor_feedback && !detailsOpen && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">
            Instructor Feedback
          </h4>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: result.instructor_feedback,
            }}
          />
        </div>
      )}

      {detailsOpen && (
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Attempt details
          </h3>

          {loadingDetails ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <LuLoaderCircle className="animate-spin w-4 h-4" />
              Loading attempt details...
            </div>
          ) : result.answers.length === 0 ? (
            <p className="text-sm text-gray-600">
              No answer breakdown is available for this attempt.
            </p>
          ) : (
            result.answers.map((answer, index) => (
              <div
                key={answer.question_id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
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

                  {result.reveal_answers && answer.correct_answer && (
                    <p className="text-gray-600">
                      Correct answer:{" "}
                      <span className="font-medium text-green-700">
                        {formatCorrectAnswer(answer.correct_answer)}
                      </span>
                    </p>
                  )}

                  {result.reveal_answers && answer.answer_explanation && (
                    <div
                      className="mt-2 rounded-lg bg-white p-3 text-sm text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: answer.answer_explanation,
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}

          {result.instructor_feedback && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">
                Instructor Feedback
              </h4>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: result.instructor_feedback,
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        {courseSlug && returnTo === "course" && (
          <Link
            href={`/user/course/${courseSlug}`}
            className="inline-flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Back to course
          </Link>
        )}
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
