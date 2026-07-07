import {
  getCourseBySlug,
  getStudentQuizSubmissions,
} from "@/app/actions";
import QuizAttemptForm from "@/app/components/quiz/QuizAttemptForm";
import {
  buildQuizPreviewDetail,
  findCourseQuiz,
} from "@/lib/quizHelpers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function QuizAttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; quizId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { courseSlug, quizId } = await params;
  const { returnTo } = await searchParams;
  const numericQuizId = Number(quizId);

  if (!Number.isFinite(numericQuizId)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center max-w-4xl">
        <p className="text-gray-700 font-medium">Invalid quiz.</p>
      </div>
    );
  }

  const course = await getCourseBySlug(courseSlug);
  const quiz = findCourseQuiz(course, numericQuizId);

  if (!course || !quiz) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center max-w-4xl">
        <p className="text-gray-700 mb-2 font-medium">Quiz unavailable</p>
        <p className="text-gray-600 text-sm mb-4">
          Quiz not found or is not published.
        </p>
        <Link
          href={
            returnTo === "course"
              ? `/user/course/${courseSlug}`
              : "/user/dashboard/quizzes"
          }
          className="text-blue-600 hover:underline text-sm"
        >
          Go back
        </Link>
      </div>
    );
  }

  const submissions = await getStudentQuizSubmissions(session, course.id);
  const quizPreview = buildQuizPreviewDetail(quiz, submissions);

  const latestSubmission = submissions
    .filter((submission) => submission.quiz_id === numericQuizId)
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )[0];

  const backHref =
    returnTo === "course"
      ? `/user/course/${courseSlug}`
      : "/user/dashboard/quizzes";
  const backLabel =
    returnTo === "course" ? "Back to course" : "Back to quizzes";

  return (
    <div className="space-y-4 max-w-4xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      <QuizAttemptForm
        courseSlug={courseSlug}
        quiz={quizPreview}
        accessToken={session.accessToken as string}
        latestSubmission={latestSubmission}
        returnTo={returnTo === "course" ? "course" : "quizzes"}
      />
    </div>
  );
}
