import QuizSubmissionDetailClient from "@/app/components/quiz/QuizSubmissionDetailClient";
import { getCourseBySlug, getStudentQuizSubmissions } from "@/app/actions";
import { findCourseQuiz } from "@/lib/quizHelpers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function QuizSubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ submissionId: string }>;
  searchParams: Promise<{ courseSlug?: string; returnTo?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { submissionId } = await params;
  const { courseSlug, returnTo } = await searchParams;
  const numericSubmissionId = Number(submissionId);

  if (!Number.isFinite(numericSubmissionId)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center max-w-4xl">
        <p className="text-gray-700 font-medium">Invalid submission.</p>
      </div>
    );
  }

  let quiz: CourseQuiz | null = null;
  if (courseSlug) {
    const course = await getCourseBySlug(courseSlug);
    const submissions = await getStudentQuizSubmissions(session, course?.id);
    const submission = submissions.find((item) => item.id === numericSubmissionId);
    if (course && submission) {
      quiz = findCourseQuiz(course, submission.quiz_id);
    }
  }

  const backHref =
    returnTo === "course" && courseSlug
      ? `/user/course/${courseSlug}`
      : "/user/dashboard/quizzes";

  return (
    <div className="space-y-4 max-w-4xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        {returnTo === "course" ? "Back to course" : "Back to quizzes"}
      </Link>

      <QuizSubmissionDetailClient
        submissionId={numericSubmissionId}
        accessToken={session.accessToken as string}
        courseSlug={courseSlug}
        quiz={quiz}
        returnTo={returnTo === "course" ? "course" : "quizzes"}
      />
    </div>
  );
}
