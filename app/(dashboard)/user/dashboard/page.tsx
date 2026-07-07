import {
  getStudentDetails,
  getStudentEnrollments,
  getStudentCertificates,
} from "@/app/actions";
import DashboardStats from "@/app/components/dashboard/new/DashboardStats";
import DashboardQuizzesSection from "@/app/components/dashboard/new/DashboardQuizzesSection";
import InProgressCourses from "@/app/components/dashboard/new/InProgressCourses";
import DashboardCertificatesSection from "@/app/components/dashboard/certificates/DashboardCertificatesSection";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const stdDetails = await getStudentDetails(session);
  const [enrolledCourses, certificates] = await Promise.all([
    getStudentEnrollments(session),
    getStudentCertificates(session),
  ]);

  return (
    <>
      <DashboardStats
        enrolled={stdDetails.enrollments?.length ?? enrolledCourses.length}
        active={enrolledCourses.length}
        completed={certificates.length}
      />
      {certificates.length > 0 && (
        <DashboardCertificatesSection
          certificates={certificates}
          accessToken={session.accessToken}
        />
      )}
      {enrolledCourses && enrolledCourses.length > 0 && (
        <InProgressCourses courses={enrolledCourses} />
      )}
      <DashboardQuizzesSection />
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
