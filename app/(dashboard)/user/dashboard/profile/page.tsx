import { getStudentDetails } from "@/app/actions";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/helpers";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const stdDetails = await getStudentDetails(session);
  return (
    <div className="wrapper">
      <p className="text-lg font-medium mb-6">My Profile</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 max-w-2xl">
        <div className="text-gray-600">Registration Date</div>
        <div className="text-gray-800 font-medium">
          {formatDate(stdDetails.created_at)}
        </div>

        <div className="text-gray-600">First Name</div>
        <div className="text-gray-800 font-medium">{stdDetails.first_name}</div>

        <div className="text-gray-600">Last Name</div>
        <div className="text-gray-800 font-medium">{stdDetails.last_name ?? "-"}</div>

        <div className="text-gray-600">Email</div>
        <div className="text-gray-800 font-medium">{stdDetails.email}</div>

        <div className="text-gray-600">Phone Number</div>
        <div className="text-gray-800 font-medium">{stdDetails.phone ?? "-"}</div>

        {/* <div className="text-gray-600">Skill/Occupation</div>
        <div className="text-gray-800 font-medium">{mockData.skill}</div>

        <div className="text-gray-600">Biography</div>
        <div className="text-gray-800 font-medium">{mockData.bio}</div> */}
      </div>
    </div>
  );
}
