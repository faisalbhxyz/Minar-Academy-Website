import Image from "next/image";
import Link from "next/link";
import placeholder from "@/public/images/placeholder.svg";

export default function InProgressCourseCard({
  course,
  progress,
}: {
  course: CourseDetails;
  progress?: CourseProgressData | null;
}) {
  const percent = progress?.progress_percent ?? 0;
  const lessonsDone = progress?.lessons_completed ?? 0;
  const lessonsTotal = progress?.lessons_total ?? 0;
  const hasProgress = Boolean(progress);

  return (
    <Link href={`/user/course/${course.slug}`}>
      <div className="border border-gray-200 p-2 rounded-lg flex flex-col md:flex-row gap-4 bg-white mb-4 last:mb-0 hover:border-purple-300 hover:shadow-sm transition-colors">
        <div className="w-full md:w-40 md:h-28 flex-shrink-0">
          <Image
            src={course.featured_image || placeholder}
            alt={course.title}
            width={1080}
            height={1080}
            className="w-full h-full rounded-md object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
              {course.title}
            </h3>

            {hasProgress ? (
              <>
                <p className="text-sm text-gray-600">
                  সম্পন্ন লেসন:{" "}
                  <span className="font-medium text-gray-800">
                    {lessonsDone} / {lessonsTotal}
                  </span>
                  {progress!.quizzes_total > 0 ? (
                    <>
                      {" "}
                      · কুইজ {progress!.quizzes_completed}/
                      {progress!.quizzes_total}
                    </>
                  ) : null}
                  {progress!.assignments_total > 0 ? (
                    <>
                      {" "}
                      · অ্যাসাইনমেন্ট {progress!.assignments_completed}/
                      {progress!.assignments_total}
                    </>
                  ) : null}
                </p>
                <p className="text-sm text-gray-500">
                  {percent >= 100
                    ? "কোর্স সম্পন্ন"
                    : percent > 0
                      ? "চালিয়ে যান যেখানে থেমেছিলেন"
                      : "শেখা শুরু করুন"}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                কোর্সে ঢুকে শেখা শুরু করুন।
              </p>
            )}
          </div>

          {hasProgress ? (
            <div className="mt-4">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">
                {Math.round(percent)}% সম্পন্ন
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
