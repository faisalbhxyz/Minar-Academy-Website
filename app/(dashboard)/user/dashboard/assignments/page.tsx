import {
  getEnrolledCoursesWithAssignments,
  getStudentAssignmentSubmissions,
} from "@/app/actions";
import AssignmentCard from "@/app/components/dashboard/assignments/AssignmentCard";
import { buildDashboardAssignments } from "@/lib/assignmentHelpers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [enrollments, submissions] = await Promise.all([
    getEnrolledCoursesWithAssignments(session),
    getStudentAssignmentSubmissions(session),
  ]);

  const assignments = buildDashboardAssignments(enrollments, submissions);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and submit assignments from your enrolled courses.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-700 font-medium">No assignments yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Assignments from your enrolled courses will appear here.
          </p>
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((item) => (
            <AssignmentCard
              key={`${item.courseSlug}-${item.assignment.id}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
