import { translate } from "@/i18n/translate";
import type { AppLocale, TranslationParams } from "@/i18n/types";
import { useLocaleStore } from "@/store/localeStore";

export type { AppLocale } from "@/i18n/types";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = (key: string, params?: TranslationParams) =>
    translate(locale, key, params);

  return { t, locale, setLocale };
}

export function t(key: string, params?: TranslationParams): string {
  return translate(useLocaleStore.getState().locale, key, params);
}
