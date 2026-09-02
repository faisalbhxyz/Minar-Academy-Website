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
  completedAt: string;
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
