import Image from "next/image";
import React from "react";

export default function Shortcuts() {
  return (
    <div className="min-w-2xl flex items-center justify-between">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/ROUTIN_1736923809981.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>আমার কোর্সসমূহ</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/Routine_Icon_1736923492164.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>রুটিন</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/Free_Class_Icon_1736923659825.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>ফ্রি ক্লাসসমূহ</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/Learning_Report_Icon_1736923528959.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>লার্নিং রিপোর্ট</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/Subscription_Icon_1736923546656.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>সাবস্ক্রিপশন</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/Call_16910_Icon_1736923567865.jpeg"
          alt="image"
          width={100}
          height={100}
          className="w-10 h-10"
        />
        <p>কল 16910</p>
      </div>
    </div>
  );
}
