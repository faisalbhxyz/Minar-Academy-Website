"use client";

import Image from "next/image";
import React, { useState } from "react";
import { RiLiveLine } from "react-icons/ri";
import { PiExamBold } from "react-icons/pi";
import { LuNotepadText, LuNotebookPen } from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";

const accordingData = [
  {
    title: "লাইভ এবং রেকর্ডেড ক্লাস",
    description:
      "ইন্ডাস্ট্রি এক্সপার্টদের সাথে লাইভ ক্লাসে যুক্ত হও, আর ইচ্ছে মতো রেকর্ডেড ক্লাস দেখে শেখার সুবিধা নাও।",
    image: "/images/live-recorded-class.jpg",
    icon: RiLiveLine,
  },
  {
    title: "প্র্যাকটিস MCQ টেস্ট",
    description:
      "বিভিন্ন টপিক কাভার করতে নিয়মিত প্র্যাকটিস MCQ টেস্ট দিয়ে নিজের প্রস্তুতি যাচাই করো।",
    image: "/images/practce-mcq-test.webp",
    icon: PiExamBold,
  },
  {
    title: "স্মার্ট নোট",
    description:
      "শর্টকার্ট ট্রিকস আর এক্সট্রা টিপসসহ স্মার্টলি সাজানো নোট, যাতে দ্রুত রিভিশন সম্ভব হয়।",
    image: "/images/smart-note.jpg",
    icon: LuNotebookPen,
  },
  {
    title: "রিপোর্ট কার্ড",
    description:
      "নিজের প্রতিটি পরীক্ষার বিস্তারিত রিপোর্ট কার্ডে পারফরম্যান্স এনালাইসিস করো।",
    image: "/images/report-card.jpg",
    icon: TbReportAnalytics,
  },
];

export default function MinarAcademy() {
  const [isAccordingOpen, setIsAccordingOpen] = useState<number | null>(0);

  const handleClick = (index: number) =>
    setIsAccordingOpen((prevIndex) => (prevIndex === index ? null : index));

  return (
    <div className="wrapper rounded-3xl py-14 mt-10">
      <p className="text-center text-4xl md:text-5xl font-bold mb-10">
        Minar Academy-তে যা যা থাকছে
      </p>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Accordion */}
        <div className="w-full lg:w-1/2 space-y-3">
          {accordingData?.map(
            ({ description, icon: Icon, title, image }, index) => (
              <article
                key={index}
                className={`rounded-lg p-3 border ${
                  isAccordingOpen === index
                    ? "bg-gray-100"
                    : "border border-transparent"
                }`}
              >
                <div
                  className="flex gap-2 cursor-pointer items-center justify-between w-full"
                  onClick={() => handleClick(index)}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={25} className="text-gray-600" />
                    <p className="font-[600] text-[1.2rem]">{title}</p>
                  </div>
                </div>
                <div
                  className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                    isAccordingOpen === index
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="text-[#424242] overflow-hidden ml-8">
                    {description}
                  </div>

                  {/* ✅ Mobile-only image below the open accordion */}
                  {isAccordingOpen === index && (
                    <div className="lg:hidden mt-4 flex justify-center items-center">
                      <Image
                        src={image}
                        alt="Accordion illustration"
                        width={1920}
                        height={1080}
                        className="w-[500px] h-[300px] rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </article>
            )
          )}
        </div>

        {/* Right: Desktop-only image */}
        <div className="hidden lg:block w-full lg:w-1/2">
          {isAccordingOpen !== null && (
            <Image
              src={accordingData[isAccordingOpen].image}
              alt="Accordion illustration"
              width={1920}
              height={1080}
              className="w-[500px] h-[300px] object-fill rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}
