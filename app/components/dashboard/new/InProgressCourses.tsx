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
        courses.map((course) => (
          <InProgressCourseCard key={course.id} course={course.course} />
        ))
      }
    </section>
  );
}
