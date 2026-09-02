import React, { useMemo, useState } from "react";
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
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { colors, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

export function CoursesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "CoursesMain">>();
  const categorySlug = route.params?.categorySlug;
  const categoryName = route.params?.categoryName;
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["courses-tab", categorySlug ?? "all"],
    queryFn: () =>
      categorySlug
        ? api.fetchCoursesByCategory(categorySlug)
        : api.fetchCourses("all"),
  });

  const title = useMemo(
    () => (categoryName ? categoryName : t("courses.allCourses")),
    [categoryName, t]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

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
        keyExtractor={(item) => String(item.id)}
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
            title={t("courses.empty.title")}
            message={t("courses.empty.message")}
            actionLabel={t("courses.empty.searchAction")}
            onAction={() => navigation.navigate("Search")}
          />
        }
        renderItem={({ item }) => (
          <CourseCard
            compact
            course={item}
            onPress={() =>
              navigation.navigate("CourseDetail", { slug: item.slug })
            }
          />
        )}
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
