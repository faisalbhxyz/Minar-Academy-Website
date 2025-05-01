"use client";

import Image from "next/image";
import React, { useState } from "react";
import CourseSubjects from "./CourseSubjects";
import RealLifeProjects from "./RealLifeProjects";
import CourseInstructor from "./CourseInstructor";
import StudentReview from "./StudentReview";
import GeneraleQuestions from "./GeneraleQuestions";
import { MdOutlineCheckCircle } from "react-icons/md";

export default function CourseDetails() {
  const [isActive, setIsActive] = useState(1);

  const careerPath = [
    "১৫০+ প্রিরেকর্ডেড ভিডিও",
    "৪০+ লাইভ ক্লাস",
    "২৪+ কনসেপচুয়াল লাইভ ক্লাস",
    "ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্রজেক্টস",
    "ডেইলি ২টি সাপোর্ট সেশন",
    "মক ইন্টারভিউ",
    "লাইফটাইম অ্যাকসেস",
  ];

  return (
    <div className="flex items-start my-10 gap-10">
      <div className="w-full">
        {/* Course Image */}
        <div className="w-full h-[28rem] rounded-xl overflow-hidden">
          <Image
            src="/images/20250303_LGPA5_SSC25_Course-Card_1040x584_cavkam.webp"
            alt="image"
            width={800}
            height={500}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Course Title */}
        <p className="text-2xl mt-5">ক্লাস ৬ - SSC &apos;30</p>

        {/* Stats */}
        <div className="flex border rounded-lg mt-5">
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

        {/* Tabs */}
        <div className="mt-10">
          <ul className="flex items-center gap-5 border-b border-gray-300">
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
                <div className="border flex flex-col items-center p-10 rounded-xl">
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
                  <div className="w-full border flex flex-col items-center p-10 rounded-xl">
                    <p className="text-xl font-semibold">Support Session</p>
                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-3 min-w-3 h-3 rounded-sm bg-primary" />
                      <p className="">
                        Saturday, Monday, Wednesday, Thursday: 8:30 PM & 10:45
                        PM and Tuesday 8:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="w-full border flex flex-col items-center p-10 rounded-xl">
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
              <div className="w-full border flex flex-col items-center p-10 rounded-xl">
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
        <RealLifeProjects />
        <CourseInstructor />
        <StudentReview />
        <GeneraleQuestions />
      </div>

      {/* Sticky Sidebar */}
      <div className="w-96 min-w-96">
        <div className="p-5 border rounded-xl sticky top-20">
          <p className="text-xl">কী কী থাকছে এই ক্যারিয়ার পাথে</p>
          <ul className="space-y-4 mt-5">
            {careerPath.map((path, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="border w-6 h-6 rounded-full flex items-center justify-center">
                  {idx + 1}
                </div>
                <p>{path}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5 mt-5">
            <p className="text-3xl font-semibold">৳6000.00</p>
            <p className="line-through text-gray-500">৳6000.00</p>
          </div>
          <div className="flex items-center gap-3 h-10 my-3">
            <input
              type="text"
              placeholder="Apply Promo"
              className="border w-full h-full rounded-md px-3"
            />
            <button className=" px-6 py-2 text-white bg-primary rounded">
              Apply
            </button>
          </div>
          <button className="w-full px-6 py-2 bg-gray-800 text-white rounded">
            এনরোল করুন
          </button>
          <button className="w-full px-6 py-2 border border-gray-800 text-gray-800 rounded mt-3">
            Watch Demo Video
          </button>
        </div>
      </div>
    </div>
  );
}
