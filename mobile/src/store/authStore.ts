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
  forceSignOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  bootstrapped: false,
  token: null,
  user: null,

  bootstrap: async () => {
    try {
      const [token, userJson] = await Promise.all([getToken(), getUserJson()]);
      if (token && userJson) {
        set({ token, user: JSON.parse(userJson) as Student });
        try {
          const fresh = await api.fetchStudentDetails();
          set({ user: fresh });
          await saveUserJson(JSON.stringify(fresh));
          void registerPushTokenWithBackend();
        } catch {
          // Keep cached user if offline / temporary failure.
        }
      } else {
        set({ token: null, user: null });
      }
    } finally {
      set({ bootstrapped: true });
    }
  },

  login: async (email, password) => {
    const result = await api.login(email.trim(), password);
    await saveToken(result.token);
    await saveUserJson(JSON.stringify(result.user));
    set({ token: result.token, user: result.user });
    void registerPushTokenWithBackend();
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

  forceSignOut: async () => {
    await clearSession();
    useOnboardingStore.getState().reset();
    set({ token: null, user: null });
  },
}));
