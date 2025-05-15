"use client";

import Image from "next/image";
import React, { useState } from "react";
import CourseSubjects from "./CourseSubjects";
import CourseInstructor from "./CourseInstructor";
import StudentReview from "./StudentReview";
import GeneraleQuestions from "./GeneraleQuestions";
import { MdOutlineCheckCircle } from "react-icons/md";
import ProgramPath from "./ProgramPath";
import Blueprint from "./Blueprint";

export default function CourseDetails({
  course,
}: {
  course: Course | undefined;
}) {
  const [isActive, setIsActive] = useState(1);

  if (!course) {
    return <p className="text-red-500">Course not found.</p>;
  }

  return (
    <div className="flex items-start my-10 gap-10">
      <div className="w-full">
        {/* Course Image */}
        <div className="w-full h-[28rem] rounded-xl overflow-hidden">
          <Image
            src={course.image}
            alt="image"
            width={800}
            height={500}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Course Title */}
        <p className="text-2xl mt-5">{course.title}</p>

        {/* Stats */}
        <div className="flex border rounded-lg mt-5 bg-gray-100">
          {[
            { label: "Students", value: "426" },
            { label: "Hours of Lessons", value: "150+" },
            { label: "Total Lessons", value: "101" },
          ].map((item, i) => (
            <div key={i} className="w-full flex flex-col items-center p-5">
              <p className="text-3xl">{item.value}</p>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
        <div className="lg:hidden mt-5">
          <ProgramPath course={course} />
        </div>
        {/* Tabs */}
        <div className="mt-10">
          <div className="overflow-x-auto">
            <ul className="min-w-4xl flex items-center gap-5 border-b border-gray-300">
              {[
                { id: 1, label: "ক্যারিয়ার পাথ সম্পর্কে জানুন" },
                { id: 2, label: "ক্লাস শিডিউল" },
                { id: 3, label: "যা যা শিখবেন" },
                { id: 4, label: "কমিউনিটি" },
                { id: 5, label: "যাদের জন্য" },
              ].map((tab) => (
                <li
                  key={tab.id}
                  className={`${
                    isActive === tab.id && "border-primary text-primary"
                  } px-6 py-2 border-b text-[#424242] transition duration-300 border-transparent cursor-pointer`}
                  onClick={() => setIsActive(tab.id)}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Tab Content */}
          <div className="mt-5">
            {isActive === 1 && (
              <div>
                <p>
                  📌 ডেটা অ্যানালিটিক্স অ্যান্ড পাওয়ার বিআই ক্যারিয়ার পাথের ৩টি
                  ব্যাচের অভাবনীয় সাফল্যের পরে আমরা নিয়ে এসেছি এই ক্যারিয়ার
                  পাথের ৪র্থ ব্যাচ। নতুন করে আরও অ্যাডভান্সড আর আউটপুট ফোকাসড
                  আউটলাইন নিয়ে।
                </p>
                <p className="mt-5">
                  📌 চলছে স্পেশাল ২৮% ডিসকাউন্ট। এনরোল করার সময়ে অ্যাপ্লাই করুন
                  “UPSKILL28” আর ৬০০০ টাকার এই ক্যারিয়ার পাথ পেয়ে যাবেন মাত্র
                  ৪৩২০ টাকায়।{" "}
                </p>
              </div>
            )}
            {isActive === 2 && (
              <div>
                <div className="bg-gray-100 border flex flex-col items-center p-10 rounded-xl">
                  <p className="text-xl font-semibold">Class Time</p>
                  <div className="max-w-xl w-full flex flex-col md:flex-row items-center justify-between mt-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-primary" />
                      <p className="">Tuesday: 9:30 PM - 11:00 PM</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-primary" />
                      <p>Friday: 9:30 PM - 11:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col md:flex-row gap-5">
                  <div className="bg-gray-100 w-full border flex flex-col items-center p-10 rounded-xl">
                    <p className="text-xl font-semibold">Support Session</p>
                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-3 min-w-3 h-3 rounded-sm bg-primary" />
                      <p className="">
                        Saturday, Monday, Wednesday, Thursday: 8:30 PM & 10:45
                        PM and Tuesday 8:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100 w-full border flex flex-col items-center p-10 rounded-xl">
                    <p className="text-xl font-semibold">Project Day</p>
                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-3 h-3 rounded-sm bg-primary" />
                      <p className="">Sunday 8.30 PM -10 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isActive === 3 && (
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Database Fundamentals and Data Analysis with SQL</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Database Fundamentals and Data Analysis with SQL</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Database Fundamentals and Data Analysis with SQL</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Database Fundamentals and Data Analysis with SQL</p>
                </li>
              </ul>
            )}
            {isActive === 4 && (
              <div className="bg-gray-100 not-last-of-type:w-full border flex flex-col items-center p-10 rounded-xl">
                <p className="text-xl font-semibold">Data Analysts Forum</p>
                <button className="mt-5 border border-primary px-5 py-2 rounded-md font-medium text-primary">
                  Join The Group
                </button>
              </div>
            )}
            {isActive === 5 && (
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Business Analysts</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Data Analyst</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Business Analysts</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary">
                    <MdOutlineCheckCircle size={22} />
                  </span>
                  <p>Data Analyst</p>
                </li>
              </ul>
            )}
          </div>
        </div>
        <CourseSubjects />
        <CourseInstructor name={course.authorized} />
        <StudentReview />
        <GeneraleQuestions />
        <Blueprint />
        {/* <ConsultationForm /> */}
      </div>

      {/* Sticky Sidebar */}
      <div className="w-96 min-w-96 hidden lg:block sticky top-24">
        <ProgramPath course={course} />
      </div>
    </div>
  );
}
