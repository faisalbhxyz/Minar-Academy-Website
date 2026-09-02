import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";

export type LearningReportPeriod = "7d" | "30d" | "90d";

function studentHeaders(accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (publicAppKey) headers["app-key"] = publicAppKey;
  return headers;
}

export async function fetchLearningReportClient(
  period: LearningReportPeriod,
  accessToken: string
): Promise<StudentLearningReportData | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  try {
    const res = await fetch(
      `${apiBase}/student/learning-report?period=${encodeURIComponent(period)}`,
      { headers: studentHeaders(accessToken), cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchNotificationsClient(
  accessToken: string
): Promise<StudentNotification[]> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/student/notifications`, {
      headers: studentHeaders(accessToken),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export async function markNotificationReadClient(
  notificationId: number,
  accessToken: string
): Promise<boolean> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return false;

  try {
    const res = await fetch(
      `${apiBase}/student/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: studentHeaders(accessToken),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchStudentOrdersClient(
  accessToken: string
): Promise<StudentOrder[]> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/student/orders`, {
      headers: studentHeaders(accessToken),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.data ?? [];
  } catch {
    return [];
  }
}
