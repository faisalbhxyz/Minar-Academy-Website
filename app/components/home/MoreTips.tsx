"use client";

import Image from "next/image";
import React, { useState } from "react";

const sampleData = [
  {
    id: 1,
    title:
      "মাদ্রাসার স্টুডেন্টদের জন্য প্রথম ডিজিটাল লার্নিং প্ল্যাটফর্ম! সফলতা অর্জন করো মিনার একাডেমির সাথে!",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    videoId: "KcbIGEf599c", // Embedded YouTube video
  },
  {
    id: 2,
    title:
      "যদি বিশ্বাস করেন নিজের স্কিলের শক্তিতে,আজই যুক্ত হোন আমাদের সঙ্গে। ( এখনই কমেন্টের ফর্মটি পূরণ করুন)",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    videoId: "iXrTcdNYCHg", // Static image
  },
];

type VideoItem = {
  id: number;
  title: string;
  description: string;
  videoId: string;
};

export default function MoreTips() {
  return (
    <div className="wrapper rounded-3xl py-14 mt-10">
      <div className="mb-10 space-y-3">
        <p className="text-center text-4xl md:text-5xl font-bold">
          বছর জুড়ে অনলাইন ব্যাচে কী কী থাকছে?
        </p>
        <p className="text-center">
          সেরা শিক্ষকদের পরিচর্যায় দেশের যেকোন প্রান্ত থেকে অব্যাহত থাকুক
          পড়াশুনার অগ্রযাত্রা
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {sampleData.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

type VideoCardProps = {
  item: VideoItem;
};

function VideoCard({ item }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-3">
      <div className="w-full aspect-video rounded-lg overflow-hidden relative">
        {isPlaying ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=0&iv_load_policy=3`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="w-full h-full bg-black cursor-pointer relative"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
              alt={item.title}
              width={500}
              height={400}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-white/50 rounded-full w-16 h-16 animate-ping"></div>
              <button className="absolute w-16 h-16 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
      </div>
    </div>
  );
}
