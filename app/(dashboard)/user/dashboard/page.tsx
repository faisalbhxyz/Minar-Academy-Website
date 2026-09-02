import {
  getStudentDetails,
  getStudentCertificates,
  getStudentLearningReport,
} from "@/app/actions";
import DashboardStats from "@/app/components/dashboard/new/DashboardStats";
import DashboardQuizzesSection from "@/app/components/dashboard/new/DashboardQuizzesSection";
import InProgressCourses from "@/app/components/dashboard/new/InProgressCourses";
import LearningReportOverview from "@/app/components/dashboard/new/LearningReportOverview";
import DashboardCertificatesSection from "@/app/components/dashboard/certificates/DashboardCertificatesSection";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const stdDetails = await getStudentDetails(session);
  const [{ items, summary }, certificates] = await Promise.all([
    getStudentLearningReport(session),
    getStudentCertificates(session),
  ]);

  return (
    <>
      <DashboardStats
        enrolled={stdDetails.enrollments?.length ?? summary.enrolledCourses}
        active={summary.inProgressCourses || items.length}
        completed={summary.completedCourses}
      />
      {items.length > 0 ? (
        <LearningReportOverview summary={summary} items={items} />
      ) : null}
      {certificates.length > 0 && (
        <DashboardCertificatesSection
          certificates={certificates}
          accessToken={session.accessToken}
        />
      )}
      {items.length > 0 && <InProgressCourses items={items} />}
      <DashboardQuizzesSection />
    </>
  );
}
