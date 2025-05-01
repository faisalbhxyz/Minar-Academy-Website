import Image from "next/image";
import React from "react";

export default function Blueprint() {
  return (
    <div className="max-w-[400px] bg-white rounded-2xl shadow-lg overflow-hidden space-y-4 mt-10">
      <div className="w-full h-48 relative">
        <Image
          src="/images/da_bp.jpg"
          alt="Blueprint image"
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">
          Blueprint ডাউনলোড করুন
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          এক্সপার্ট মেন্টর প্যানেলের গাইডেন্সে জব-রেডি ডেটা অ্যানালিস্ট হওয়ার
          কমপ্লিট গাইডলাইনসহ আরো ডিটেইলস জানতে এখনি ডাউনলোড করুন এই Blueprint।
        </p>
        <button
          type="button"
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition duration-200"
        >
          ডাউনলোড করুন
        </button>
      </div>
    </div>
  );
}
