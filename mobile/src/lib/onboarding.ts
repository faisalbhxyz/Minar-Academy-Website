import type { StudentClassProfile } from "@/types/api";

export type ClassLevel =
  | "class_five"
  | "class_six"
  | "class_seven"
  | "class_eight"
  | "class_9_10_ssc"
  | "hsc_beyond";

export type HscBatch = "hsc_2026" | "hsc_2027" | "hsc_2028" | "after_hsc";

export type Department = "science" | "business_studies" | "humanities";

export interface OnboardingProfile {
  classLevel: ClassLevel;
  hscBatch?: HscBatch;
  department?: Department;
  preferredClassSlug?: string;
  completedAt: string;
}

const CLASS_LEVEL_SET = new Set<string>([
  "class_five",
  "class_six",
  "class_seven",
  "class_eight",
  "class_9_10_ssc",
  "hsc_beyond",
]);

const HSC_BATCH_SET = new Set<string>([
  "hsc_2026",
  "hsc_2027",
  "hsc_2028",
  "after_hsc",
]);

const DEPARTMENT_SET = new Set<string>([
  "science",
  "business_studies",
  "humanities",
]);

export function isClassLevel(value: string): value is ClassLevel {
  return CLASS_LEVEL_SET.has(value);
}

export function isHscBatch(value: string): value is HscBatch {
  return HSC_BATCH_SET.has(value);
}

export function isDepartment(value: string): value is Department {
  return DEPARTMENT_SET.has(value);
}

/** Convert server class_profile → local onboarding profile (null if incomplete / invalid). */
export function onboardingProfileFromServer(
  remote: StudentClassProfile | null | undefined
): OnboardingProfile | null {
  if (!remote?.onboarding_completed || !isClassLevel(remote.class_level)) {
    return null;
  }
  return {
    classLevel: remote.class_level,
    hscBatch:
      remote.hsc_batch && isHscBatch(remote.hsc_batch)
        ? remote.hsc_batch
        : undefined,
    department:
      remote.department && isDepartment(remote.department)
        ? remote.department
        : undefined,
    preferredClassSlug: remote.preferred_class_slug ?? undefined,
    completedAt: remote.updated_at,
  };
}

export function toClassProfilePayload(profile: OnboardingProfile): {
  class_level: ClassLevel;
  hsc_batch: HscBatch | null;
  department: Department | null;
  preferred_class_slug?: string;
  onboarding_completed: true;
} {
  return {
    class_level: profile.classLevel,
    hsc_batch: profile.hscBatch ?? null,
    department: profile.department ?? null,
    preferred_class_slug: profile.preferredClassSlug,
    onboarding_completed: true,
  };
}

export const CLASS_LEVELS: ClassLevel[] = [
  "class_five",
  "class_six",
  "class_seven",
  "class_eight",
  "class_9_10_ssc",
  "hsc_beyond",
];

export const HSC_BATCHES: HscBatch[] = [
  "hsc_2026",
  "hsc_2027",
  "hsc_2028",
  "after_hsc",
];

export const DEPARTMENTS: Department[] = [
  "science",
  "business_studies",
  "humanities",
];

export function needsHscBatch(classLevel: ClassLevel): boolean {
  return classLevel === "hsc_beyond";
}

export function needsDepartment(
  classLevel: ClassLevel,
  batch?: HscBatch
): boolean {
  if (classLevel !== "hsc_beyond" || !batch) return false;
  return batch !== "after_hsc";
}

export function getOnboardingStepCount(
  classLevel?: ClassLevel,
  batch?: HscBatch
): number {
  if (!classLevel) return 1;
  if (!needsHscBatch(classLevel)) return 2;
  if (!batch) return 3;
  if (!needsDepartment(classLevel, batch)) return 3;
  return 4;
}

export function formatProfileSummary(
  profile: OnboardingProfile,
  t: (key: string) => string
): string {
  const parts: string[] = [];

  if (profile.hscBatch && profile.hscBatch !== "after_hsc") {
    parts.push(t(`onboarding.batch.${profile.hscBatch}.title`));
  } else if (profile.hscBatch === "after_hsc") {
    parts.push(t("onboarding.batch.after_hsc.title"));
  } else {
    parts.push(t(`onboarding.class.${profile.classLevel}`));
  }

  if (profile.department) {
    parts.push(`(${t(`onboarding.department.${profile.department}`)})`);
  }

  return parts.join(" ");
}
