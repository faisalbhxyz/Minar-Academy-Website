import AsyncStorage from "@react-native-async-storage/async-storage";

import { t } from "@/i18n";

export const COURSE_REVIEW_TAG_IDS = [
  "excellent_content",
  "excellent_teaching",
  "sufficient_resources",
  "others",
] as const;

export type CourseReviewTagId = (typeof COURSE_REVIEW_TAG_IDS)[number];

const TAG_LABEL_KEYS: Record<CourseReviewTagId, string> = {
  excellent_content: "reviews.tags.excellentContent",
  excellent_teaching: "reviews.tags.excellentTeaching",
  sufficient_resources: "reviews.tags.sufficientResources",
  others: "reviews.tags.others",
};

export function getCourseReviewTags() {
  return COURSE_REVIEW_TAG_IDS.map((id) => ({
    id,
    label: t(TAG_LABEL_KEYS[id]),
  }));
}

export function reviewPromptDismissedKey(courseSlug: string): string {
  return `review_prompt_dismissed:${courseSlug}`;
}

export async function isReviewPromptDismissed(
  courseSlug: string
): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(reviewPromptDismissedKey(courseSlug));
    return value === "1";
  } catch {
    return false;
  }
}

export async function dismissReviewPrompt(courseSlug: string): Promise<void> {
  try {
    await AsyncStorage.setItem(reviewPromptDismissedKey(courseSlug), "1");
  } catch {
    // Ignore storage errors.
  }
}

export function formatReviewStudentName(
  firstName?: string | null,
  lastName?: string | null
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || t("common.student");
}
