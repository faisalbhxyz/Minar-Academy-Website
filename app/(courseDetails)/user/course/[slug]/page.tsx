import { getCourseBySlug, getCourseProgress, getStudentAssignmentSubmissions, getStudentQuizSubmissions } from "@/app/actions";
import VideoWrapper from "@/app/components/course-viewer/VideoWrapper";
import { buildAssignmentStatusMap } from "@/lib/assignmentHelpers";
import { buildQuizSubmissionStatusMap } from "@/lib/quizHelpers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [courseDetails, courseProgress] = await Promise.all([
    getCourseBySlug(slug),
    getCourseProgress(slug, session),
  ]);

  if (!courseDetails) return <div>Course not found.</div>;

  const submissions = await getStudentAssignmentSubmissions(
    session,
    courseDetails.id
  );
  const assignmentSubmissionStatuses = buildAssignmentStatusMap(submissions);
  const quizSubmissions = await getStudentQuizSubmissions(
    session,
    courseDetails.id
  );
  const quizSubmissionStatuses = buildQuizSubmissionStatusMap(quizSubmissions);
  const completedQuizIds =
    courseProgress?.completed_quiz_ids?.length
      ? courseProgress.completed_quiz_ids
      : [...new Set(quizSubmissions.map((submission) => submission.quiz_id))];

  const userCompletedLessonIds = new Set(
    courseProgress?.completed_lesson_ids ?? []
  );

  return (
    <VideoWrapper
      courseDetails={courseDetails}
      userCompletedLessonIds={userCompletedLessonIds}
      courseSlug={slug}
      accessToken={session.accessToken}
      studentId={session.user.user_id}
      apiProgressPercent={courseProgress?.progress_percent ?? null}
      assignmentSubmissionStatuses={assignmentSubmissionStatuses}
      quizSubmissionStatuses={quizSubmissionStatuses}
      completedQuizIds={completedQuizIds}
    />
  );
}
