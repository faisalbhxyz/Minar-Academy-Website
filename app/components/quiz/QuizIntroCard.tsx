"use client";

import {
  formatQuizAttemptsLabel,
  formatQuizTimeLimitLabel,
  getQuizMaxAttempts,
  getQuizPassClasses,
} from "@/lib/quizHelpers";
import { LuLoaderCircle } from "react-icons/lu";

interface Props {
  quiz: StudentQuizDetail;
  totalQuestions: number;
  latestSubmission?: QuizSubmissionRecord;
  onStart: () => void;
  onSkip: () => void;
  starting: boolean;
  skipping?: boolean;
}

export default function QuizIntroCard({
  quiz,
  totalQuestions,
  latestSubmission,
  onStart,
  onSkip,
  starting,
  skipping = false,
}: Props) {
  const maxAttempts = getQuizMaxAttempts(quiz);
  const canStart = quiz.can_retry || quiz.attempts_used === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
      <p className="text-sm text-gray-500 mb-2">Quiz</p>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        {quiz.title}
      </h1>

      {quiz.instructions ? (
        <div
          className="mt-4 text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: quiz.instructions }}
        />
      ) : (
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          Answer this quiz to test your understanding of the topic.
        </p>
      )}

      <hr className="my-6 border-gray-200" />

      <dl className="space-y-2 text-sm text-gray-600">
        <div>
          <span>Questions: </span>
          <span className="text-gray-800">{totalQuestions}</span>
        </div>
        {quiz.time_limit > 0 && (
          <div>
            <span>Quiz Time: </span>
            <span className="text-gray-800">
              {formatQuizTimeLimitLabel(quiz.time_limit, quiz.time_limit_option)}
            </span>
          </div>
        )}
        <div>
          <span>Total Attempted: </span>
          <span className="text-gray-800">
            {formatQuizAttemptsLabel(quiz.attempts_used, maxAttempts)}
          </span>
        </div>
        <div>
          <span>Passing Grade: </span>
          <span className="text-gray-800">({quiz.minimum_pass_percentage}%)</span>
        </div>
      </dl>

      {latestSubmission && !quiz.can_retry && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm space-y-2">
          <p className="font-medium text-gray-900">Your latest result</p>
          <p className="text-gray-700">
            Score: {latestSubmission.score}/{latestSubmission.max_score} (
            {latestSubmission.percentage}%) —{" "}
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${getQuizPassClasses(latestSubmission.passed)}`}
            >
              {latestSubmission.passed ? "Passed" : "Failed"}
            </span>
          </p>
          {latestSubmission.status === "pending_review" && (
            <p className="text-amber-700">Some answers are under review.</p>
          )}
        </div>
      )}

      {canStart ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={starting}
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition disabled:opacity-60"
          >
            {starting && <LuLoaderCircle className="animate-spin w-4 h-4" />}
            {quiz.attempts_used > 0 ? "Retake Quiz" : "Start Quiz"}
          </button>
          <button
            type="button"
            disabled={starting || skipping}
            onClick={onSkip}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition disabled:opacity-60"
          >
            {skipping && <LuLoaderCircle className="animate-spin w-4 h-4" />}
            Skip Quiz
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          Maximum attempts reached. You cannot retake this quiz.
        </p>
      )}
    </div>
  );
}
