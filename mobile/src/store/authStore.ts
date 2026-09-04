import { create } from "zustand";

import * as api from "@/api";
import {
  registerPushTokenWithBackend,
  unregisterPushTokenFromBackend,
} from "@/lib/pushNotifications";
import {
  clearSession,
  getToken,
  getUserJson,
  saveToken,
  saveUserJson,
} from "@/lib/storage";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { Student } from "@/types/api";

type AuthState = {
  bootstrapped: boolean;
  token: string | null;
  user: Student | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: Student | null) => void;
  refreshStudentDetails: () => Promise<Student | null>;
  forceSignOut: () => Promise<void>;
};

async function syncClassProfileFromUser(user: Student | null) {
  if (!user?.id) return;
  // Nested profile from login/details — apply immediately when present.
  // Null → leave to hydrate() (local migrate / onboarding).
  if (user.class_profile) {
    await useOnboardingStore.getState().applyServerProfile(user.class_profile);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  bootstrapped: false,
  token: null,
  user: null,

  bootstrap: async () => {
    try {
      const [token, userJson] = await Promise.all([getToken(), getUserJson()]);
      if (token && userJson) {
        const cached = JSON.parse(userJson) as Student;
        set({ token, user: cached, bootstrapped: true });

        void (async () => {
          try {
            const fresh = await api.fetchStudentDetails();
            set({ user: fresh });
            await saveUserJson(JSON.stringify(fresh));
            await syncClassProfileFromUser(fresh);
            void registerPushTokenWithBackend();
          } catch {
            // Keep cached user if offline / temporary failure.
            await syncClassProfileFromUser(cached);
          }
        })();
        return;
      }

      set({ token: null, user: null, bootstrapped: true });
    } catch {
      set({ bootstrapped: true });
    }
  },

  login: async (email, password) => {
    const result = await api.login(email.trim(), password);
    await saveToken(result.token);
    await saveUserJson(JSON.stringify(result.user));
    set({ token: result.token, user: result.user });
    void registerPushTokenWithBackend();
    // App.tsx hydrate(userId) will fetch class-profile; also apply nested login payload now.
    await syncClassProfileFromUser(result.user);
  },

  logout: async () => {
    try {
      if (get().token) {
        await unregisterPushTokenFromBackend();
        await api.logout();
      }
    } catch {
      // Always clear local session.
    }
    await clearSession();
    useOnboardingStore.getState().reset();
    set({ token: null, user: null });
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      void saveUserJson(JSON.stringify(user));
    }
  },

  refreshStudentDetails: async () => {
    if (!get().token) return null;
    try {
      const fresh = await api.fetchStudentDetails();
      set({ user: fresh });
      await saveUserJson(JSON.stringify(fresh));
      // Always re-apply on resume so web/other-device changes sync (incl. null → onboarding).
      await useOnboardingStore
        .getState()
        .applyServerProfile(fresh.class_profile);
      return fresh;
    } catch {
      return get().user;
    }
  },

  forceSignOut: async () => {
    await clearSession();
    useOnboardingStore.getState().reset();
    set({ token: null, user: null });
  },
}));
