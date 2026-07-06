import {
  getStudentQuiz,
  getStudentQuizSubmissions,
} from "@/app/actions";
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
  const numericQuizId = Number(quizId);

  const [quizResult, submissions] = await Promise.all([
    getStudentQuiz(courseSlug, numericQuizId, session),
    getStudentQuizSubmissions(session),
  ]);

  if (!quizResult.ok) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center max-w-3xl">
        <p className="text-gray-700 mb-2 font-medium">
          {quizResult.status === 403
            ? "Enrollment required"
            : quizResult.status === 404
              ? "Quiz unavailable"
              : "Unable to load quiz"}
        </p>
        <p className="text-gray-600 text-sm mb-4">{quizResult.message}</p>
        <Link
          href="/user/dashboard/quizzes"
          className="text-blue-600 hover:underline text-sm"
        >
          Back to quizzes
        </Link>
      </div>
    );
  }

  const latestSubmission = submissions
    .filter((submission) => submission.quiz_id === numericQuizId)
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )[0];

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
        quiz={quizResult.quiz}
        accessToken={session.accessToken as string}
        latestSubmission={latestSubmission}
      />
    </div>
  );
}
