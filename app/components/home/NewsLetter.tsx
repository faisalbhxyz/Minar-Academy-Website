import Image from "next/image";
import React from "react";

export default function NewsLetter() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-10 bg-black text-white my-20 flex flex-col md:flex-row items-center justify-between rounded-3xl gap-10">
      <div className="w-full md:w-6/12 text-center md:text-left">
        <p className="text-2xl sm:text-3xl mb-5 leading-snug">
          সেরা শিক্ষকের তৈরি ক্লাস নোট এবং লেকচার সিট প্রয়োজন?
        </p>
        <button className="bg-primary text-white border border-primary px-6 py-2 rounded-full hover:bg-opacity-90 transition">
          ফ্রি ডাউনলোড করুন
        </button>
      </div>
      <div className="w-full md:w-5/12">
        <Image
          src="/images/pexels-pixabay-315791-note.jpg"
          alt="image"
          width={500}
          height={500}
          className="rounded-xl w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
