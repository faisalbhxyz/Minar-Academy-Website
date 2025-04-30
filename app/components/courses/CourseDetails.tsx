"use client";

import Image from "next/image";
import React, { useState } from "react";

export default function CourseDetails() {
  const [isActive, setIsActive] = useState(1);

  return (
    <div className="flex items-start my-10 gap-10">
      <div className="w-full">
        {/* Course Image */}
        <div className="w-full h-96 rounded-xl overflow-hidden">
          <Image
            src="/images/20250303_LGPA5_SSC25_Course-Card_1040x584_cavkam.webp"
            alt="image"
            width={500}
            height={300}
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
                  isActive === tab.id && "!border-[#3B9DF8] !text-[#3B9DF8]"
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
                <h2 className="text-xl font-semibold mb-2">
                  ক্যারিয়ার পাথ সম্পর্কে
                </h2>
                <p>
                  এই ক্যারিয়ার পাথে আপনি যা শিখবেন এবং কিভাবে এগিয়ে যেতে
                  পারবেন তা বিস্তারিতভাবে ব্যাখ্যা করা হয়েছে।
                </p>
              </div>
            )}
            {isActive === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">ক্লাস শিডিউল</h2>
                <p>
                  ক্লাসের সময়সূচি এবং মডিউল ভিত্তিক শেখার পরিকল্পনা এখানে
                  পাবেন।
                </p>
              </div>
            )}
            {isActive === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">শিখবেন যা যা</h2>
                <p>
                  এই কোর্সে আপনি গণিত, বিজ্ঞান সহ বিভিন্ন বিষয়ের উপর গভীর জ্ঞান
                  অর্জন করবেন।
                </p>
              </div>
            )}
            {isActive === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">কমিউনিটি</h2>
                <p>
                  শিক্ষার্থী, মেন্টর এবং প্যারেন্টদের নিয়ে একটি সক্রিয়
                  কমিউনিটি থাকবে যেখানে সবাই একে অপরকে সহযোগিতা করবে।
                </p>
              </div>
            )}
            {isActive === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">যাদের জন্য</h2>
                <p>
                  এই কোর্স তাদের জন্য যারা SSC 2030 টার্গেট করে পড়াশোনা শুরু
                  করতে চায়।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="w-96 min-w-96">
        <div className="p-5 border rounded-xl sticky top-20">
          <p className="text-xl">কী কী থাকছে এই ক্যারিয়ার পাথে</p>
        </div>
      </div>
    </div>
  );
}
