import {
  formatAssignmentTimeLimit,
  getAssignmentStatusClasses,
  getAssignmentStatusLabel,
} from "@/lib/assignmentHelpers";
import { formatDate } from "@/lib/helpers";
import { Download, FileText } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssignmentSubmissionStatus({
  assignment,
  submissionRecord,
}: {
  assignment: StudentAssignmentDetail;
  submissionRecord?: AssignmentSubmissionRecord | null;
}) {
  const submission = assignment.submission;
  if (!submission) return null;

  const files = submissionRecord?.files ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Your submission</h2>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${getAssignmentStatusClasses(submission.status)}`}
        >
          {getAssignmentStatusLabel(submission.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Submitted on</p>
          <p className="font-medium text-gray-900">
            {formatDate(submission.submitted_at)}
          </p>
        </div>
        {submission.status === "graded" && (
          <>
            <div>
              <p className="text-gray-500">Score</p>
              <p className="font-medium text-gray-900">
                {submission.score}/{submission.max_score} ({submission.percentage}%)
              </p>
            </div>
            <div>
              <p className="text-gray-500">Result</p>
              <p
                className={`font-medium ${submission.passed ? "text-green-700" : "text-red-700"}`}
              >
                {submission.passed ? "Passed" : "Not passed"}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-gray-500">Time limit</p>
          <p className="font-medium text-gray-900">
            {formatAssignmentTimeLimit(
              assignment.time_limit,
              assignment.time_limit_option
            )}
          </p>
        </div>
      </div>

      {submissionRecord?.response_text && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Your response</p>
          <div
            className="prose prose-sm max-w-none bg-white border border-gray-200 rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: submissionRecord.response_text }}
          />
        </div>
      )}

      {files.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded files</p>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id ?? file.url}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submission.status === "pending_review" && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Your assignment is waiting for instructor review. You will see your
          grade here once it is graded.
        </p>
      )}
    </div>
  );
}
