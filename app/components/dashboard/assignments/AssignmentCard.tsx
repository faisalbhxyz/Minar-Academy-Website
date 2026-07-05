import Link from "next/link";
import {
  formatAssignmentTimeLimit,
  getAssignmentStatusClasses,
  getAssignmentStatusLabel,
} from "@/lib/assignmentHelpers";
import { formatDate } from "@/lib/helpers";
import { ChevronRight, Clock, FileUp, Trophy } from "lucide-react";

export default function AssignmentCard({ item }: { item: DashboardAssignmentItem }) {
  const { assignment, courseSlug, courseTitle, chapterTitle, submission } = item;
  const status = submission?.status ?? "not_submitted";

  return (
    <Link
      href={`/user/dashboard/assignments/${courseSlug}/${assignment.id}`}
      className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{courseTitle}</p>
          <h3 className="text-base font-semibold text-gray-900">{assignment.title}</h3>
          <p className="text-sm text-gray-600">{chapterTitle}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${getAssignmentStatusClasses(status)}`}
        >
          {submission ? getAssignmentStatusLabel(submission.status) : "Not submitted"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {formatAssignmentTimeLimit(assignment.time_limit, assignment.time_limit_option)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="w-4 h-4" />
          {assignment.total_marks} marks (pass: {assignment.minimum_pass_marks})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileUp className="w-4 h-4" />
          Up to {assignment.file_upload_limit} files
        </span>
      </div>

      {submission && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Submitted on {formatDate(submission.submitted_at)}
          </span>
          {submission.status === "graded" && (
            <span className="font-medium text-gray-900">
              Score: {submission.score}/{submission.max_score}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600">
        {submission ? "View submission" : "Start assignment"}
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
