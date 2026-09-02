"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell } from "lucide-react";
import { markStudentNotificationRead } from "@/app/actions";

function notificationBody(notification: StudentNotification): string {
  return notification.body ?? notification.message ?? "";
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotificationsList({
  notifications: initial,
}: {
  notifications: StudentNotification[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleRead = (notification: StudentNotification) => {
    if (notification.is_read) {
      if (notification.link) router.push(notification.link);
      return;
    }

    startTransition(async () => {
      await markStudentNotificationRead(notification.id);
      if (notification.link) router.push(notification.link);
      else router.refresh();
    });
  };

  if (initial.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
        <Bell className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="font-medium text-gray-800">কোনো নোটিফিকেশন নেই</p>
        <p className="text-sm text-gray-500 mt-1">
          নতুন আপডেট এলে এখানে দেখাবে।
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
      {initial.map((notification) => (
        <li key={notification.id}>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleRead(notification)}
            className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition ${
              notification.is_read ? "bg-white" : "bg-indigo-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{notification.title}</p>
                {notificationBody(notification) ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {notificationBody(notification)}
                  </p>
                ) : null}
                <p className="text-xs text-gray-400 mt-2">
                  {formatWhen(notification.created_at)}
                </p>
              </div>
              {!notification.is_read ? (
                <span className="shrink-0 h-2 w-2 rounded-full bg-indigo-500 mt-2" />
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
