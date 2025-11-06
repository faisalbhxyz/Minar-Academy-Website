import LoginForm from "@/app/components/auth/LoginForm";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <div className="wrapper h-[42rem] flex items-center justify-center">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <LoginForm />
      </div>
      <div className="w-1/2 items-center justify-center hidden md:flex">
        <div className="flex flex-col items-center">
          <p className="text-xl font-semibold">
            শেখা থেমে না থাকুক — লাইভ ক্লাসে থাকুন নিয়মিত
          </p>
          <Image
            src={"/images/11314645.webp"}
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
