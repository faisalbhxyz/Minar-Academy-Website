import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";

const recordedClasses = [
  {
    title: "Data Analytics and Power BI career path 04 outline",
    description: <div>Hello</div>,
  },
  {
    title: "Get Started",
    description: <div>Hello</div>,
  },
];
const liveClasses = [
  {
    title: "Data Analytics Batch 04 - Orientation",
    description: <div>Hello</div>,
  },
  {
    title: "Module 01: Advanced Excel & Power Query",
    description: <div>Hello</div>,
  },
];

export default function CourseSubjects() {
  const [courseSub, setCourseSub] = useState(1);
  const [isPlusAccording, setIsPlusAccording] = useState<number | null>(null);

  const handleBorderClick = (index: number) =>
    setIsPlusAccording((prevIndex) => (prevIndex === index ? null : index));

  return (
    <div className="mt-10">
      <p className="text-3xl font-semibold text-center">কোর্সের বিষয়বস্তু</p>
      <ul className="flex items-center justify-center gap-3 mt-10">
        {[
          { id: 1, label: "রেকর্ডেড ক্লাস" },
          { id: 2, label: "লাইভ ক্লাস" },
          { id: 3, label: "প্রজেক্ট অ্যান্ড অ্যাসাইনমেন্ট" },
          { id: 4, label: "কোর্স আউটলাইন" },
        ].map((tab) => (
          <li
            key={tab.id}
            className={`${
              courseSub === tab.id ? "bg-primary text-white" : "bg-gray-100"
            } px-6 py-2 rounded-full text-[#424242] transition duration-300 border-transparent cursor-pointer`}
            onClick={() => setCourseSub(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        {courseSub === 1 && (
          <div className="space-y-3">
            {recordedClasses?.map((according, index) => (
              <article
                key={index}
                className="bg-gray-100 border border-[#e5eaf2] rounded p-3"
              >
                <div
                  className="flex gap-2 cursor-pointer items-center justify-between w-full"
                  onClick={() => handleBorderClick(index)}
                >
                  <h2 className="text-[#3B9DF8] text-lg font-medium">
                    {according.title}
                  </h2>
                  <p>
                    <FaPlus
                      className={`text-[1.3rem] text-text transition-all duration-300 ${
                        isPlusAccording === index &&
                        "rotate-[45deg] !text-[#3B9DF8]"
                      }`}
                    />
                  </p>
                </div>
                <div
                  className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                    isPlusAccording === index
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="text-[#424242] text-[0.9rem] overflow-hidden">
                    {according.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        {courseSub === 2 && (
          <div className="space-y-3">
            {liveClasses?.map((according, index) => (
              <article
                key={index}
                className="bg-gray-100 border border-[#e5eaf2] rounded p-3"
              >
                <div
                  className="flex gap-2 cursor-pointer items-center justify-between w-full"
                  onClick={() => handleBorderClick(index)}
                >
                  <h2 className="text-[#3B9DF8] text-lg font-medium">
                    {according.title}
                  </h2>
                  <p>
                    <FaPlus
                      className={`text-[1.3rem] text-text transition-all duration-300 ${
                        isPlusAccording === index &&
                        "rotate-[45deg] !text-[#3B9DF8]"
                      }`}
                    />
                  </p>
                </div>
                <div
                  className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                    isPlusAccording === index
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="text-[#424242] text-[0.9rem] overflow-hidden">
                    {according.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        {courseSub === 3 && (
          <ul className="space-y-3">
            <li className="bg-gray-100 border border-[#e5eaf2] rounded p-3">
              1. Root Cause Analysis and Dashboard Building with Microsoft Excel
              on Hotel Management Data
            </li>
            <li className="bg-gray-100 border border-[#e5eaf2] rounded p-3">
              2. Root Cause Analysis and Dashboard Building with Microsoft Excel
              on Hotel Management Data
            </li>
          </ul>
        )}
        {courseSub === 4 && (
          <ul className="space-y-3">
            <li className="bg-gray-100 border border-[#e5eaf2] rounded p-3">
              Data Analytics and Power BI career path batch 04 outline
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
