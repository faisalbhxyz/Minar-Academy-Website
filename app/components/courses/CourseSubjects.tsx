import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";

const recordedClasses = [
  {
    title: "How to improve in English : 5 tips",
    description: <div>Hello</div>,
  },
  {
    title: "Pronunciation (Alphabets,7 days,12 months, cardinal number)",
    description: <div>Hello</div>,
  },
  {
    title: "Introduce yourself",
    description: <div>Hello</div>,
  },
  {
    title: "Introduce yourself",
    description: <div>Hello</div>,
  },
  {
    title: "The magic of correct pronunciation",
    description: <div>Hello</div>,
  },
  {
    title: "The correct pronunciation of p k t",
    description: <div>Hello</div>,
  },
  {
    title: "Assimilation",
    description: <div>Hello</div>,
  },
  {
    title: "How to talk waiter in the restaurant",
    description: <div>Hello</div>,
  },
  {
    title: "How to talk doctor in the hospital",
    description: <div>Hello</div>,
  },
  {
    title: "Contraction",
    description: <div>Hello</div>,
  },
  {
    title: "Formal and informal words",
    description: <div>Hello</div>,
  },
  {
    title: "British vs American (spelling differences)",
    description: <div>Hello</div>,
  },
  {
    title: "British vs American (grammar differences)",
    description: <div>Hello</div>,
  },
  {
    title: "British vs American (vocabulary differences)",
    description: <div>Hello</div>,
  },
  {
    title: "British vs American (pronunciation)",
    description: <div>Hello</div>,
  },
  {
    title: "Common translation",
    description: <div>Hello</div>,
  },
  {
    title: "Translate English into Bangla",
    description: <div>Hello</div>,
  },
  {
    title: "Translate Bangla into English",
    description: <div>Hello</div>,
  },
  {
    title: "Situational expression",
    description: <div>Hello</div>,
  },
  {
    title: "Common words correct pronunciation",
    description: <div>Hello</div>,
  },
  {
    title: "Daily expression",
    description: <div>Hello</div>,
  },
  {
    title: "Make sentences using auxiliary verb",
    description: <div>Hello</div>,
  },
  {
    title: "Freehand writing class(climate change)",
    description: <div>Hello</div>,
  },
  {
    title: "Freehand writing class(reading newspaper)",
    description: <div>Hello</div>,
  },
  {
    title: "Freehand writing class(Teaching)",
    description: <div>Hello</div>,
  },
  {
    title: "Listening",
    description: <div>Hello</div>,
  },
  {
    title: "Phrase and idioms",
    description: <div>Hello</div>,
  },
  {
    title: "Intonation and accent",
    description: <div>Hello</div>,
  },
  {
    title: "Daily routine",
    description: <div>Hello</div>,
  },
  {
    title: "Hobbies, travel, food and family",
    description: <div>Hello</div>,
  },
  {
    title: "Group discussion",
    description: <div>Hello</div>,
  },
  {
    title: "Chat and movie club",
    description: <div>Hello</div>,
  },
  {
    title: "Listening and speaking test",
    description: <div>Hello</div>,
  },
  {
    title: "Listening BBC news and English podcast",
    description: <div>Hello</div>,
  },
  {
    title: "Speaking practice with partner in the classroom",
    description: <div>Hello</div>,
  },
  {
    title:
      "Reading newspaper like the daily star,the new York times and business standard",
    description: <div>Hello</div>,
  },
  {
    title: "How to talk to friend in English",
    description: <div>Hello</div>,
  },
  {
    title: "How to talk over phone in English",
    description: <div>Hello</div>,
  },
  {
    title: "How to introduce with anyone in English",
    description: <div>Hello</div>,
  },
  {
    title: "How to talk to students after entering in the classroom",
    description: <div>Hello</div>,
  },
  {
    title: "IPA (international phonetics alphabets)",
    description: <div>Hello</div>,
  },
  {
    title: "Silent sound",
    description: <div>Hello</div>,
  },
  {
    title: "Tell something about your school",
    description: <div>Hello</div>,
  },
  {
    title: "Telling time in English",
    description: <div>Hello</div>,
  },
  {
    title: "Previous class practice",
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
      {/* tabs */}
      <ul className="flex items-center justify-center flex-wrap gap-3 mt-10">
        {[{ id: 1, label: "কোর্স মডিউল" }].map((tab) => (
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
                  <h2 className="text-lg font-medium">{according.title}</h2>
                  <p>
                    <FaPlus
                      className={`text-[1.3rem] text-text transition-all duration-300 ${
                        isPlusAccording === index &&
                        "rotate-[45deg] text-secondary"
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
                  <div className="text-[#424242] text-[0.9rem] overflow-hidden">
                    {according.description}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
