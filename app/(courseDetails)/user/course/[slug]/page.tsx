import { getCourseBySlug } from "@/app/actions";
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

  const courseDetails = await getCourseBySlug(slug);
  if (!courseDetails) return <div>Course not found.</div>;

  return <VideoWrapper courseDetails={courseDetails} />;
}
