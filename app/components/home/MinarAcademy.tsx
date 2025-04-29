"use client";

import Image from "next/image";
import React, { useState } from "react";
import { HiOutlineCube } from "react-icons/hi";

const accordingData = [
  {
    title: "লাইভ এবং রেকর্ডেড ক্লাস",
    description:
      "Wireframing outlines the basic structure and layout of a design, serving as a visual guide before detailed development.",
    image: "/images/pexels-godisable-jacob-226636-901964.jpg",
  },
  {
    title: "প্র্যাকটিস MCQ টেস্ট",
    description:
      "User-centered design ensures products meet the needs and preferences of the end-users, enhancing usability and satisfaction.",
    image: "/images/pexels-pixabay-267885.jpg",
  },
  {
    title: "লাইভ MCQ টেস্ট",
    description:
      "Wireframing outlines the basic structure and layout of a design, serving as a visual guide before detailed development.",
    image: "/images/pexels-godisable-jacob-226636-901964.jpg",
  },
  {
    title: "ক্লাস নোট",
    description:
      "User-centered design ensures products meet the needs and preferences of the end-users, enhancing usability and satisfaction.",
    image: "/images/pexels-pixabay-267885.jpg",
  },
  {
    title: "স্মার্ট নোট",
    description:
      "User-centered design ensures products meet the needs and preferences of the end-users, enhancing usability and satisfaction.",
    image: "/images/pexels-pixabay-267885.jpg",
  },
  {
    title: "রিপোর্ট কার্ড",
    description:
      "User-centered design ensures products meet the needs and preferences of the end-users, enhancing usability and satisfaction.",
    image: "/images/pexels-pixabay-267885.jpg",
  },
];

export default function MinarAcademy() {
  const [isAccordingOpen, setIsAccordingOpen] = useState<number | null>(0);

  const handleClick = (index: number) =>
    setIsAccordingOpen((prevIndex) => (prevIndex === index ? null : index));
  return (
    <div className="max-w-[1400px] mx-auto rounded-3xl px-3 py-14 mt-10">
      <p className="text-center text-4xl md:text-5xl font-bold mb-10">
        Minar Academy-তে যা যা থাকছে
      </p>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/2 space-y-3">
          {accordingData?.map((according, index) => (
            <article
              key={index}
              className={`rounded-lg p-3 ${
                isAccordingOpen === index
                  ? "border"
                  : "border border-transparent"
              }`}
            >
              <div
                className="flex gap-2 cursor-pointer items-center justify-between w-full"
                onClick={() => handleClick(index)}
              >
                <div className="flex items-center gap-2">
                  <HiOutlineCube size={25} className="text-gray-600" />
                  <p className="font-[600] text-[1.2rem]">{according.title}</p>
                </div>
              </div>
              <div
                className={`grid transition-all duration-300 overflow-hidden ease-in-out ${
                  isAccordingOpen === index
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="text-[#424242] text-[0.9rem] overflow-hidden ml-8">
                  {according.description}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="w-full lg:w-1/2">
          {isAccordingOpen !== null && (
            <Image
              src={accordingData[isAccordingOpen].image}
              alt="Accordion illustration"
              width={500}
              height={400}
              className="rounded-xl w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
