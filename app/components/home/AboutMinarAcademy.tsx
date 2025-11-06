"use client";

import React from "react";
import CallToAction from "./CallToAction";
import Image from "next/image";

export default function AboutMinarAcademy() {
  return (
    <div className="relative px-2">
      {/* Main Section */}
      <div className="wrapper p-6 md:px-10 md:py-20 bg-primary text-white rounded-3xl flex flex-col lg:flex-row items-start lg:justify-between gap-8">
        <div className="w-full lg:w-5/12">
          <p className="text-3xl md:text-4xl font-semibold">
            কেন Minar Academy-তে আস্থা রাখবে?
          </p>
          <p className="mt-4 md:mt-5 text-lg md:text-xl">
            সেরা মেন্টর ও সর্বাধুনিক প্রযুক্তির সাথে সারাদেশের মাদরাসা
            শিক্ষার্থীদের মানসম্মত পড়ালেখা ও পরীক্ষা প্রস্তুতির নির্ভরযোগ্য
            প্রতিষ্ঠান Minar Academy!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 w-full lg:w-auto">
          {[
            { text: "সেরা কন্টেন্ট", image: "content" },
            { text: "সহজ স্টাডি ম্যাটেরিয়াল", image: "study" },
            { text: "স্বল্প খরচে অনেক কিছু", image: "reduction" },
            { text: "সাবলীল উপস্থাপনা", image: "presentation" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white text-black p-4 md:p-5 rounded-xl text-center text-base md:text-lg flex items-center gap-2"
            >
              <Image
                src={`/images/${item.image}.png`}
                alt={item.text}
                width={40}
                height={40}
                className="w-10"
              />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* CallToAction Positioning */}
      <div className="relative">
        {/* Desktop: Absolute and lifted up to attach to main box */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-10 w-[75%] z-10">
          <CallToAction />
        </div>

        {/* Mobile: Naturally stacked below */}
        <div className="block md:hidden mt-6">
          <CallToAction />
        </div>
      </div>

      {/* Padding only for desktop to give space after absolute CallToAction */}
      <div className="pb-6 md:pb-60" />
    </div>
  );
}
