import InProgressCourseCard from "@/app/components/dashboard/new/InProgressCourseCard";

export default function InProgressCourses({
  courses,
}: {
  courses: Enrollment[];
}) {

  return (
    <section className="mt-6 bg-white rounded">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        In Progress Courses
      </h2>
      {
        courses
          .filter((enrollment) => enrollment.course)
          .map((enrollment) => (
            <InProgressCourseCard
              key={enrollment.id}
              course={enrollment.course}
            />
          ))
      }
    </section>
  );
}
