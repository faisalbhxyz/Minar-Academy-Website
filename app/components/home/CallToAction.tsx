import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsFillTelephoneFill } from "react-icons/bs";

export default function CallToAction() {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-[42rem] md:-bottom-32 w-11/12 md:w-9/12 bg-white shadow-lg p-3 rounded-2xl">
      <div className="bg-primary/20 md:h-56 rounded-lg text-primary p-3 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="">
          <p className="text-2xl mb-2">যেকোনো প্রয়োজনে কল করো এখনই</p>
          <p className="text-sm">যেকোনো জিজ্ঞাসায় কল করো</p>
          <div className="border-l-4 border-orange-500 pl-2 my-5">
            <p>সকাল ১০ টা - রাত ১০ টা</p>
          </div>
          <Link
            href="tel:01886929763"
            className="flex w-fit items-center gap-2 bg-primary text-white border border-primary px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            <BsFillTelephoneFill /> 01886929763
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-5 h-full">
          <Image
            src={"/images/minar-acedemy.jpg"}
            alt={"image"}
            width={300}
            height={300}
            className="w-full md:w-56 h-72 md:h-full rounded-xl"
          />
          <div className="space-y-5 min-w-72">
            <div className="flex items-center justify-between gap-5 bg-red-200 p-3 rounded-xl">
              <div className="space-y-2">
                <p>ফ্রি ভিডিও লাইব্রেরি</p>
                <button className="bg-white px-4 py-2 rounded-md text-sm">
                  ভিডিও দেখো
                </button>
              </div>
              <Image
                src={"/images/youtube.png"}
                alt={"image"}
                width={100}
                height={100}
                className="w-12 h-12"
              />
            </div>
            <div className="flex items-center justify-between gap-5 bg-sky-200 p-3 rounded-xl">
              <div className="space-y-2">
                <p>মিনার একাডেমি ফেসবুক গ্রুপ</p>
                <button className="bg-white px-4 py-2 rounded-md text-sm">
                  গ্রুপে যুক্ত হও
                </button>
              </div>
              <Image
                src={"/images/facebook.png"}
                alt={"image"}
                width={100}
                height={100}
                className="w-12 h-12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
