"use client";

import QuizResultView from "@/app/components/quiz/QuizResultView";
import { fetchQuizSubmissionDetail } from "@/lib/quizClient";
import { buildQuizPreviewDetail } from "@/lib/quizHelpers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";

interface Props {
  submissionId: number;
  accessToken: string;
  courseSlug?: string;
  quiz?: CourseQuiz | null;
  returnTo?: "course" | "quizzes";
}

export default function QuizSubmissionDetailClient({
  submissionId,
  accessToken,
  courseSlug,
  quiz,
  returnTo = "quizzes",
}: Props) {
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await fetchQuizSubmissionDetail(submissionId, accessToken);
      if (cancelled) return;

      if (!res.ok) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      setResult(res.result);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [submissionId, accessToken]);

  const backHref =
    returnTo === "course" && courseSlug
      ? `/user/course/${courseSlug}`
      : "/user/dashboard/quizzes";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <LuLoaderCircle className="animate-spin w-6 h-6 mr-2" />
        Loading submission...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center max-w-4xl">
        <p className="text-gray-700 font-medium">Submission not found.</p>
        <Link href={backHref} className="text-blue-600 hover:underline text-sm mt-3 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  const quizDetail: StudentQuizDetail = quiz
    ? buildQuizPreviewDetail(quiz, [])
    : buildFallbackQuizDetail(result);

  return (
    <QuizResultView
      result={result}
      quiz={quizDetail}
      accessToken={accessToken}
      courseSlug={courseSlug}
      returnTo={returnTo}
      autoOpenDetails
      skipInitialDetailFetch
    />
  );
}

function buildFallbackQuizDetail(result: QuizSubmissionResult): StudentQuizDetail {
  return {
    id: 0,
    title: result.quiz_title,
    instructions: "",
    is_published: true,
    randomize_questions: false,
    single_quiz_view: false,
    time_limit: result.quiz_time_seconds
      ? Math.ceil(result.quiz_time_seconds / 60)
      : 0,
    time_limit_option: "minutes",
    total_visible_questions: 0,
    reveal_answers: result.reveal_answers,
    enable_retry: false,
    retry_attempts: 0,
    minimum_pass_percentage: result.minimum_pass_percentage ?? 0,
    chapter_id: 0,
    course_id: 0,
    created_at: result.submitted_at,
    updated_at: result.submitted_at,
    questions: [],
    attempts_used: result.attempt_number,
    can_retry: false,
  };
}
