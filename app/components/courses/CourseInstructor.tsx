import { teachers } from "@/lib/constants";
import Image from "next/image";
import React from "react";

function CourseInstructor({ name }: { name: string }) {
  const instructor = teachers.find((teacher) => teacher.name === name);
  if (!instructor) {
    return <div>Instructor not found</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-semibold text-center">কোর্স ইনস্ট্রাক্টর</h2>
      <div className="mt-8 flex items-center justify-center">
        <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative rounded-full overflow-hidden">
              <Image
                src={instructor.image}
                alt={`${instructor.name} profile`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold">{instructor.name}</p>
              <p className="text-sm text-gray-500">{instructor.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">{instructor.bio}</p>
        </div>
      </div>
    </div>
  );
}

export default CourseInstructor;
