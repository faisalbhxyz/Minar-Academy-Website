import Link from "next/link";
import {
  formatQuizTimeLimit,
  getQuizPassClasses,
  getQuizStatusClasses,
  getQuizStatusLabel,
} from "@/lib/quizHelpers";
import { formatDate } from "@/lib/helpers";
import { ChevronRight, Clock, ListChecks, Trophy } from "lucide-react";

export default function QuizCard({ item }: { item: DashboardQuizItem }) {
  const { quiz, courseSlug, courseTitle, chapterTitle, latestSubmission } =
    item;
  const status = latestSubmission?.status ?? "not_attempted";

  return (
    <Link
      href={`/user/dashboard/quizzes/${courseSlug}/${quiz.id}`}
      className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{courseTitle}</p>
          <h3 className="text-base font-semibold text-gray-900">{quiz.title}</h3>
          <p className="text-sm text-gray-600">{chapterTitle}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${getQuizStatusClasses(status)}`}
        >
          {latestSubmission
            ? getQuizStatusLabel(latestSubmission.status)
            : "Not attempted"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="w-4 h-4" />
          {quiz.questions?.length ?? 0} questions
        </span>
        {quiz.time_limit > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatQuizTimeLimit(quiz.time_limit, quiz.time_limit_option)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="w-4 h-4" />
          Pass: {quiz.minimum_pass_percentage}%
        </span>
      </div>

      {latestSubmission && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-gray-600">
            Last attempt: {formatDate(latestSubmission.submitted_at)}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {latestSubmission.score}/{latestSubmission.max_score} (
              {latestSubmission.percentage}%)
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getQuizPassClasses(latestSubmission.passed)}`}
            >
              {latestSubmission.passed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600">
        {latestSubmission && quiz.enable_retry
          ? "View result / Retry"
          : latestSubmission
            ? "View result"
            : "Start quiz"}
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
