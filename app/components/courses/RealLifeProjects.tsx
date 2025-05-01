import Image from "next/image";
import React from "react";

const projects = [
  {
    id: 1,
    image: "/images/Root-Cau.png",
    description:
      "Root Cause Analysis and Dashboard Building with Microsoft Excel on Hotel Management Data",
  },
  {
    id: 2,
    image: "/images/dap3.png",
    description:
      "Statistical Data Analysis & Interactive Dashboard Building with Microsoft Excel on Public Health",
  },
  {
    id: 3,
    image: "/images/Analyzing_Job_Market_Data_using_Power_BI..png",
    description: "Healthcare Analytics Report Automation with Power BI",
  },
];

export default function RealLifeProjects() {
  return (
    <div className="mt-10">
      <p className="text-3xl font-semibold text-center mb-8">
        যেসব রিয়েল লাইফ প্রজেক্ট ডেভেলপ করবেন
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className="relative bg-gray-100 shadow-md rounded-xl p-4 overflow-hidden"
          >
            <Image
              src={project.image}
              alt="Project"
              width={100}
              height={100}
              className="w-20 h-20 rounded-lg mb-4"
            />
            <div className="absolute top-0 right-0 bg-sky-600 text-white px-3 py-2">
              #{idx > 10 ? idx + 1 : `0${idx + 1}`}
            </div>
            <p className="text-base text-gray-700">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
