import Image from "next/image";
import placeholder from "@/public/images/placeholder.svg";
import Link from "next/link";

export default function InProgressCourseCard({
  course,
}: {
  course: CourseDetails;
}) {
  return (
    <Link href={`/user/course/${course.slug}`}>
      <div className="border border-gray-200 p-2 rounded-lg flex flex-col md:flex-row gap-4 bg-white mb-4 last:mb-0">
        <div className="w-full md:w-40 md:h-28 flex-shrink-0">
          <Image
            src={course.featured_image || placeholder}
            alt="Course Thumbnail"
            width={1080}
            height={1080}
            className="w-full h-full rounded-md object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-sm font-semibold">★</span>
              <span className="text-sm font-semibold text-gray-800">0.00</span>
            </div>

            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {course.title}
            </h3>

            <p className="text-sm text-gray-600">
              Click to continue where you left off.
            </p>
            {/* <p className="text-sm text-gray-600">
              Completed Lessons:{" "}
              <span className="font-medium text-gray-800">0 of 0 lessons</span>
            </p> */}
          </div>

          {/* <div className="mt-4">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: "0%" }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">0% Complete</p>
          </div> */}
        </div>
      </div>
    </Link>
  );
}
