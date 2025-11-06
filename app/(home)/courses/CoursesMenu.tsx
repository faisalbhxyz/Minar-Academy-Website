"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function CoursesMenu({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();

  const links = [
    { href: "/courses/all", label: "সকল ক্লাস" },
    ...categories.map((category) => ({
      href: `/courses/category/${category.slug}`,
      label: category.name,
    })),
  ];

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
