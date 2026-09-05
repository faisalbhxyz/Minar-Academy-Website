import React, { useCallback, useState } from "react";
import {
  Alert,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getClassSubcategories } from "@/lib/classCategories";
import {
  freeLessonToPlayerParams,
  freeLessonWatchLabel,
  getMyFreeLessons,
  removeMyFreeLesson,
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
  onRemove,
}: {
  item: FreeLessonCatalogItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const statusLabel = freeLessonWatchLabel(item, t);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onRemove}
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
      <Pressable
        onPress={onRemove}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t("common.delete")}
        style={({ pressed }) => [pressed ? { opacity: 0.6 } : null]}
      >
        <Iconify icon="solar:trash-bin-trash-linear" size={20} color={colors.inkMuted} />
      </Pressable>
    </Pressable>
  );
}

export function FreeLessonsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const queryClient = useQueryClient();
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
    await Promise.all([
      user?.id ? myLessonsQuery.refetch() : Promise.resolve(),
      categoriesQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [categoriesQuery.refetch, myLessonsQuery.refetch, user?.id]);

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

  const confirmRemove = useCallback(
    (item: FreeLessonCatalogItem) => {
      Alert.alert(
        t("home.freeClasses.removeConfirmTitle"),
        t("home.freeClasses.removeConfirmMessage", { title: item.lessonTitle }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => {
              void (async () => {
                try {
                  await removeMyFreeLesson(item.lessonId);
                  await queryClient.invalidateQueries({
                    queryKey: ["my-free-lessons"],
                  });
                } catch {
                  Alert.alert(
                    t("home.freeClasses.hubTitle"),
                    t("home.freeClasses.removeFailed")
                  );
                }
              })();
            },
          },
        ]
      );
    },
    [queryClient, t]
  );

  return (
    <Screen
      loading={Boolean(user?.id) && myLessonsQuery.isLoading && !myLessonsQuery.data}
    >
      <AppHeader
        title={t("home.freeClasses.hubTitle")}
        onBack={() => navigation.goBack()}
      />

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
        ) : myLessonsQuery.isError ? (
          <EmptyState
            title={t("home.freeClasses.loadFailed")}
            message={t("home.freeClasses.emptyMessage")}
            actionLabel={t("common.retry")}
            onAction={() => void myLessonsQuery.refetch()}
          />
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
                onRemove={() => confirmRemove(item)}
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
