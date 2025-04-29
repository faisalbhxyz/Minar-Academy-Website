import Image from "next/image";
import React from "react";

export default function NewsLetter() {
  return (
    <div className="w-full max-w-6xl mx-auto p-10 bg-black text-white my-20 flex items-center justify-between rounded-3xl">
      <div className="w-5/12">
        <p className="text-3xl mb-5">
          সেরা শিক্ষকের তৈরি ক্লাস নোট এবং লেকচার সিট প্রয়োজন?
        </p>
        <button className="bg-primary text-white border border-primary px-5 py-2 rounded-full">
          ফ্রি ডাউনলোড করুন
        </button>
      </div>
      <div>
        <Image
          src={"/images/pexels-pixabay-315791-note.jpg"}
          alt={"image"}
          width={300}
          height={300}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
