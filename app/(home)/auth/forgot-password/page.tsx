import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import Image from "next/image";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div className="wrapper h-[42rem] flex items-center justify-center">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
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
