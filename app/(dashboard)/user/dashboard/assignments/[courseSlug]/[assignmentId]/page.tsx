import {
  getStudentAssignment,
  getStudentAssignmentSubmissions,
} from "@/app/actions";
import AssignmentSubmissionStatus from "@/app/components/dashboard/assignments/AssignmentSubmissionStatus";
import AssignmentSubmitForm from "@/app/components/dashboard/assignments/AssignmentSubmitForm";
import { formatAssignmentTimeLimit } from "@/lib/assignmentHelpers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock, Download, FileUp, Trophy } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <div className="max-w-3xl">
        <p className="text-gray-700">Invalid assignment.</p>
      </div>
    );
  }

  const [assignment, submissions] = await Promise.all([
    getStudentAssignment(courseSlug, parsedAssignmentId, session),
    getStudentAssignmentSubmissions(session),
  ]);

  if (!assignment) {
    return (
      <div className="max-w-3xl space-y-4">
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

  const submissionRecord =
    submissions.find((item) => item.assignment_id === assignment.id) ?? null;

  const attachments = assignment.attachments ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/user/dashboard/assignments"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignments
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{assignment.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatAssignmentTimeLimit(
              assignment.time_limit,
              assignment.time_limit_option
            )}
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
      </div>

      {assignment.instructions && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: assignment.instructions }}
          />
        </section>
      )}

      {attachments.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Assignment materials
          </h2>
          <ul className="space-y-2">
            {attachments.map((file) => (
              <li
                key={file.url}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {assignment.has_submitted && (
        <AssignmentSubmissionStatus
          assignment={assignment}
          submissionRecord={submissionRecord}
        />
      )}

      {assignment.can_submit && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Submit your work
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You can submit only once. Make sure your answer and files are ready
            before submitting.
          </p>
          <AssignmentSubmitForm
            courseSlug={courseSlug}
            assignmentId={assignment.id}
            fileUploadLimit={assignment.file_upload_limit}
            accessToken={session.accessToken}
          />
        </section>
      )}

      {assignment.has_submitted && !assignment.can_submit && !assignment.submission && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          This assignment has already been submitted.
        </div>
      )}
    </div>
  );
}
