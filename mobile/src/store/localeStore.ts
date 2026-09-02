import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AppLocale } from "@/i18n/types";

const LOCALE_KEY = "minar_app_locale";

type LocaleState = {
  locale: AppLocale;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "bn",
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCALE_KEY);
      if (stored === "bn" || stored === "en") {
        set({ locale: stored });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  setLocale: async (locale) => {
    set({ locale });
    await AsyncStorage.setItem(LOCALE_KEY, locale);
  },
}));
