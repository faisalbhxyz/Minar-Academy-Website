import {
  getStudentAssignment,
  getStudentAssignmentSubmission,
} from "@/app/actions";
import AssignmentMetaBar from "@/app/components/dashboard/assignments/AssignmentMetaBar";
import AssignmentSubmittedView from "@/app/components/dashboard/assignments/AssignmentSubmittedView";
import AssignmentSubmitForm from "@/app/components/dashboard/assignments/AssignmentSubmitForm";
import {
  formatAssignmentTimeLimit,
  formatFileSize,
  getAssignmentDeadlineSeconds,
  submissionNeedsDetailFallback,
} from "@/lib/assignmentHelpers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CloudDownload } from "lucide-react";

async function resolveAssignmentDetail(
  courseSlug: string,
  assignmentId: number,
  session: Session
): Promise<StudentAssignmentDetail | null> {
  const assignment = await getStudentAssignment(courseSlug, assignmentId, session);
  if (!assignment?.submission || !submissionNeedsDetailFallback(assignment.submission)) {
    return assignment;
  }

  const submissionDetail = await getStudentAssignmentSubmission(
    assignment.submission.id,
    session
  );
  if (!submissionDetail) return assignment;

  return {
    ...assignment,
    submission: {
      ...assignment.submission,
      response_text:
        submissionDetail.response_text ?? assignment.submission.response_text,
      files: submissionDetail.files ?? assignment.submission.files,
    },
  };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string; assignmentId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { courseSlug, assignmentId } = await params;
  const parsedAssignmentId = Number(assignmentId);

  if (!Number.isFinite(parsedAssignmentId)) {
    return (
      <div className="max-w-4xl">
        <p className="text-gray-700">Invalid assignment.</p>
      </div>
    );
  }

  const assignment = await resolveAssignmentDetail(
    courseSlug,
    parsedAssignmentId,
    session
  );

  if (!assignment) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link
          href="/user/dashboard/assignments"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to assignments
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="font-medium text-gray-900">Assignment not found</p>
          <p className="text-sm text-gray-600 mt-1">
            This assignment may be unpublished or you may not be enrolled in
            this course.
          </p>
        </div>
      </div>
    );
  }

  const attachments = assignment.attachments ?? [];
  const hasSubmitted = assignment.has_submitted && assignment.submission;
  const deadlineSeconds = getAssignmentDeadlineSeconds(assignment);
  const timerExpired =
    deadlineSeconds !== null && deadlineSeconds <= 0 && assignment.time_limit > 0;

  const uploadPolicy = {
    maxFileSizeBytes: assignment.max_file_size_bytes ?? 2 * 1024 * 1024,
    allowedMimeTypes: assignment.allowed_mime_types,
    maxResponseTextLength: assignment.max_response_text_length ?? 50000,
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/user/dashboard/assignments"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignments
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900">{assignment.title}</h1>

      {hasSubmitted ? (
        <AssignmentSubmittedView
          assignment={assignment}
          courseSlug={courseSlug}
          accessToken={session.accessToken}
          uploadPolicy={uploadPolicy}
        />
      ) : (
        <>
          <AssignmentMetaBar
            duration={formatAssignmentTimeLimit(
              assignment.time_limit,
              assignment.time_limit_option
            )}
            deadlineSeconds={deadlineSeconds}
            totalMarks={assignment.total_marks}
            passingMark={assignment.minimum_pass_marks}
          />

          {attachments.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Assignment materials
              </h2>
              <ul className="space-y-3">
                {attachments.map((file) => (
                  <li
                    key={file.url}
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
            </section>
          )}

          {assignment.can_submit ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <AssignmentSubmitForm
                courseSlug={courseSlug}
                assignmentId={assignment.id}
                fileUploadLimit={assignment.file_upload_limit}
                accessToken={session.accessToken}
                maxFileSizeBytes={uploadPolicy.maxFileSizeBytes}
                allowedMimeTypes={uploadPolicy.allowedMimeTypes}
                maxResponseTextLength={uploadPolicy.maxResponseTextLength}
              />
            </section>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
              {timerExpired
                ? "The assignment time limit has expired. You can no longer submit."
                : "This assignment is not available for submission right now."}
            </div>
          )}

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
        </>
      )}
    </div>
  );
}
