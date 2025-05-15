import React from "react";

export default function ProgramPath({
  course,
}: {
  course: Course | undefined;
}) {
  const careerPath = [
    "১৫০+ প্রিরেকর্ডেড ভিডিও",
    "৪০+ লাইভ ক্লাস",
    "২৪+ কনসেপচুয়াল লাইভ ক্লাস",
    "ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্রজেক্টস",
    "ডেইলি ২টি সাপোর্ট সেশন",
    "মক ইন্টারভিউ",
    "লাইফটাইম অ্যাকসেস",
  ];

  return (
    <>
      <div className="p-5 border rounded-xl sticky top-20">
        <p className="text-xl">কী কী থাকছে এই ক্যারিয়ার পাথে</p>
        <ul className="space-y-4 mt-5">
          {careerPath.map((path, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="border w-6 h-6 rounded-full flex items-center justify-center">
                {idx + 1}
              </div>
              <p>{path}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5 mt-5">
          <p className="text-3xl font-semibold">৳{course?.price}</p>
          <p className="line-through text-gray-500">৳{course?.listPrice}.00</p>
        </div>
        <div className="flex items-center gap-3 h-10 my-3">
          <input
            type="text"
            placeholder="Apply Promo"
            className="border w-full h-full rounded-md px-3"
          />
          <button className=" px-6 py-2 text-white bg-primary rounded">
            Apply
          </button>
        </div>
        <button className="w-full px-6 py-2 bg-secondary text-white rounded">
          এনরোল করুন
        </button>
        <button className="w-full px-6 py-2 border border-gray-800 text-gray-800 rounded mt-3">
          Watch Demo Video
        </button>
      </div>
    </>
  );
}
