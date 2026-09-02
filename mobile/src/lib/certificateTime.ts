import { toBengaliNumerals } from "@/lib/format";
import type { CourseProgressData } from "@/types/api";
import type { AppLocale } from "@/i18n/types";

const DEFAULT_MINUTES_PER_LESSON = 20;

export function parseCourseDurationHours(raw?: string | null): number | null {
  if (!raw?.trim()) return null;

  const value = raw.trim().toLowerCase();
  const hourMatch = value.match(
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h|ঘণ্টা|ঘন্টা)/
  );
  const minuteMatch = value.match(
    /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m|মিনিট)/
  );

  let hours = 0;
  if (hourMatch) hours += Number(hourMatch[1]);
  if (minuteMatch) hours += Number(minuteMatch[1]) / 60;

  if (!hourMatch && !minuteMatch) {
    const plainNumber = value.match(/^(\d+(?:\.\d+)?)/);
    if (plainNumber) hours = Number(plainNumber[1]);
  }

  return hours > 0 ? hours : null;
}

export function estimateCertificateRemainingSeconds(
  durationRaw: string | null | undefined,
  progress: CourseProgressData | null
): number | null {
  const percent = Math.min(100, Math.max(0, progress?.progress_percent ?? 0));
  if (percent >= 100) return 0;

  const durationHours = parseCourseDurationHours(durationRaw);
  if (durationHours != null) {
    return Math.round((durationHours * 3600 * (100 - percent)) / 100);
  }

  const lessonsTotal = progress?.lessons_total ?? 0;
  const lessonsDone = progress?.lessons_completed ?? 0;
  const remainingLessons = Math.max(0, lessonsTotal - lessonsDone);
  if (remainingLessons <= 0) return null;

  return remainingLessons * DEFAULT_MINUTES_PER_LESSON * 60;
}

export function formatEstimatedDuration(
  totalSeconds: number,
  locale: AppLocale
): string {
  const safeSeconds = Math.max(0, totalSeconds);
  if (safeSeconds <= 0) return "";

  const totalMinutes = Math.ceil(safeSeconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const formatCount = (count: number) =>
    locale === "bn" ? toBengaliNumerals(count) : String(count);

  if (days >= 7) {
    const weeks = Math.ceil(totalMinutes / (60 * 24 * 7));
    return `${formatCount(weeks)} ${locale === "bn" ? "সপ্তাহ" : "weeks"}`;
  }

  if (days >= 1) {
    return `${formatCount(days)} ${locale === "bn" ? "দিন" : "days"}`;
  }

  if (hours >= 1) {
    if (minutes > 0 && hours < 3) {
      return `${formatCount(hours)} ${locale === "bn" ? "ঘণ্টা" : "h"} ${formatCount(minutes)} ${locale === "bn" ? "মিনিট" : "m"}`;
    }
    return `${formatCount(hours)} ${locale === "bn" ? "ঘণ্টা" : "hours"}`;
  }

  return `${formatCount(Math.max(1, minutes))} ${locale === "bn" ? "মিনিট" : "minutes"}`;
}
