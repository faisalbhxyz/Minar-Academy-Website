import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Iconify } from "react-native-iconify";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getClassSubcategories } from "@/lib/classCategories";
import {
  freeLessonToPlayerParams,
  freeLessonWatchLabel,
  getMyFreeLessons,
  type FreeLessonCatalogItem,
} from "@/lib/freeLessons";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, radii, spacing } from "@/theme";
import * as api from "@/api";

function AddedLessonCard({
  item,
  onPress,
}: {
  item: FreeLessonCatalogItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusLabel = freeLessonWatchLabel(item, t);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
    >
      <View style={styles.thumb}>
        {item.featuredImage ? (
          <Image
            source={{ uri: item.featuredImage }}
            style={styles.thumbImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.thumbTeal} />
        )}
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.lessonTitle}
        </Text>
        <Text style={styles.cardStatus}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

export function FreeLessonsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const preferredClassSlug = useOnboardingStore((s) => s.preferredClassSlug);
  const [refreshing, setRefreshing] = useState(false);

  const myLessonsQuery = useQuery({
    queryKey: ["my-free-lessons", user?.id],
    queryFn: getMyFreeLessons,
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.fetchCategories,
    staleTime: 10 * 60_000,
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) void myLessonsQuery.refetch();
    }, [myLessonsQuery.refetch, user?.id])
  );

  const lessons = myLessonsQuery.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) await myLessonsQuery.refetch();
    setRefreshing(false);
  }, [myLessonsQuery.refetch, user?.id]);

  const openSelect = useCallback(() => {
    const slug =
      preferredClassSlug ??
      user?.class_profile?.preferred_class_slug ??
      null;
    const classOptions = getClassSubcategories(categoriesQuery.data);
    const match =
      (slug ? classOptions.find((c) => c.slug === slug) : null) ??
      classOptions[0] ??
      null;
    navigation.navigate("FreeLessonSelect", {
      classSlug: match?.slug ?? slug ?? undefined,
      classTitle: match?.title,
    });
  }, [
    categoriesQuery.data,
    navigation,
    preferredClassSlug,
    user?.class_profile?.preferred_class_slug,
  ]);

  const playLesson = useCallback(
    (item: FreeLessonCatalogItem) => {
      navigation.navigate("LessonPlayer", freeLessonToPlayerParams(item));
    },
    [navigation]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("home.freeClasses.hubTitle")}</Text>
        <Pressable
          onPress={() => navigation.navigate("Search")}
          hitSlop={12}
          style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}
          accessibilityRole="button"
          accessibilityLabel={t("common.search")}
        >
          <Iconify icon="solar:magnifer-linear" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>
          {t("home.freeClasses.addedCount", { count: lessons.length })}
        </Text>

        {!user ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t("home.freeClasses.loginRequired")}</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t("home.freeClasses.hubEmpty")}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {lessons.map((item) => (
              <AddedLessonCard
                key={item.lessonId}
                item={item}
                onPress={() => playLesson(item)}
              />
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
          {t("home.freeClasses.addNewTitle")}
        </Text>

        <Pressable
          onPress={() => void openSelect()}
          style={({ pressed }) => [
            styles.browseCard,
            pressed ? { opacity: 0.92 } : null,
          ]}
        >
          <View style={styles.browseThumb} />
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>
              {t("home.freeClasses.browseMore")}
            </Text>
            <Text style={styles.browseSub}>
              {t("home.freeClasses.browseAllGrades")}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 26,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  sectionSpaced: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbTeal: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  cardStatus: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  emptyBox: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  browseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  browseThumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    backgroundColor: colors.ink,
  },
  browseSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
});
