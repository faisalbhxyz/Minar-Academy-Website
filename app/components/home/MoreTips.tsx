import React from "react";

const sampleData = [
  {
    id: 1,
    title: "সারা বছরে কী কী হচ্ছে অনলাইন ব্যাচে?",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    image: "/images/pexels-pixabay-267885.jpg",
  },
  {
    id: 2,
    title: "সারা বছরে কী কী হচ্ছে অনলাইন ব্যাচে?",
    description:
      "এক্সপার্ট টিচারদের লাইভ ক্লাস, গোছানো মাস্টারবুক, ও মডেল টেস্ট দিয়ে ঘরে বসেই ৬ষ্ঠ-১০ম শ্রেণির পড়াশোনার কমপ্লিট প্রিপারেশন!",
    image: "/images/pexels-pixabay-267885.jpg",
  },
];

export default function MoreTips() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-10 rounded-3xl py-14 mt-10">
        <div className="mb-10 space-y-3">
          <p className="text-center text-5xl font-bold">
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
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
