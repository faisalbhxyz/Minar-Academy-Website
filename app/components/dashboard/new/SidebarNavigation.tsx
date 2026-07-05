"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, ClipboardList, FileText, Home, User, Award } from "lucide-react";

export default function SidebarNavigation() {
  const pathname = usePathname();

  const items = [
    { label: "Dashboard", link: "/user/dashboard", icon: <Home size={16} /> },
    {
      label: "Enrolled Courses",
      link: "/user/dashboard/enrolled-courses",
      icon: <BookOpen size={16} />,
    },
    {
      label: "My Assignments",
      link: "/user/dashboard/assignments",
      icon: <ClipboardList size={16} />,
    },
    {
      label: "My Profile",
      link: "/user/dashboard/profile",
      icon: <User size={16} />,
    },
    {
      label: "কুইজ",
      link: "/user/dashboard/quizzes",
      icon: <FileText size={16} />,
    },
    {
      label: "Certificates",
      link: "/user/dashboard/certificates",
      icon: <Award size={16} />,
    },
    // {
    //   label: "Wishlist",
    //   link: "/user/dashboard/wishlist",
    //   icon: <Heart size={16} />,
    // },
    // {
    //   label: "Reviews",
    //   link: "/user/dashboard/reviews",
    //   icon: <Star size={16} />,
    // },
    // {
    //   label: "My Quiz Attempts",
    //   link: "/user/dashboard/quizzes",
    //   icon: <FileText size={16} />,
    // },
    // {
    //   label: "Order History",
    //   link: "/user/dashboard/orders",
    //   icon: <ShoppingCart size={16} />,
    // },
    // {
    //   label: "Question & Answer",
    //   link: "/user/dashboard/qa",
    //   icon: <MessageSquare size={16} />,
    // },
    // {
    //   label: "Settings",
    //   link: "/user/dashboard/settings",
    //   icon: <Settings size={16} />,
    // },
  ];

  return (
    <aside className="md:block hidden w-64 shrink-0 bg-white border-r border-gray-200 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto p-4 space-y-2 text-sm font-medium text-gray-700">
      {items.map(({ label, link, icon }, idx) => (
        <Link
          key={idx}
          href={link}
          className={`flex items-center gap-2 px-2 py-2 rounded transition-colors duration-150 ${
            pathname === link || pathname.startsWith(`${link}/`)
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {icon}
          <span>{label}</span>
        </Link>
      ))}
    </aside>
  );
}
