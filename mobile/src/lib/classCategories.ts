import type { Category } from "@/types/api";

/** Class option for picker — mirrors web `classes` subcategory. */
export type ClassOption = {
  id: number;
  slug: string;
  title: string;
  icon_label?: string;
  icon_color?: string;
};

const CLASSES_CATEGORY_SLUG = "classes";

/** Web parity: category `classes` → `sub_categories` = class list. */
export function getClassSubcategories(
  categories: Category[] | undefined | null
): ClassOption[] {
  if (!categories?.length) return [];
  const parent = categories.find((c) => c.slug === CLASSES_CATEGORY_SLUG);
  const subs = parent?.sub_categories;
  if (!subs?.length) return [];
  return subs.map((sub) => ({
    id: sub.id,
    slug: sub.slug,
    title: sub.name,
  }));
}

export function findClassOption(
  classes: ClassOption[],
  slug: string | null | undefined
): ClassOption | null {
  if (!slug) return classes[0] ?? null;
  return classes.find((c) => c.slug === slug) ?? classes[0] ?? null;
}
