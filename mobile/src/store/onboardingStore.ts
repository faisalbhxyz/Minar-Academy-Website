import { create } from "zustand";

import type {
  ClassLevel,
  Department,
  HscBatch,
  OnboardingProfile,
} from "@/lib/onboarding";
import {
  getOnboardingProfile,
  isOnboardingPending,
  saveOnboardingProfile,
  setOnboardingPending,
} from "@/lib/onboardingStorage";

type OnboardingState = {
  hydrated: boolean;
  pending: boolean;
  profile: OnboardingProfile | null;
  draftClassLevel: ClassLevel | null;
  draftHscBatch: HscBatch | null;
  draftDepartment: Department | null;
  hydrate: (userId: number) => Promise<void>;
  startOnboarding: (userId: number) => Promise<void>;
  setDraftClassLevel: (level: ClassLevel) => void;
  setDraftHscBatch: (batch: HscBatch) => void;
  setDraftDepartment: (department: Department) => void;
  completeOnboarding: (userId: number) => Promise<void>;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hydrated: false,
  pending: false,
  profile: null,
  draftClassLevel: null,
  draftHscBatch: null,
  draftDepartment: null,

  hydrate: async (userId) => {
    try {
      const [profile, pending] = await Promise.all([
        getOnboardingProfile(userId),
        isOnboardingPending(userId),
      ]);
      set({
        profile,
        pending: pending && !profile,
        draftClassLevel: profile?.classLevel ?? null,
        draftHscBatch: profile?.hscBatch ?? null,
        draftDepartment: profile?.department ?? null,
      });
    } finally {
      set({ hydrated: true });
    }
  },

  startOnboarding: async (userId) => {
    await setOnboardingPending(userId, true);
    set({
      pending: true,
      profile: null,
      draftClassLevel: null,
      draftHscBatch: null,
      draftDepartment: null,
    });
  },

  setDraftClassLevel: (level) => {
    set({ draftClassLevel: level, draftHscBatch: null, draftDepartment: null });
  },

  setDraftHscBatch: (batch) => {
    set({ draftHscBatch: batch, draftDepartment: null });
  },

  setDraftDepartment: (department) => {
    set({ draftDepartment: department });
  },

  completeOnboarding: async (userId) => {
    const { draftClassLevel, draftHscBatch, draftDepartment } = get();
    if (!draftClassLevel) return;

    const profile: OnboardingProfile = {
      classLevel: draftClassLevel,
      hscBatch: draftHscBatch ?? undefined,
      department: draftDepartment ?? undefined,
      completedAt: new Date().toISOString(),
    };

    await saveOnboardingProfile(userId, profile);
    set({ profile, pending: false });
  },

  reset: () => {
    set({
      hydrated: false,
      pending: false,
      profile: null,
      draftClassLevel: null,
      draftHscBatch: null,
      draftDepartment: null,
    });
  },
}));
