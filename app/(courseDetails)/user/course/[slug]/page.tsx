import { getCourseBySlug } from "@/app/actions";
import CourseViewer from "@/app/components/course-viewer/CourseViewer";
import DesktopCourseViewer from "@/app/components/course-viewer/DesktopCourseViewer";
import LessonVideoPlayer from "@/app/components/course-viewer/LessonVideoPlayer";
import MobileCourseViewer from "@/app/components/course-viewer/MobileCourseViewer";
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
    // <CourseViewer
    //   // @ts-ignore
    //   courseDetails={courseDetails}
    //   userCompletedLessonIds={new Set()}
    // />
    <div>
      {/* <LessonVideoPlayer provider="youtube" videoId="xWg5Nq-whcY" /> */}

      {/* Desktop version: hidden on small screens, visible on md+ */}
      <div className="hidden md:block">
        <DesktopCourseViewer
          courseDetails={courseDetails as any}
          userCompletedLessonIds={new Set()}
        />
      </div>

      {/* Mobile version: visible on small screens, hidden on md+ */}
      <div className="block md:hidden">
        <MobileCourseViewer
          courseDetails={courseDetails as any}
          userCompletedLessonIds={new Set()}
        />
      </div>
    </div>
  );
}
