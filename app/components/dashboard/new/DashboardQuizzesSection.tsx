import Link from "next/link";
import {
  getStudentEnrollments,
  getStudentQuizSubmissions,
} from "@/app/actions";
import QuizCard from "@/app/components/dashboard/quizzes/QuizCard";
import { buildDashboardQuizzes } from "@/lib/quizHelpers";
import { auth } from "@/lib/auth";
import { ChevronRight } from "lucide-react";

export default async function DashboardQuizzesSection() {
  const session = await auth();
  if (!session) return null;

  const [enrollments, submissions] = await Promise.all([
    getStudentEnrollments(session),
    getStudentQuizSubmissions(session),
  ]);

  const quizzes = buildDashboardQuizzes(enrollments, submissions).slice(0, 3);

  if (quizzes.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">কুইজ</h2>
        <Link
          href="/user/dashboard/quizzes"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          সব দেখুন
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid gap-4">
        {quizzes.map((item) => (
          <QuizCard key={`${item.courseSlug}-${item.quiz.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
