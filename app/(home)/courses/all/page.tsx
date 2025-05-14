import ProgramCard from "@/app/components/courses/ProgramCard";
import React from "react";

const boardExams = [
  {
    id: 1,
    title: "লক্ষ্য GPA-5 SSC '25 মডেল টেস্ট (বিজ্ঞান)",
    price: "৩০০০",
    image: "/images/IMG_20250513_141238.jpg",
  },
];

const academicPrograms = [
  {
    id: 1,
    title: "ক্লাস ৬ - SSC '30",
    price: "৩০০০",
    image: "/images/sgfoxkd0w3zfrf2r7y0s.jpeg",
  },
];

export default function Page() {
  return (
    <>
      <div className="wrapper mt-20 pb-10 border-b border-gray-300">
        <p className="text-3xl font-semibold mb-6">বোর্ড পরীক্ষার প্রস্তুতি</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {boardExams.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="wrapper mb-20 pt-10">
        <p className="text-3xl font-semibold mb-6">একাডেমিক প্রোগ্রাম</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {academicPrograms.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
