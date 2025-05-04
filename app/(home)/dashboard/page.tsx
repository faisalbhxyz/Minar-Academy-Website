import Dashboard from "@/app/components/dashboard/Dashboard";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <div className="wrapper flex items-start my-5 gap-5">
      <div className="w-full">
        <div className="border p-5 rounded-lg flex items-center justify-between">
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
        <Dashboard />
      </div>
      <div className="w-96 min-w-96">
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-5">
            <Image
              src="/images/avatar.png"
              alt="image"
              width={100}
              height={100}
              className="w-14 h-14 rounded-md"
            />
            <div>
              <p>Name</p>
              <p>Class</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Image
              src="/images/Group_1125211977_1723542990003.jpeg"
              alt="image"
              width={50}
              height={50}
              className="w-5 h-5"
            />
            <p>Joined 10MS 30 minutes ago</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Image
              src="/images/book_1723543195014.jpeg"
              alt="image"
              width={50}
              height={50}
              className="w-5 h-5"
            />
            <p>Enrolled 0 courses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
