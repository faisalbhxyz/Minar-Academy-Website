"use client";

import Image from "next/image";
import React, { useState } from "react";
import YtVideoPlay from "../YtVideoPlay";

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
    title: "প্রযুক্তির এই যুগে, মাদ্রাসার শিক্ষার্থীরাও পাচ্ছে আধুনিক শিক্ষার পূর্ণ সুযোগ !",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    videoId: "JkzNo4opgyg", // Static image
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
          এক প্ল্যাটফর্মেই থাকছে শেখার সব সুবিধা
        </p>
        <p className="text-center">
          শ্রেষ্ঠ শিক্ষকদের অভিজ্ঞতায়, এখন ঘরে বসেই দেশের যেকোনো প্রান্ত থেকে
          এগিয়ে চলুক আপনার পড়াশোনা।
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
          <YtVideoPlay videoId={item.videoId} />
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
