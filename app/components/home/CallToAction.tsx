import Link from "next/link";
import React from "react";
import { BsFillTelephoneFill } from "react-icons/bs";

export default function CallToAction() {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-72 md:-bottom-32 w-10/12 md:w-9/12 bg-white shadow-lg p-3 rounded-xl">
      <div className="bg-primary/20 rounded-lg text-primary p-3">
        <p className="text-2xl mb-2">যেকোনো প্রয়োজনে কল করো এখনই</p>
        <p className="text-sm w-5/12">
          শিখো&apos;র কোর্স, তোমার পড়াশোনা, প্রোমো কোড অথবা যেকোনো জিজ্ঞাসায়
          কল করো
        </p>
        <div className="border-l-4 border-orange-500 pl-2 my-5">
          <p>সকাল ৯ টা - রাত ১০ টা</p>
        </div>
        <Link
          href="tel:01886929763"
          className="flex items-center gap-2 bg-primary text-white border border-primary px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <BsFillTelephoneFill /> 01886929763
        </Link>
        <p className="text-sm mt-1">* যেকোনো নাম্বার থেকে সাধারণ কল রেট *</p>
      </div>
    </div>
  );
}
