import InProgressCourseCard from "@/app/components/dashboard/new/InProgressCourseCard";
import type { EnrollmentWithProgress } from "@/lib/learningReport";

export default function InProgressCourses({
  items,
}: {
  items: EnrollmentWithProgress[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6 bg-white rounded">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        চলমান কোর্স
      </h2>
      {items
        .filter((item) => item.enrollment.course)
        .map((item) => (
          <InProgressCourseCard
            key={item.enrollment.id}
            course={item.enrollment.course}
            progress={item.progress}
          />
        ))}
    </section>
  );
}
