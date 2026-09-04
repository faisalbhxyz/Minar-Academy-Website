import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { BrandLogo } from "@/components/BrandLogo";
import { CourseCardListItem } from "@/components/CourseCardListItem";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { colors, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

const ListSeparator = () => <View style={{ height: spacing.md }} />;

export function CoursesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "CoursesMain">>();
  const categorySlug = route.params?.categorySlug;
  const categoryName = route.params?.categoryName;
  const filter = route.params?.filter ?? "category";
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["courses-tab", filter, categorySlug ?? "all"],
    queryFn: () => {
      if (!categorySlug) return api.fetchCourses("all");
      if (filter === "menu") return api.fetchCoursesByMenu(categorySlug);
      return api.fetchCoursesByCategory(categorySlug);
    },
    staleTime: 3 * 60_000,
  });

  const title = useMemo(
    () => (categoryName ? categoryName : t("courses.allCourses")),
    [categoryName, t]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  }, [query.refetch]);

  const onPressSlug = useCallback(
    (slug: string) => navigation.navigate("CourseDetail", { slug }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NonNullable<typeof query.data>[number] }) => (
      <CourseCardListItem compact course={item} onPressSlug={onPressSlug} />
    ),
    [onPressSlug]
  );

  const keyExtractor = useCallback(
    (item: NonNullable<typeof query.data>[number]) => String(item.id),
    []
  );

  const onSearch = useCallback(
    () => navigation.navigate("Search"),
    [navigation]
  );

  return (
    <Screen loading={query.isLoading && !query.data}>
      <View style={styles.header}>
        <BrandLogo size="sm" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>
          {t("courses.foundCount", { count: query.data?.length ?? 0 })}
        </Text>
      </View>

      <FlatList
        data={query.data ?? []}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <EmptyState
            title={t("courses.empty.title")}
            message={t("courses.empty.message")}
            actionLabel={t("courses.empty.searchAction")}
            onAction={onSearch}
          />
        }
        renderItem={renderItem}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: 4,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
