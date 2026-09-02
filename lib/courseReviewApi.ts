import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";

function publicHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (publicAppKey) headers["app-key"] = publicAppKey;
  return headers;
}

function studentHeaders(accessToken: string): Record<string, string> {
  return {
    ...publicHeaders(),
    Authorization: `Bearer ${accessToken}`,
  };
}

export interface SubmitCourseReviewPayload {
  rating: number;
  comment?: string;
  tags?: string[];
}

export async function getCourseReviews(
  courseSlug: string,
  accessToken?: string
): Promise<CourseReviewsSummary | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  const headers = accessToken
    ? studentHeaders(accessToken)
    : publicHeaders();

  try {
    const res = await fetch(`${apiBase}/course/${courseSlug}/reviews`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function submitCourseReview(
  courseSlug: string,
  payload: SubmitCourseReviewPayload,
  accessToken: string
): Promise<CourseReview | null> {
  const apiBase = publicApiBaseUrl;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/course/${courseSlug}/review`, {
    method: "POST",
    headers: studentHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.message || json?.error || "রিভিউ জমা দেওয়া যায়নি।";
    throw new Error(message);
  }

  const json = await res.json().catch(() => null);
  return json?.data ?? null;
}
