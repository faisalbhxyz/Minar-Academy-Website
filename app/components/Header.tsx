import React from "react";
import Menu from "./Menu";
import { BsFillTelephoneFill } from "react-icons/bs";
import SelectClass from "./SelectClass";
import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export default function Header() {
  return (
    <header className="shadow">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-3 py-2 bg-white">
        <div className="text-xl font-bold text-gray-800">
          <Image
            src={"/images/minar-academy-logo.png"}
            alt={"logo"}
            width={200}
            height={100}
            className="w-40"
          />
        </div>
        <div className="items-center justify-center gap-5 hidden md:flex">
          <div className="relative w-full max-w-72 border focus-within:border-primary rounded-md flex items-center px-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="ml-2 py-1.5 w-full text-sm outline-none"
            />
          </div>
          <SelectClass />
          <Menu />
        </div>
        <div className="flex items-center justify-end gap-3 md:gap-10">
          <Link
            href="tel:01886929763"
            className="px-6 py-2 text-primary flex items-center gap-1"
          >
            <BsFillTelephoneFill />{" "}
            <span className="hidden md:block">01886929763</span>
          </Link>
          <button className="px-6 py-2 text-white bg-primary rounded">
            লগ-ইন
          </button>
        </div>
      </div>
    </header>
  );
}
