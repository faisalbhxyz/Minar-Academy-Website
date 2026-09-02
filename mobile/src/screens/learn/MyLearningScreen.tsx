import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { AppHeader } from "@/components/AppHeader";
import { EnrolledCourseCard } from "@/components/EnrolledCourseCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import * as api from "@/api";
import {
  buildCertificateIdByCourseId,
  fetchEnrollmentsWithProgress,
  type EnrollmentWithProgress,
} from "@/lib/learningReport";
import { colors, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

type CategoryFilter = {
  key: string;
  label: string;
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
    .map(([label]) => ({
      key: label,
      label,
    }));
}

export function MyLearningScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const query = useQuery({
    queryKey: ["learning-report"],
    queryFn: async () => {
      const [items, certificates] = await Promise.all([
        fetchEnrollmentsWithProgress(),
        api.fetchStudentCertificates(),
      ]);
      return {
        items,
        certificateByCourseId: buildCertificateIdByCourseId(certificates),
      };
    },
    staleTime: 2 * 60_000,
  });

  const items = query.data?.items ?? [];
  const certificateByCourseId = query.data?.certificateByCourseId;
  const categories = useMemo(
    () => buildCategoryFilters(items, t("common.other")),
    [items, t]
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter(
      (item) => getCourseCategory(item, t("common.other")) === activeFilter
    );
  }, [activeFilter, items, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  return (
    <Screen
      loading={query.isLoading && !query.data}
      header={
        <AppHeader
          title={t("common.myCourses")}
          onBack={() => navigation.goBack()}
          includeSafeTop
        />
      }
    >
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <CategoryTab
            label={t("common.all")}
            active={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
          />
          {categories.map((category) => (
            <CategoryTab
              key={category.key}
              label={category.label}
              active={activeFilter === category.key}
              onPress={() => setActiveFilter(category.key)}
            />
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.enrollment.id)}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState
            title={t("learning.empty.title")}
            message={t("learning.empty.message")}
            actionLabel={t("learning.empty.action")}
            onAction={() => navigation.getParent()?.navigate("Courses")}
          />
        }
        renderItem={({ item }) => (
          <EnrolledCourseCard
            item={item}
            certificateId={certificateByCourseId?.get(item.enrollment.course.id)}
            onPress={() =>
              navigation.navigate("CourseDetail", {
                slug: item.enrollment.course.slug,
              })
            }
            onCertificatePress={(certificateId) =>
              navigation.navigate("CertificateDetail", { certificateId })
            }
          />
        )}
      />
    </Screen>
  );
}

function CategoryTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active ? styles.tabActive : null,
        pressed ? { opacity: 0.85 } : null,
      ]}
    >
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.inkMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: "DMSans_500Medium",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
});
