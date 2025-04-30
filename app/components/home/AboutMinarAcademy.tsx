import React from "react";
import CallToAction from "./CallToAction";
import Image from "next/image";

export default function AboutMinarAcademy() {
  return (
    <div className="py-10 mb-[42rem] md:mb-40">
      <div className="relative p-6 md:p-10 wrapper h-[42rem] md:h-96 bg-primary text-white rounded-3xl flex flex-col lg:flex-row items-start lg:justify-between gap-8">
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
          <div className="bg-white text-black p-4 md:p-5 rounded-xl text-center text-base md:text-lg flex items-center gap-2">
            <Image
              src="/images/content.png"
              alt="image"
              width={100}
              height={100}
              className="w-10"
            />{" "}
            সেরা কন্টেন্ট
          </div>
          <div className="bg-white text-black p-4 md:p-5 rounded-xl text-center text-base md:text-lg flex items-center gap-2">
            <Image
              src="/images/study.png"
              alt="image"
              width={100}
              height={100}
              className="w-10"
            />{" "}
            সহজ স্টাডি ম্যাটেরিয়াল
          </div>
          <div className="bg-white text-black p-4 md:p-5 rounded-xl text-center text-base md:text-lg flex items-center gap-2">
            <Image
              src="/images/reduction.png"
              alt="image"
              width={100}
              height={100}
              className="w-10"
            />{" "}
            স্বল্প খরচে অনেক কিছু
          </div>
          <div className="bg-white text-black p-4 md:p-5 rounded-xl text-center text-base md:text-lg flex items-center gap-2">
            <Image
              src="/images/presentation.png"
              alt="image"
              width={100}
              height={100}
              className="w-10"
            />{" "}
            সাবলীল উপস্থাপনা
          </div>
        </div>
        <CallToAction />
      </div>
    </div>
  );
}
