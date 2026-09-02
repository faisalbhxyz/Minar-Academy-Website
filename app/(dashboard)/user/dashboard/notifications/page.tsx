import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NotificationsList from "@/app/components/dashboard/new/NotificationsList";
import { getStudentNotifications } from "@/app/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const notifications = await getStudentNotifications(session);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">নোটিফিকেশন</h1>
        <p className="text-gray-600 mt-1">আপনার সব আপডেট এক জায়গায়।</p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
