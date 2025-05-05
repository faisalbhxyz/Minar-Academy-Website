"use client";

import React, { useState } from "react";
import Menu from "./Menu";
import { BsFillTelephoneFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { AiOutlineMenu } from "react-icons/ai";
import useToggleStore from "@/hooks/useToggle";
import { RxCross2 } from "react-icons/rx";
import SearchIcon from "@/public/icons/SearchIcon";

export default function Header() {
  const { toggle } = useToggleStore();
  const [isSearch, setIsSearch] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-white">
      <header className="shadow">
        <div className="wrapper flex items-center justify-between py-2">
          <Link href="/dashboard" className="text-xl font-bold text-gray-800">
            <Image
              src={"/images/minar-academy-logo.png"}
              alt={"logo"}
              width={200}
              height={100}
              className="w-40 -ml-2"
            />
          </Link>
          <div className="items-center justify-center gap-5 hidden md:flex">
            <div className="relative w-full max-w-72 border focus-within:border-primary rounded-md flex items-center px-2">
              <span>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="ml-2 py-1.5 w-full text-sm outline-none"
              />
            </div>
            {/* <SelectClass /> */}
            <Menu />
          </div>
          <div className="flex items-center justify-end gap-3 md:gap-10">
            <button
              onClick={() => setIsSearch((prev) => !prev)}
              className="p-2 text-gray-500 md:hidden"
            >
              {isSearch ? <RxCross2 size={22} /> : <RiSearchLine size={22} />}
            </button>
            <Link
              href="tel:01886929763"
              className="p-2 text-primary flex items-center gap-1"
            >
              <BsFillTelephoneFill />
              <span className="hidden md:block">01886929763</span>
            </Link>
            <Link
              href="/auth/login"
              className="hidden md:block px-6 py-2 text-white bg-primary rounded"
            >
              লগ-ইন
            </Link>
            <button onClick={toggle} className="md:hidden">
              <AiOutlineMenu size={22} />
            </button>
          </div>
        </div>
      </header>
      {isSearch && (
        <div className="p-2 bg-white">
          <div className="relative w-full border focus-within:border-primary rounded-md flex items-center px-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="ml-2 py-1.5 w-full text-sm outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
