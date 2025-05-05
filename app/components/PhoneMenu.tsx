"use client";

import React from "react";
import Link from "next/link";
import useToggleStore from "@/hooks/useToggle";
import Image from "next/image";
import SelectClass from "./SelectClass";
import { useRouter } from "next/navigation";

const menu = [
  {
    name: "সকল কোর্স",
    link: "/courses/all",
  },
  {
    name: "আমাদের সম্পর্কে",
    link: "/about",
  },
  {
    name: "ফ্রি নোটস ও গাইড",
    link: "/resource",
  },
  {
    name: "সার্টিফিকেট ভেরিফাই করুন",
    link: "/",
  },
  {
    name: "শিক্ষক হিসেবে যোগ দিন",
    link: "https://forms.gle/4DG5BjQpV3RoSUS18",
  },
];

export default function PhoneMenu() {
  const router = useRouter();

  const { isShow, set } = useToggleStore();

  const handleLogin = () => {
    set(false);
    router.push("/auth/login");
  };

  return (
    <div
      className={`fixed bg-white inset-0 md:hidden z-[999] p-6 space-y-4 transition-all duration-300 ease-in-out ${
        isShow ? "" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-10">
        <Link href={"/"} onClick={() => set(false)}>
          <Image
            src={"/images/minar-academy-logo.png"}
            alt={"logo"}
            width={200}
            height={100}
            className="w-40 -ml-5"
          />
        </Link>
        <button
          onClick={() => set(false)}
          className="text-4xl text-gray-600 select-none"
        >
          &times;
        </button>
      </div>
      <SelectClass />
      <nav className="flex flex-col space-y-3">
        {menu.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            onClick={() => set(false)}
            className="text-lg font-medium text-gray-800 hover:text-primary"
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogin}
        className="px-6 py-2 text-white bg-primary rounded"
      >
        লগ-ইন
      </button>
    </div>
  );
}
