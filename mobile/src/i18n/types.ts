export type AppLocale = "bn" | "en";

export type TranslationParams = Record<string, string | number>;

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};
