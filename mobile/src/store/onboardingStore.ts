import { create } from "zustand";

import * as api from "@/api";
import type {
  ClassLevel,
  Department,
  HscBatch,
  OnboardingProfile,
} from "@/lib/onboarding";
import {
  onboardingProfileFromServer,
  toClassProfilePayload,
} from "@/lib/onboarding";
import {
  getOnboardingProfile,
  isOnboardingPending,
  saveOnboardingProfile,
  setOnboardingPending,
} from "@/lib/onboardingStorage";
import {
  getSelectedClassSlug,
  saveSelectedClassSlug,
} from "@/lib/storage";
import type { StudentClassProfile } from "@/types/api";

type OnboardingState = {
  hydrated: boolean;
  pending: boolean;
  /** Local profile/slug changed but server PUT has not succeeded yet. */
  profileSyncPending: boolean;
  preferredSlugDirty: boolean;
  profile: OnboardingProfile | null;
  preferredClassSlug: string | null;
  draftClassLevel: ClassLevel | null;
  draftHscBatch: HscBatch | null;
  draftDepartment: Department | null;
  hydrate: (userId: number) => Promise<void>;
  applyServerProfile: (
    remote: StudentClassProfile | null | undefined
  ) => Promise<void>;
  /** Retry failed PUT(s) — call on app resume / login. */
  syncPendingToServer: () => Promise<void>;
  startOnboarding: (userId: number) => Promise<void>;
  setDraftClassLevel: (level: ClassLevel) => void;
  setDraftHscBatch: (batch: HscBatch) => void;
  setDraftDepartment: (department: Department) => void;
  completeOnboarding: (userId: number) => Promise<void>;
  setPreferredClassSlug: (slug: string) => Promise<void>;
  reset: () => void;
};

function applyLocalState(
  set: (partial: Partial<OnboardingState>) => void,
  profile: OnboardingProfile | null,
  pending: boolean,
  preferredClassSlug?: string | null
) {
  set({
    profile,
    pending,
    preferredClassSlug:
      preferredClassSlug ?? profile?.preferredClassSlug ?? null,
    draftClassLevel: profile?.classLevel ?? null,
    draftHscBatch: profile?.hscBatch ?? null,
    draftDepartment: profile?.department ?? null,
  });
}

async function applyAuthClassProfile(saved: StudentClassProfile) {
  const { useAuthStore } = await import("@/store/authStore");
  const user = useAuthStore.getState().user;
  if (user) {
    useAuthStore.getState().setUser({
      ...user,
      class_profile: saved,
    });
  }
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hydrated: false,
  pending: false,
  profileSyncPending: false,
  preferredSlugDirty: false,
  profile: null,
  preferredClassSlug: null,
  draftClassLevel: null,
  draftHscBatch: null,
  draftDepartment: null,

  hydrate: async (userId) => {
    try {
      let remote: StudentClassProfile | null = null;
      try {
        remote = await api.fetchClassProfile();
      } catch {
        // Offline / API failure — fall back to local cache below.
      }

      if (remote?.onboarding_completed) {
        const profile = onboardingProfileFromServer(remote);
        if (profile) {
          await saveOnboardingProfile(userId, profile);
          const { preferredSlugDirty } = get();
          const slug = preferredSlugDirty
            ? get().preferredClassSlug ?? remote.preferred_class_slug ?? null
            : remote.preferred_class_slug ??
              get().preferredClassSlug ??
              null;
          if (slug) {
            await saveSelectedClassSlug(slug);
          }
          applyLocalState(set, profile, false, slug);
          set({ profileSyncPending: false });
          if (preferredSlugDirty) {
            void get().syncPendingToServer();
          }
          return;
        }
      }

      const [localProfile, localPending] = await Promise.all([
        getOnboardingProfile(userId),
        isOnboardingPending(userId),
      ]);

      // One-time migrate: local exists, server empty.
      if (!remote && localProfile) {
        try {
          const saved = await api.updateClassProfile(
            toClassProfilePayload(localProfile)
          );
          const migrated = onboardingProfileFromServer(saved) ?? {
            ...localProfile,
            preferredClassSlug:
              saved.preferred_class_slug ?? localProfile.preferredClassSlug,
            completedAt: saved.updated_at,
          };
          await saveOnboardingProfile(userId, migrated);
          if (saved.preferred_class_slug) {
            await saveSelectedClassSlug(saved.preferred_class_slug);
          }
          applyLocalState(
            set,
            migrated,
            false,
            saved.preferred_class_slug ?? null
          );
          set({ profileSyncPending: false, preferredSlugDirty: false });
          return;
        } catch {
          applyLocalState(
            set,
            localProfile,
            false,
            localProfile.preferredClassSlug ?? null
          );
          set({ profileSyncPending: true });
          return;
        }
      }

      // Server has slug-only row (onboarding not finished).
      if (remote && !remote.onboarding_completed) {
        if (remote.preferred_class_slug && !get().preferredSlugDirty) {
          await saveSelectedClassSlug(remote.preferred_class_slug);
        }
        applyLocalState(
          set,
          null,
          true,
          get().preferredSlugDirty
            ? get().preferredClassSlug
            : remote.preferred_class_slug ?? null
        );
        await setOnboardingPending(userId, true);
        return;
      }

      // Local completed but server missing — keep local, mark dirty for retry.
      if (localProfile && !remote) {
        applyLocalState(
          set,
          localProfile,
          false,
          localProfile.preferredClassSlug ?? null
        );
        set({ profileSyncPending: true });
        return;
      }

      // No server profile — show onboarding (or keep register pending).
      const cachedSlug = await getSelectedClassSlug();
      applyLocalState(set, null, true, cachedSlug);
      if (localPending || !localProfile) {
        await setOnboardingPending(userId, true);
      }
    } finally {
      set({ hydrated: true });
    }
  },

  applyServerProfile: async (remote) => {
    const { preferredSlugDirty, profileSyncPending, profile, preferredClassSlug } =
      get();

    // Don't clobber local pending writes with stale server data.
    if (preferredSlugDirty || profileSyncPending) {
      if (remote?.onboarding_completed) {
        const parsed = onboardingProfileFromServer(remote);
        if (parsed && !profile) {
          applyLocalState(set, parsed, false, preferredClassSlug);
        }
      }
      void get().syncPendingToServer();
      return;
    }

    if (remote?.onboarding_completed) {
      const parsed = onboardingProfileFromServer(remote);
      if (parsed) {
        const { useAuthStore } = await import("@/store/authStore");
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          await saveOnboardingProfile(userId, parsed);
        }
        const slug =
          remote.preferred_class_slug ?? preferredClassSlug ?? null;
        if (remote.preferred_class_slug) {
          await saveSelectedClassSlug(remote.preferred_class_slug);
        }
        applyLocalState(set, parsed, false, slug);
        return;
      }
    }

    if (remote && !remote.onboarding_completed) {
      if (remote.preferred_class_slug) {
        await saveSelectedClassSlug(remote.preferred_class_slug);
      }
      applyLocalState(
        set,
        null,
        true,
        remote.preferred_class_slug ?? preferredClassSlug
      );
      return;
    }

    // null remote on resume — don't force pending if we already completed locally.
    if (profile) {
      applyLocalState(set, profile, false, preferredClassSlug);
      return;
    }
    applyLocalState(set, null, true, preferredClassSlug);
  },

  syncPendingToServer: async () => {
    const {
      profile,
      preferredClassSlug,
      profileSyncPending,
      preferredSlugDirty,
    } = get();

    if (profileSyncPending && profile) {
      try {
        const payload = {
          ...toClassProfilePayload(profile),
          preferred_class_slug:
            preferredClassSlug ?? profile.preferredClassSlug ?? undefined,
        };
        const saved = await api.updateClassProfile(payload);
        const migrated = onboardingProfileFromServer(saved) ?? {
          ...profile,
          preferredClassSlug:
            saved.preferred_class_slug ?? profile.preferredClassSlug,
          completedAt: saved.updated_at,
        };
        const { useAuthStore } = await import("@/store/authStore");
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          await saveOnboardingProfile(userId, migrated);
        }
        if (saved.preferred_class_slug) {
          await saveSelectedClassSlug(saved.preferred_class_slug);
        }
        applyLocalState(
          set,
          migrated,
          false,
          saved.preferred_class_slug ?? preferredClassSlug
        );
        set({ profileSyncPending: false, preferredSlugDirty: false });
        await applyAuthClassProfile(saved);
        return;
      } catch {
        return;
      }
    }

    if (preferredSlugDirty && preferredClassSlug) {
      try {
        const saved = await api.updateClassProfile({
          preferred_class_slug: preferredClassSlug,
        });
        set({
          preferredSlugDirty: false,
          preferredClassSlug:
            saved.preferred_class_slug ?? preferredClassSlug,
        });
        await applyAuthClassProfile(saved);
      } catch {
        // Keep dirty for next resume.
      }
    }
  },

  startOnboarding: async (userId) => {
    await setOnboardingPending(userId, true);
    set({
      pending: true,
      profile: null,
      preferredClassSlug: null,
      draftClassLevel: null,
      draftHscBatch: null,
      draftDepartment: null,
      profileSyncPending: false,
      preferredSlugDirty: false,
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

    let preferredSlug: string | null = null;
    let savedRemote: StudentClassProfile | null = null;
    let syncPending = false;

    try {
      savedRemote = await api.updateClassProfile(
        toClassProfilePayload(profile)
      );
      preferredSlug = savedRemote.preferred_class_slug ?? null;
      profile.preferredClassSlug = preferredSlug ?? undefined;
      profile.completedAt = savedRemote.updated_at;
    } catch {
      syncPending = true;
    }

    await saveOnboardingProfile(userId, profile);
    if (preferredSlug) {
      await saveSelectedClassSlug(preferredSlug);
    }

    set({
      profile,
      pending: false,
      preferredClassSlug: preferredSlug,
      profileSyncPending: syncPending,
      preferredSlugDirty: false,
    });

    if (savedRemote) {
      await applyAuthClassProfile(savedRemote);
    }
  },

  setPreferredClassSlug: async (slug) => {
    set({ preferredClassSlug: slug, preferredSlugDirty: true });
    await saveSelectedClassSlug(slug);

    try {
      const saved = await api.updateClassProfile({
        preferred_class_slug: slug,
      });
      set({
        preferredSlugDirty: false,
        preferredClassSlug: saved.preferred_class_slug ?? slug,
      });
      await applyAuthClassProfile(saved);
    } catch {
      // Local slug already saved; syncPendingToServer on resume.
    }
  },

  reset: () => {
    set({
      hydrated: false,
      pending: false,
      profileSyncPending: false,
      preferredSlugDirty: false,
      profile: null,
      preferredClassSlug: null,
      draftClassLevel: null,
      draftHscBatch: null,
      draftDepartment: null,
    });
  },
}));
