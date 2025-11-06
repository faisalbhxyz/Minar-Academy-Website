import { getStudentDetails, getStudentEnrollments } from "@/app/actions";
import DashboardStats from "@/app/components/dashboard/new/DashboardStats";
import InProgressCourses from "@/app/components/dashboard/new/InProgressCourses";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const stdDetails = await getStudentDetails(session);
  const enrolledCourses = await getStudentEnrollments(session);

  return (
    <>
      <DashboardStats
        enrolled={stdDetails.enrollments.reduce((acc, curr) => acc + 1, 0)}
      />
      {enrolledCourses && enrolledCourses.length > 0 && (
        <InProgressCourses courses={enrolledCourses} />
      )}
    </>
  );
}

// import { getStudentDetails, getStudentEnrollments } from "@/app/actions";
// import Dashboard from "@/app/components/dashboard/Dashboard";
// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";
// import React from "react";

// export default async function page() {
//   const session = await auth();
//   if (!session) redirect("/auth/login");

//   const stdDetails = await getStudentDetails(session);
//   const enrolledCourses = await getStudentEnrollments(session);

//   console.log("ENROLLED COURSES", enrolledCourses);

//   return (
//     <Dashboard
//       session={session}
//       stdDetails={stdDetails}
//       enrolledCourses={enrolledCourses}
//     />
//   );
// }
