import { getCourseBySlug, getCourseProgress } from "@/app/actions";
import VideoWrapper from "@/app/components/course-viewer/VideoWrapper";
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
    />
  );
}
