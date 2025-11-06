import { getCourseBySlug } from "@/app/actions";
import CourseViewer from "@/app/components/course-viewer/CourseViewer";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const courseDetails = await getCourseBySlug(slug);

  if (!courseDetails) {
    return <div className="wrapper my-10">Course not found.</div>;
  }

  return (
    <CourseViewer
      // @ts-ignore
      courseDetails={courseDetails}
      userCompletedLessonIds={new Set()}
    />
  );
}
