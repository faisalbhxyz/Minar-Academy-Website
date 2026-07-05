"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Session } from "next-auth";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

import useToggleStore from "@/hooks/useToggle";
import { doCretendentialLogout, getAllCategories } from "../actions";

type MenuItem = {
  name: string;
  link?: string;
  submenu?: { name: string; link: string }[];
};

const defaultMenu: MenuItem[] = [
  { name: "হোম", link: "/" },
  { name: "সকল কোর্স", link: "/courses/all" },
  { name: "আমাদের সম্পর্কে", link: "/about" },
  { name: "ফ্রি নোটস ও গাইড", link: "/resource" },
  { name: "শিক্ষক প্যানেল", link: "/teachers" },
  { name: "শিক্ষক হিসেবে যোগ দিন", link: "https://forms.gle/4DG5BjQpV3RoSUS18" },
];

const dashboardItems: MenuItem[] = [
  { name: "Dashboard", link: "/user/dashboard" },
  { name: "My Assignments", link: "/user/dashboard/assignments" },
  { name: "My Profile", link: "/user/dashboard/profile" },
  { name: "Enrolled Courses", link: "/user/dashboard/enrolled-courses" },
  { name: "Wishlist", link: "/user/dashboard/wishlist" },
  { name: "Reviews", link: "/user/dashboard/reviews" },
  { name: "My Quiz Attempts", link: "/user/dashboard/quizzes" },
  { name: "Order History", link: "/user/dashboard/orders" },
  { name: "Question & Answer", link: "/user/dashboard/qa" },
  { name: "Teachers Panel", link: "/teachers" },
  { name: "Settings", link: "/user/dashboard/settings" },
];

export default function PhoneMenu({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isShow, set } = useToggleStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

  // Load menu dynamically based on current path
  useEffect(() => {
    let mounted = true;

    const loadMenu = async () => {
      if (!mounted) return;

      // Show dashboard menu if path starts with /user and user is logged in
      if (pathname.startsWith("/user") && session?.accessToken) {
        setMenuItems(dashboardItems);
        return;
      }

      try {
        const categories = await getAllCategories();
        if (!Array.isArray(categories)) return;

        const classCategory = categories.find((cat: any) => cat.slug === "classes");

        let updatedMenu = [...defaultMenu];

        if (
          classCategory &&
          Array.isArray(classCategory.sub_categories) &&
          classCategory.sub_categories.length > 0
        ) {
          const classMenu: MenuItem = {
            name: classCategory.name || "ক্লাসসমূহ",
            submenu: classCategory.sub_categories.map((sub: any) => ({
              name: sub.name,
              link: `/courses/${sub.slug}`,
            })),
          };
          updatedMenu = [classMenu, ...defaultMenu];
        }

        setMenuItems(updatedMenu);
      } catch (err) {
        console.error("Menu load failed:", err);
      }
    };

    loadMenu();

    // Reset dropdowns when menu closes
    if (!isShow) setOpenDropdowns({});

    return () => {
      mounted = false;
    };
  }, [pathname, isShow, session]);

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogin = () => {
    set(false);
    router.push("/auth/login");
  };

  return (
    <>
      {/* Overlay */}
      {isShow && (
        <div
          className="fixed inset-0 z-[998] bg-black/40 md:hidden"
          onClick={() => set(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed top-0 left-0 z-[999] w-72 h-full bg-white p-5 overflow-y-auto transform transition-transform duration-300 md:hidden ${
          isShow ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" onClick={() => set(false)}>
            <Image
              src="/images/minar-academy-logo.png"
              alt="Logo"
              width={200}
              height={100}
              className="w-36"
            />
          </Link>
          <button
            className="text-3xl font-bold text-gray-600"
            onClick={() => set(false)}
          >
            &times;
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col space-y-2 mt-4">
          {pathname.startsWith("/user") && session?.accessToken && (
            <h3 className="text-gray-500 text-sm font-semibold mb-1 px-3">
              ড্যাশবোর্ড মেনু
            </h3>
          )}

          {menuItems.map((item, index) => (
            <div key={index} className="w-full">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="w-full flex items-center justify-between px-4 py-2 text-base font-medium text-gray-800 hover:bg-gray-100 rounded-md transition"
                  >
                    {item.name}
                    {openDropdowns[index] ? (
                      <HiChevronUp className="text-lg" />
                    ) : (
                      <HiChevronDown className="text-lg" />
                    )}
                  </button>
                  {openDropdowns[index] && (
                    <div className="pl-6 mt-1 flex flex-col space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.link}
                          onClick={() => set(false)}
                          className={`block text-sm px-3 py-1 rounded-md transition ${
                            pathname === subItem.link
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.link!}
                  onClick={() => set(false)}
                  className={`block px-4 py-2 rounded-md text-base font-medium transition ${
                    pathname === item.link
                      ? "bg-primary text-white"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="mt-8">
          {session && session.accessToken ? (
            <>
              <button
                onClick={() => {
                  router.push("/user/dashboard");
                  set(false);
                }}
                className="w-full py-2 mb-2 text-white bg-secondary rounded-md font-semibold"
              >
                Dashboard
              </button>
              <button
                onClick={async () => {
                  await doCretendentialLogout();
                  router.push("/");
                  set(false);
                }}
                className="w-full py-2 bg-red-500 text-white rounded-md font-semibold"
              >
                লগ-আউট
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-primary text-white rounded-md font-semibold"
            >
              লগ-ইন
            </button>
          )}
        </div>
      </div>
    </>
  );
}
