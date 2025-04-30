import ProgramCard from "@/app/components/courses/ProgramCard";
import Image from "next/image";
import React from "react";

const academicPrograms = [
  {
    id: 1,
    title: "ক্লাস ৬ - SSC '30",
    price: "৩০০০",
    image: "/images/sgfoxkd0w3zfrf2r7y0s.jpeg",
  },
  {
    id: 2,
    title: "ক্লাস ৬ - SSC '30",
    price: "৩০০০",
    image: "/images/sgfoxkd0w3zfrf2r7y0s.jpeg",
  },
  {
    id: 3,
    title: "ক্লাস ৬ - SSC '30",
    price: "৩০০০",
    image: "/images/sgfoxkd0w3zfrf2r7y0s.jpeg",
  },
];
const others = [
  {
    id: 1,
    title: "লক্ষ্য GPA-5 SSC '25 মডেল টেস্ট (বিজ্ঞান)",
    price: "৩০০০",
    image: "/images/20250303_LGPA5_SSC25_Course-Card_1040x584_cavkam.webp",
  },
];

export default function Page() {
  return (
    <>
      <div className="max-w-7xl mx-auto mt-20 pb-10 border-b border-gray-300">
        <p className="text-3xl font-semibold mb-6">একাডেমিক প্রোগ্রাম</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {academicPrograms.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-20 pt-10">
        <p className="text-3xl font-semibold mb-6">অ্যানিমেটেড লেসনস বান্ডেল</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {others.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
