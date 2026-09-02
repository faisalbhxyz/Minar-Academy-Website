import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseReviewPageClient from "@/app/components/courses/CourseReviewPageClient";
import { getCourseBySlug, getCourseProgress } from "@/app/actions";
import { auth } from "@/lib/auth";

export default async function CourseReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [course, progress] = await Promise.all([
    getCourseBySlug(slug),
    getCourseProgress(slug, session),
  ]);

  if (!course) {
    return (
      <div className="wrapper my-10">
        <p className="text-red-500">কোর্স পাওয়া যায়নি।</p>
      </div>
    );
  }

  if ((progress?.progress_percent ?? 0) < 100) {
    return (
      <div className="wrapper my-10 max-w-xl">
        <Link
          href={`/user/course/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          কোর্সে ফিরে যান
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-medium text-amber-900">কোর্স এখনও সম্পন্ন হয়নি</p>
          <p className="mt-2 text-sm text-amber-800">
            রিভিউ দিতে হলে আগে কোর্সটি সম্পন্ন করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper my-10 max-w-xl">
      <Link
        href={`/user/course/${slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        কোর্সে ফিরে যান
      </Link>
      <CourseReviewPageClient
        courseSlug={slug}
        courseTitle={course.title}
        accessToken={session.accessToken}
      />
    </div>
  );
}
