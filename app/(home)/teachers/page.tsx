import Image from "next/image";
import React from "react";

const teachers = [
  {
    id: 1,
    name: "আনাস",
    image: "/images/C20250512_9186T01.JPG",
  },
  {
    id: 2,
    name: "আরিফুল ইসলাম মানিক",
    image: "/images/DSC05872.JPG",
  },
  {
    id: 3,
    name: "হেলাল মাহমুদ",
    image: "/images/DSC06315.JPG",
  },
  {
    id: 4,
    name: "জাসেদুল ইসলাম রিয়াদ",
    image: "/images/image-2025-05-13-at-18.20.12_fb64652e.jpg",
  },
  {
    id: 5,
    name: "মঈনুদ্দিন হাসান",
    image: "/images/DSC06813.JPG",
  },
  {
    id: 6,
    name: "মহসিন বিন রফিক",
    image: "/images/DSC06806.JPG",
  },
  {
    id: 7,
    name: "মুরাদ অভি",
    image: "/images/DSC06735.JPG",
  },
  {
    id: 8,
    name: "সাইদ",
    image: "/images/DSC06324.JPG",
  },
];

export default function Page() {
  return (
    <main className="wrapper my-20">
      <div className="flex items-center justify-center mb-8">
        <p className="text-5xl font-bold border-b-4 pb-3">শিক্ষকবৃন্দ</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl shadow p-5 flex flex-col items-center text-center transition transform hover:shadow-lg hover:scale-105 duration-300"
          >
            <div className="w-32 h-32 overflow-hidden rounded-full mb-4">
              <Image
                src={teacher.image}
                alt={teacher.name}
                width={158}
                height={158}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-semibold">{teacher.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
