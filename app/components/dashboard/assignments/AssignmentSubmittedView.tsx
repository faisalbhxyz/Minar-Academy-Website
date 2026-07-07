"use client";

import AssignmentSubmitForm from "@/app/components/dashboard/assignments/AssignmentSubmitForm";
import {
  formatFileSize,
  formatSubmissionDateTime,
  getAssignmentResultClasses,
  getAssignmentResultLabel,
  isAssignmentResponseEmpty,
} from "@/lib/assignmentHelpers";
import { CloudDownload } from "lucide-react";
import { useState } from "react";

interface UploadPolicy {
  maxFileSizeBytes: number;
  allowedMimeTypes?: string[];
  maxResponseTextLength: number;
}

interface Props {
  assignment: StudentAssignmentDetail;
  courseSlug: string;
  accessToken: string;
  uploadPolicy: UploadPolicy;
}

export default function AssignmentSubmittedView({
  assignment,
  courseSlug,
  accessToken,
  uploadPolicy,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const submission = assignment.submission;

  if (!submission) return null;

  const files = submission.files ?? [];
  const responseText = submission.response_text?.trim() ?? "";
  const canEdit = assignment.can_edit;

  if (isEditing && canEdit) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit your assignment
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your answer or upload new files. If you do not upload new
            files, your existing attachments will be kept.
          </p>
          <div className="mt-5">
            <AssignmentSubmitForm
              courseSlug={courseSlug}
              assignmentId={assignment.id}
              fileUploadLimit={assignment.file_upload_limit}
              accessToken={accessToken}
              initialResponseText={responseText}
              existingFiles={files}
              isResubmit
              submitLabel="Update assignment"
              maxFileSizeBytes={uploadPolicy.maxFileSizeBytes}
              allowedMimeTypes={uploadPolicy.allowedMimeTypes}
              maxResponseTextLength={uploadPolicy.maxResponseTextLength}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          </div>
        </section>

        {assignment.instructions && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: assignment.instructions }}
            />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Total Marks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Pass Marks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Earned Marks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-4 py-4 text-gray-900">
                {formatSubmissionDateTime(submission.submitted_at)}
              </td>
              <td className="px-4 py-4 text-gray-900">
                {assignment.total_marks}
              </td>
              <td className="px-4 py-4 text-gray-900">
                {assignment.minimum_pass_marks}
              </td>
              <td className="px-4 py-4 text-gray-900">
                {submission.status === "graded" ? submission.score : "—"}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getAssignmentResultClasses(submission)}`}
                >
                  {getAssignmentResultLabel(submission)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Assignment
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Edit
            </button>
          )}
        </div>

        {responseText && !isAssignmentResponseEmpty(responseText) ? (
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: responseText }}
          />
        ) : (
          <p className="text-sm text-gray-500 italic">No written response.</p>
        )}

        {files.length > 0 && (
          <ul className="mt-5 space-y-3">
            {files.map((file) => (
              <li
                key={file.id ?? file.url}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.file_name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Size: {formatFileSize(file.size)}
                  </p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
                  aria-label={`Download ${file.file_name}`}
                >
                  <CloudDownload className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {assignment.instructions && (
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: assignment.instructions }}
          />
        </section>
      )}
    </div>
  );
}
