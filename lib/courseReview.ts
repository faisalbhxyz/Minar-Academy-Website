export const COURSE_REVIEW_TAGS = [
  { id: "excellent_content", label: "চমৎকার কনটেন্ট" },
  { id: "excellent_teaching", label: "চমৎকার শিক্ষণ পদ্ধতি" },
  { id: "sufficient_resources", label: "পর্যাপ্ত রিসোর্স" },
  { id: "others", label: "অন্যান্য" },
] as const;

export type CourseReviewTagId = (typeof COURSE_REVIEW_TAGS)[number]["id"];

export function reviewPromptDismissedKey(courseSlug: string): string {
  return `review_prompt_dismissed:${courseSlug}`;
}

export function isReviewPromptDismissed(courseSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(reviewPromptDismissedKey(courseSlug)) === "1";
  } catch {
    return false;
  }
}

export function dismissReviewPrompt(courseSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(reviewPromptDismissedKey(courseSlug), "1");
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function formatReviewStudentName(
  firstName?: string | null,
  lastName?: string | null
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "শিক্ষার্থী";
}

export function renderStarRating(rating: number): string {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}
