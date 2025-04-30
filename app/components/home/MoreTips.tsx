import React from "react";

const sampleData = [
  {
    id: 1,
    title: "সারা বছরে কী কী হচ্ছে অনলাইন ব্যাচে?",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    video: "https://www.youtube.com/embed/KcbIGEf599c", // Embedded YouTube video
  },
  {
    id: 2,
    title: "সারা বছরে কী কী হচ্ছে অনলাইন ব্যাচে?",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    video: "https://www.youtube.com/embed/KcbIGEf599c", // Static image
  },
];

export default function MoreTips() {
  return (
    <div className="max-w-[1400px] mx-auto rounded-3xl px-3 py-14 mt-10">
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
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-3"
          >
            <div className="w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src={`${item.video}?rel=0&modestbranding=1&controls=1&disablekb=1&fs=0&iv_load_policy=3`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
