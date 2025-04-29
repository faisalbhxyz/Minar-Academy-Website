"use client";

import React, { useState } from "react";

const classes = [
  {
    id: 1,
    title: "ক্লাস ৬,৭,৮",
  },
  {
    id: 2,
    title: "ক্লাস ৯,১০",
  },
  {
    id: 3,
    title: "SSC ২৫",
  },
  {
    id: 4,
    title: "HSC ২৫, ২৬",
  },
];

export default function FreeClasses() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  return (
    <div className="py-20 mt-10 bg-slate-900 text-white">
      <div className="relative max-w-7xl mx-auto px-10 bg-primary/20 border rounded-3xl py-14">
        <span className="absolute left-1/2 transform -translate-x-1/2 -top-5 bg-primary border border-primary px-5 py-2 rounded-full">
          ফ্রি ক্লাসসমূহ
        </span>
        <p className="text-center text-5xl font-bold mb-10">
          ফ্রি ক্লাস করতে এখনই তোমার ক্লাসটি বেছে নাও
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {classes.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedClass(item.id)}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition duration-300 ${
                selectedClass === item.id
                  ? "bg-primary border-primary text-white"
                  : "bg-slate-800 border-slate-600"
              }`}
            >
              <p className="text-xl font-semibold text-center">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
