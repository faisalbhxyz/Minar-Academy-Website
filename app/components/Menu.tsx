import React from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";

const menu = [
  {
    name: "সকল কোর্স",
    link: "/courses",
  },
  {
    name: "আমাদের সম্পর্কে",
    link: "/about",
  },
  {
    name: "আরো",
    submenu: [
      {
        name: "ফ্রি নোটস ও গাইড",
        link: "/free-nots-guide",
      },
      {
        name: "সার্টিফিকেট ভেরিফাই করুন",
        link: "/",
      },
      {
        name: "শিক্ষক হিসেবে যোগ দিন",
        link: "/",
      },
    ],
  },
];

export default function Menu() {
  return (
    <nav className="flex space-x-6">
      {menu.map((item, index) => (
        <div key={index} className="relative group">
          <div className="flex items-center gap-1">
            <Link
              href={item.link || ""}
              className="text-gray-800 hover:text-blue-600"
            >
              {item.name}
            </Link>
            {item.submenu && <IoIosArrowDown />}
          </div>
          {item.submenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200 z-10 overflow-hidden">
              {item.submenu.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.link}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
