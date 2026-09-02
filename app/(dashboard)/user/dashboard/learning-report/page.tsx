import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LearningReportOverview from "@/app/components/dashboard/new/LearningReportOverview";
import LearningReportInsights from "@/app/components/dashboard/new/LearningReportInsights";
import InProgressCourseCard from "@/app/components/dashboard/new/InProgressCourseCard";
import { getStudentLearningReport } from "@/app/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LearningReportPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { items, summary, apiInsights } = await getStudentLearningReport(session);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">লার্নিং রিপোর্ট</h1>
        <p className="text-gray-600 mt-1">
          আপনার সব কোর্সের অগ্রগতি, লেসন, কুইজ ও অ্যাসাইনমেন্ট এক নজরে।
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-700 font-medium">এখনো কোনো এনরোলমেন্ট নেই</p>
          <Link
            href="/courses/all"
            className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            কোর্স ব্রাউজ করুন
          </Link>
        </div>
      ) : (
        <>
          <LearningReportInsights
            accessToken={session.accessToken}
            initialData={apiInsights}
          />
          <LearningReportOverview summary={summary} items={items} />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">সব কোর্স</h2>
            {items.map(({ enrollment, progress }) =>
              enrollment.course ? (
                <InProgressCourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  progress={progress}
                />
              ) : null
            )}
          </section>
        </>
      )}
    </div>
  );
}
