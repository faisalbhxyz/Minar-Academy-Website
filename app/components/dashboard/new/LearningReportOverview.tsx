import Link from "next/link";
import type { EnrollmentWithProgress, LearningReportSummary } from "@/lib/learningReport";

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 ${
        href ? "hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors" : ""
      }`}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-indigo-600 mt-1">{value}</p>
      {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function LearningReportOverview({
  summary,
  items,
}: {
  summary: LearningReportSummary;
  items: EnrollmentWithProgress[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="এনরোলড কোর্স"
          value={summary.enrolledCourses}
          href="/user/dashboard/enrolled-courses"
        />
        <StatCard
          label="চলমান"
          value={summary.inProgressCourses}
          sub="০% < অগ্রগতি < ১০০%"
        />
        <StatCard
          label="সম্পন্ন"
          value={summary.completedCourses}
          sub="সার্টিফিকেট / ১০০%"
          href="/user/dashboard/certificates"
        />
        <StatCard
          label="গড় অগ্রগতি"
          value={`${summary.overallPercent}%`}
          sub={`${summary.totalLessonsCompleted}/${summary.totalLessons} লেসন`}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">কোর্স অনুযায়ী রিপোর্ট</h2>
          <Link
            href="/user/dashboard/learning-report"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            বিস্তারিত →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">কোর্স</th>
                <th className="text-left px-4 py-3 font-medium">অগ্রগতি</th>
                <th className="text-left px-4 py-3 font-medium">লেসন</th>
                <th className="text-left px-4 py-3 font-medium">কুইজ</th>
                <th className="text-left px-4 py-3 font-medium">অ্যাসাইনমেন্ট</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ enrollment, progress }) => {
                const course = enrollment.course;
                const pct = progress?.progress_percent ?? 0;
                return (
                  <tr key={enrollment.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/user/course/${course.slug}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-gray-700 font-medium w-10 text-right">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {progress
                        ? `${progress.lessons_completed}/${progress.lessons_total}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {progress && progress.quizzes_total > 0
                        ? `${progress.quizzes_completed}/${progress.quizzes_total}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {progress && progress.assignments_total > 0
                        ? `${progress.assignments_completed}/${progress.assignments_total}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
