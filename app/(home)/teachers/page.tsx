import { auth } from "@/lib/auth";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";
import React from "react";

const getAllTeachers = async (): Promise<Instructor[]> => {
  try {
    const res = await axiosInstance.get(`/instructor/all`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

export default async function Page() {
  const teachers = await getAllTeachers();

  console.log("TEACHERS", teachers);
  

  return (
    <main className="wrapper my-20">
      <div className="flex items-center justify-center mb-8">
        <p className="text-5xl font-bold border-b-4 pb-3">শিক্ষকবৃন্দ</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl shadow p-5 flex flex-col items-center text-center transition transform hover:shadow-lg hover:scale-105 duration-300"
          >
            <div className="w-32 h-32 overflow-hidden rounded-full mb-4">
              <Image
                src={teacher.image ? teacher.image : "/images/avatar.png"}
                alt={teacher.first_name}
                width={158}
                height={158}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold">
              {teacher.first_name} {teacher.last_name ?? ""}
            </p>
            <p className="text-sm font-semibold">
              {teacher.designation}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
