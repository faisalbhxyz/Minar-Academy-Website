import RegisterForm from "@/app/components/auth/RegisterForm";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <div className="wrapper h-[42rem] flex items-center justify-center">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <RegisterForm />
      </div>
      <div className="w-1/2 items-center justify-center hidden md:flex">
        <div className="flex flex-col items-center">
          <p className="text-xl font-semibold">
            দৈনিক লাইভ ক্লাসে অংশ নিয়ে বজায় রাখুন রুটিনমাফিক পড়াশোনা
          </p>
          <Image
            src={"/images/routine_1722246136916.svg"}
            alt={"image"}
            width={400}
            height={400}
            className="w-96"
          />
        </div>
      </div>
    </div>
  );
}
