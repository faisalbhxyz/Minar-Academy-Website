import React from "react";
import Menu from "./Menu";
import { BsFillTelephoneFill } from "react-icons/bs";
import SelectClass from "./SelectClass";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-2 bg-white">
        <div className="md:w-1/2 text-xl font-bold text-gray-800">
          <Image
            src={"/images/minar-academy-logo.png"}
            alt={"logo"}
            width={200}
            height={100}
            className="w-40"
          />
        </div>
        <div className="w-1/2 items-center justify-center gap-5 hidden md:flex">
          <SelectClass />
          <Menu />
        </div>
        <div className="md:w-1/2 flex items-center justify-end gap-3 md:gap-10">
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
