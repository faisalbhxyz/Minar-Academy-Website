import { getStudentQuiz } from "@/app/actions";
import QuizAttemptForm from "@/app/components/quiz/QuizAttemptForm";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ courseSlug: string; quizId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { courseSlug, quizId } = await params;
  const quiz = await getStudentQuiz(courseSlug, Number(quizId), session);

  if (!quiz) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-700 mb-4">
          Quiz not found or you are not enrolled in this course.
        </p>
        <Link
          href="/user/dashboard/quizzes"
          className="text-blue-600 hover:underline text-sm"
        >
          Back to quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Link
        href="/user/dashboard/quizzes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to quizzes
      </Link>

      <QuizAttemptForm
        courseSlug={courseSlug}
        quiz={quiz}
        accessToken={session.accessToken as string}
      />
    </div>
  );
}
