import { cn } from "@/lib/cn";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";

const questions = [
  {
    title: "কোর্সটি কীভাবে কিনবো?",
    description:
      "ওয়েবসাইটে অ্যাড টু কার্ট থেকে কিনতে পারবেন, তাছাড়াও রেজিস্ট্রেশন ফর্মের মাধ্যমে ম্যানুয়ালিও কিনতে পারবেন ।",
  },
  {
    title: "কীভাবে পেমেন্ট করবো?",
    description:
      "বিকাশে 01727659043 / 01763881476 -এই ২টি নম্বরের সেন্ড মানি অপশন মাধ্যমে পেমেন্ট করতে পারবে। আর নগদে 01727659043-এই নম্বরের সেন্ড মানি অপশন মাধ্যমে পেমেন্ট করতে পারবে। বিকাশ বা নগদে পেমেন্ট করে কোর্স কিনে থাকলে নিচের ফর্মটি ফিল আপ করতে হবে। ওয়েবসাইট থেকে কিনলে ভিসা কার্ড, মাস্টার কার্ড, বিকাশ, নগদ যে কোন মাধ্যমেই পেমেন্ট করা যাবে।সেক্ষেত্রে আলাদা করে ফর্ম ফিল আপ করার দরকার নেই।",
  },
];

export default function GeneraleQuestions() {
  const [isPlusAccording, setIsPlusAccording] = useState<number | null>(0);

  const handleBorderClick = (index: number) =>
    setIsPlusAccording((prevIndex) => (prevIndex === index ? null : index));

  return (
    <div className="mt-10">
      <div className="flex gap-3 flex-col w-full">
        {questions?.map((question, index) => (
          <article
            key={index}
            className={cn(
              "rounded-xl p-3 border",
              isPlusAccording === index
                ? "border-[#e5eaf2] bg-gray-100"
                : "border-transparent"
            )}
          >
            <div
              className="flex gap-2 cursor-pointer items-center justify-between w-full"
              onClick={() => handleBorderClick(index)}
            >
              <h2 className="text-lg font-[600]">{question.title}</h2>
              <div>
                <FaPlus
                  className={`text-[1.3rem] text-text transition-all duration-300 text-gray-600 ${
                    isPlusAccording === index && "rotate-[45deg]"
                  }`}
                />
              </div>
            </div>
            <div
              className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                isPlusAccording === index
                  ? "grid-rows-[1fr] opacity-100 mt-4"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="text-[#424242] overflow-hidden">
                {question.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
