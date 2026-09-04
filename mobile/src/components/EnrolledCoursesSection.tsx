import React, { memo, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EnrolledCourseListItem } from "@/components/EnrolledCourseListItem";
import { useTranslation } from "@/i18n";
import type { EnrollmentWithProgress } from "@/lib/learningReport";
import { colors, radii, spacing } from "@/theme";

type CategoryFilter = {
  key: string;
  label: string;
  count: number;
};

type Props = {
  items: EnrollmentWithProgress[];
  certificateByCourseId?: Map<number, number>;
  onCoursePress: (slug: string) => void;
  onCertificatePress?: (certificateId: number) => void;
  onViewAll?: () => void;
  maxVisible?: number;
};

function getCourseCategory(
  item: EnrollmentWithProgress,
  otherLabel: string
): string {
  return (
    item.enrollment.course.general_settings?.category?.name?.trim() ||
    otherLabel
  );
}

function buildCategoryFilters(
  items: EnrollmentWithProgress[],
  otherLabel: string
): CategoryFilter[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = getCourseCategory(item, otherLabel);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b, "bn"))
    .map(([label, count]) => ({
      key: label,
      label,
      count,
    }));
}

export const EnrolledCoursesSection = memo(function EnrolledCoursesSection({
  items,
  certificateByCourseId,
  onCoursePress,
  onCertificatePress,
  onViewAll,
  maxVisible = 6,
}: Props) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");
  const otherLabel = t("common.other");
  const categories = useMemo(
    () => buildCategoryFilters(items, otherLabel),
    [items, otherLabel]
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter(
      (item) => getCourseCategory(item, otherLabel) === activeFilter
    );
  }, [activeFilter, items, otherLabel]);

  const visibleItems = filteredItems.slice(0, maxVisible);
  const hasMore = filteredItems.length > maxVisible;

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("common.enrolledCoursesSection.title")}</Text>
        {onViewAll && items.length > maxVisible ? (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={styles.viewAll}>{t("common.viewAll")}</Text>
          </Pressable>
        ) : null}
      </View>

      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <FilterChip
            label={t("common.enrolledCoursesSection.all")}
            count={items.length}
            active={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.key}
              label={category.label}
              count={category.count}
              active={activeFilter === category.key}
              onPress={() => setActiveFilter(category.key)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.list}>
        {visibleItems.map((item) => (
          <EnrolledCourseListItem
            key={item.enrollment.id}
            item={item}
            certificateId={certificateByCourseId?.get(item.enrollment.course.id)}
            onPressSlug={onCoursePress}
            onCertificatePress={onCertificatePress}
          />
        ))}
      </View>

      {hasMore && onViewAll ? (
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => [
            styles.moreBtn,
            pressed ? { opacity: 0.9 } : null,
          ]}
        >
          <Text style={styles.moreBtnText}>
            {t("common.enrolledCoursesSection.moreCoursesCount", {
              count: filteredItems.length - maxVisible,
            })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
});

function FilterChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : null,
        pressed ? { opacity: 0.9 } : null,
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
        {label} ({count})
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: colors.ink,
  },
  viewAll: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  filters: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: {
    backgroundColor: "#374151",
    borderColor: "#374151",
  },
  chipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.ink,
  },
  chipTextActive: {
    color: "#fff",
  },
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  moreBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  moreBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
});
