"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { href: "/courses/all", label: "সকল ক্লাস" },
  { href: "/courses/admission", label: "এডমিশন" },
  { href: "/courses/hsc", label: "এইচএসসি" },
  { href: "/courses/c10", label: "ক্লাস ১০" },
  { href: "/courses/c9", label: "ক্লাস ৯" },
  { href: "/courses/c8", label: "ক্লাস ৮" },
  { href: "/courses/c7", label: "ক্লাস ৭" },
  { href: "/courses/c6", label: "ক্লাস ৬" },
];

export default function CoursesMenu() {
  const pathname = usePathname();

  return (
    <div className="shadow bg-white overflow-x-auto">
      <div className="wrapper min-w-3xl flex gap-10">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-5 border-b-2 font-medium ${
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
