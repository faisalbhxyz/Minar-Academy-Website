import { FaBookOpen } from "react-icons/fa";
import { IoIosSchool, IoMdTrophy } from "react-icons/io";

export default function DashboardStats({ enrolled }: { enrolled: number }) {
  const stats = [
    { label: "Enrolled Courses", value: enrolled, icon: <FaBookOpen size={24} /> },
    { label: "Active Courses", value: 0, icon: <IoIosSchool size={30} /> },
    { label: "Completed Courses", value: 0, icon: <IoMdTrophy size={30} /> },
  ];

  return (
    <div className="bg-white w-full">
      <p className="text-xl font-semibold mb-4">Dashboard</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="text-center border p-4 rounded flex flex-col items-center justify-center"
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
        ))}
      </div>
    </div>
  );
}
