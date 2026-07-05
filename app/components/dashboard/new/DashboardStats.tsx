import Link from "next/link";
import { FaBookOpen } from "react-icons/fa";
import { IoIosSchool, IoMdTrophy } from "react-icons/io";

type StatItem = {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
};

export default function DashboardStats({
  enrolled,
  active,
  completed = 0,
}: {
  enrolled: number;
  active: number;
  completed?: number;
}) {
  const stats: StatItem[] = [
    {
      label: "Enrolled Courses",
      value: enrolled,
      icon: <FaBookOpen size={24} />,
      href: "/user/dashboard/enrolled-courses",
    },
    {
      label: "Active Courses",
      value: active,
      icon: <IoIosSchool size={30} />,
      href: "/user/dashboard/enrolled-courses",
    },
    {
      label: "Completed Courses",
      value: completed,
      icon: <IoMdTrophy size={30} />,
      href: "/user/dashboard/certificates",
    },
  ];

  return (
    <div className="bg-white w-full">
      <p className="text-xl font-semibold mb-4">Dashboard</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const card = (
            <div
              className={`text-center border p-4 rounded flex flex-col items-center justify-center ${
                stat.href
                  ? "hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                  : ""
              }`}
            >
              <div className="p-3 bg-purple-100 rounded-full w-fit">
                {stat.icon}
              </div>
              <p className="text-base font-bold text-purple-600 mt-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-700 mt-2 font-semibold">
                {stat.label}
              </p>
            </div>
          );

          return stat.href ? (
            <Link key={idx} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={idx}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
