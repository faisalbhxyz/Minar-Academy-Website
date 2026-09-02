import type { AppLocale, TranslationParams, TranslationTree } from "@/i18n/types";
import { bn } from "@/i18n/locales/bn";
import { en } from "@/i18n/locales/en";

const locales: Record<AppLocale, TranslationTree> = { bn, en };

function getNestedValue(tree: TranslationTree, path: string): string | undefined {
  const parts = path.split(".");
  let current: string | TranslationTree | undefined = tree;

  for (const part of parts) {
    if (!current || typeof current === "string") return undefined;
    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

export function translate(
  locale: AppLocale,
  key: string,
  params?: TranslationParams
): string {
  const value =
    getNestedValue(locales[locale], key) ??
    getNestedValue(locales.bn, key);

  if (value === undefined) return key;
  return interpolate(value, params);
}
