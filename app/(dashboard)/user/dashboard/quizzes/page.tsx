import {
  getStudentEnrollments,
  getStudentQuizSubmissions,
} from "@/app/actions";
import QuizCard from "@/app/components/dashboard/quizzes/QuizCard";
import { auth } from "@/lib/auth";
import { buildDashboardQuizzes } from "@/lib/quizHelpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuizzesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [enrollments, submissions] = await Promise.all([
    getStudentEnrollments(session),
    getStudentQuizSubmissions(session),
  ]);

  const quizzes = buildDashboardQuizzes(enrollments, submissions);
  const quizSlugById = new Map(
    quizzes.map((item) => [item.quiz.id, item.courseSlug])
  );

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
        <h1 className="text-2xl font-bold text-gray-900">কুইজ</h1>
        <p className="text-gray-600 mt-1">
          আপনার এনরোল করা কোর্সের কুইজ দিন এবং ফলাফল দেখুন।
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          এখনো কোনো কুইজ নেই। আপনার এনরোল করা কোর্সে কুইজ যোগ হলে এখানে দেখা
          যাবে।
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((item) => (
            <QuizCard key={`${item.courseSlug}-${item.quiz.id}`} item={item} />
          ))}
        </div>
      )}

      {submissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            সাম্প্রতিক সাবমিশন
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Quiz</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((submission) => {
                  const courseSlug = quizSlugById.get(submission.quiz_id);
                  const href = courseSlug
                    ? `/user/dashboard/quizzes/${courseSlug}/${submission.quiz_id}`
                    : null;

                  return (
                    <tr key={submission.id} className="text-gray-800">
                      <td className="px-4 py-3 font-medium">
                        {href ? (
                          <Link
                            href={href}
                            className="text-blue-600 hover:underline"
                          >
                            {submission.quiz_title}
                          </Link>
                        ) : (
                          submission.quiz_title
                        )}
                      </td>
                    <td className="px-4 py-3">
                      {submission.score}/{submission.max_score} (
                      {submission.percentage}%)
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          submission.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(submission.submitted_at).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={
                          courseSlug
                            ? `/user/dashboard/quizzes/submissions/${submission.id}?courseSlug=${courseSlug}`
                            : `/user/dashboard/quizzes/submissions/${submission.id}`
                        }
                        className="inline-flex rounded-md border border-blue-600 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
