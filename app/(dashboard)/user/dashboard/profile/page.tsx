import { getStudentDetails } from "@/app/actions";
import StudentProfileForm from "@/app/components/dashboard/profile/StudentProfileForm";
import StudentProfileImage from "@/app/components/dashboard/profile/StudentProfileImage";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const stdDetails = await getStudentDetails(session);
  return (
    <div className="wrapper">
      <p className="text-lg font-medium mb-6">My Profile</p>

      <StudentProfileImage
        studentId={stdDetails.id}
        profileImage={stdDetails.profile_image}
        firstName={stdDetails.first_name}
        lastName={stdDetails.last_name}
        accessToken={session.accessToken}
      />

      <StudentProfileForm
        studentId={stdDetails.id}
        firstName={stdDetails.first_name}
        lastName={stdDetails.last_name}
        email={stdDetails.email}
        phone={stdDetails.phone}
        createdAt={stdDetails.created_at}
        accessToken={session.accessToken}
      />
    </div>
  );
}
