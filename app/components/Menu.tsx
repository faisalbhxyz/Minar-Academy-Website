import React from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";

const menu = [
  {
    name: "ক্লাস ৬-১২",
    submenu: [
      {
        name: "আলিম/HSC ১ম বর্ষ",
        link: "/academic/hsc",
      },
      {
        name: "আলিম/HSC ২য় বর্ষ",
        link: "/academic/hsc",
      },
      {
        name: "দাখিল/SSC ৯ম শ্রেণি",
        link: "/academic/class-9",
      },
      {
        name: "দাখিল/SSC ১০ম শ্রেণি",
        link: "/academic/class-10",
      },
    ],
  },
  {
    name: "সকল কোর্স",
    link: "/courses/all",
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
      {
        name: "শিক্ষকবৃন্দ",
        link: "/teachers",
      },
    ],
  },
];

export default function Menu() {
  return (
    <nav className="flex space-x-6 w-[480px]">
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
            <div className="absolute -left-1/2 p-2 w-52 bg-white rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-1 transition-all duration-200 z-10 overflow-hidden">
              {item.submenu.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.link}
                  className="block px-4 rounded-md py-2 text-sm text-gray-700 hover:bg-gray-100"
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
