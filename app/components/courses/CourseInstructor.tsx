import Image from "next/image";
import React from "react";

const instructors = [
  {
    id: 1,
    name: "Sabbir Rahman",
    role: "Lead Instructor",
    bio: "Data Scientist & Statistical Consultant",
    image: "/images/profile.png",
  },
  {
    id: 2,
    name: "Fatema Jahan",
    role: "Co-Instructor",
    bio: "AI Researcher & ML Engineer",
    image: "/images/profile.png",
  },
];

function CourseInstructor() {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-semibold text-center">কোর্স ইনস্ট্রাক্টর</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {instructors.map((item) => (
          <div
            key={item.id}
            className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.name} profile`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">{item.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseInstructor;
