import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NewsLetter() {
  return (
    <div className="px-3">
      <div className="w-full wrapper p-6 sm:p-10 bg-slate-900 text-white my-20 flex flex-col md:flex-row items-center md:items-start justify-between rounded-3xl gap-10">
        {/* Mobile: image first, desktop: image second */}
        <div className="order-1 md:order-2">
          <Image
            src="/images/752326.png"
            alt="image"
            width={200} // Adjusted size for better mobile & desktop scaling
            height={200}
            className="w-20 md:w-80 rounded-xl h-auto object-cover"
          />
        </div>

        <div className="w-full text-center md:text-left order-2 md:order-1 flex flex-col gap-5">
          <p className="text-2xl sm:text-4xl leading-snug">
            সেরা শিক্ষকের তৈরি ক্লাস নোট এবং লেকচার সিট প্রয়োজন?
          </p>
          <Link
            href="/resource"
            className="bg-primary text-white border border-primary px-6 py-2 rounded-full hover:bg-opacity-90 transition w-max mx-auto md:mx-0"
          >
            ফ্রি ডাউনলোড করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
