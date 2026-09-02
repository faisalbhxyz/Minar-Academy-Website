import { getStudentLearningReport } from "@/app/actions";
import InProgressCourseCard from "@/app/components/dashboard/new/InProgressCourseCard";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function EnrolledCoursesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { items } = await getStudentLearningReport(session);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Enrolled Courses</h1>
        <p className="text-gray-600 mt-1">
          আপনারে যে কোর্সগুলোতে এনরোল করেছেন সেগুলো এখানে দেখুন।
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-700 font-medium">No enrolled courses yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse our courses and enroll to start learning.
          </p>
          <Link
            href="/courses/all"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ enrollment, progress }) =>
            enrollment.course ? (
              <InProgressCourseCard
                key={enrollment.id}
                course={enrollment.course}
                progress={progress}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
