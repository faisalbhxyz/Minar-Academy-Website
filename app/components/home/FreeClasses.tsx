"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const classes = [
  {
    id: 1,
    title: "ক্লাস ৬,৭,৮",
    image: "/images/school-bag.png",
    link: "https://forms.gle/1bRYkXLidmzDedQZ6",
  },
  {
    id: 2,
    title: "দাখিল/SSC (ক্লাস ৯,১০)",
    image: "/images/reading.png",
    link: "https://forms.gle/NnAnXBdwRYasXF8E8",
  },
  {
    id: 3,
    title: "আলিম/HSC (ক্লাস ৯,১০)",
    image: "/images/notepad.png",
    link: "https://forms.gle/Ugns2dtHQQ3g7FrW8",
  },
  {
    id: 4,
    title: "আলিম/HSC -২৫",
    image: "/images/goal.png",
    link: "https://forms.gle/UFxATrRCKjSVt9tp6",
  },
];

export default function FreeClasses() {
  return (
    <div className="py-20 mt-10 bg-slate-900 text-white px-3">
      <div className="relative wrapper px-10 bg-primary/20 border border-primary rounded-3xl py-14">
        <span className="absolute left-1/2 transform -translate-x-1/2 -top-5 bg-primary border border-primary px-5 py-2 rounded-full">
          ফ্রি ক্লাসসমূহ
        </span>
        <p className="text-center text-4xl md:text-5xl font-bold mb-10">
          ফ্রি ক্লাস করতে এখনই তোমার ক্লাসটি বেছে নাও
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {classes.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="cursor-pointer flex flex-col items-center gap-5 p-6 rounded-2xl border-2 transition duration-300 
                  bg-slate-800 border-slate-600"
            >
              <Image src={item.image} alt="icon" width={100} height={100} />
              <p className="text-xl font-semibold text-center">{item.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
