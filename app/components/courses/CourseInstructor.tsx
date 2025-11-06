import { teachers } from "@/lib/constants";
import Image from "next/image";
import React from "react";

function CourseInstructor({
  instructors,
}: {
  instructors: CourseInstructor[];
}) {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-semibold text-center">কোর্স ইনস্ট্রাক্টর</h2>
      <div className="mt-8 flex items-center justify-center">
        {instructors.map((instructor) => (
          <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={ instructor.instructor.image || "/images/avatar.png"}
                  alt={`${instructor.instructor.email} profile`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-semibold">{`${instructor.instructor.first_name} ${instructor.instructor.last_name}`}</p>
                <p className="text-sm text-gray-500">{instructor.instructor.role}</p>
              </div>
            </div>
            {/* <p className="text-sm text-gray-600 mt-4">{instructor.description}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseInstructor;
