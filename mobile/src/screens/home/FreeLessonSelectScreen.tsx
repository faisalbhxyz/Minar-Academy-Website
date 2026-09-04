import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import {
  FREE_LESSON_MAX_SELECT,
  fetchFreeLessonCatalog,
  mergeMyFreeLessons,
  type FreeLessonCatalogItem,
} from "@/lib/freeLessons";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

function LessonSelectRow({
  item,
  selected,
  disabled,
  onToggle,
}: {
  item: FreeLessonCatalogItem;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled && !selected}
      style={({ pressed }) => [
        styles.row,
        selected ? styles.rowSelected : null,
        pressed ? { opacity: 0.92 } : null,
        disabled && !selected ? styles.rowDisabled : null,
      ]}
    >
      <View style={[styles.checkbox, selected ? styles.checkboxOn : null]}>
        {selected ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {item.chapterTitle}
          </Text>
        </View>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.lessonTitle}
        </Text>
      </View>
    </Pressable>
  );
}

export function FreeLessonSelectScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "FreeLessonSelect">>();
  const queryClient = useQueryClient();
  const classSlug = route.params?.classSlug?.trim() || undefined;
  const classTitle =
    route.params?.classTitle?.trim() || t("home.freeClasses.defaultClass");

  const catalogQuery = useQuery({
    queryKey: ["free-lesson-catalog", classSlug ?? "all"],
    queryFn: () => fetchFreeLessonCatalog({ classSlug }),
    staleTime: 5 * 60_000,
  });

  const lessons = catalogQuery.data ?? [];
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedCount = selectedIds.length;
  const atLimit = selectedCount >= FREE_LESSON_MAX_SELECT;

  const selectedLessons = useMemo(
    () => lessons.filter((item) => selectedIds.includes(item.lessonId)),
    [lessons, selectedIds]
  );

  const toggle = useCallback((lessonId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(lessonId)) {
        return prev.filter((id) => id !== lessonId);
      }
      if (prev.length >= FREE_LESSON_MAX_SELECT) return prev;
      return [...prev, lessonId];
    });
  }, []);

  const onConfirm = useCallback(async () => {
    if (selectedLessons.length === 0) return;
    setSaving(true);
    try {
      const saved = await mergeMyFreeLessons(selectedLessons);
      await queryClient.invalidateQueries({ queryKey: ["my-free-lessons"] });
      navigation.replace("FreeLessonAdded", {
        lessons: saved.length > 0 ? saved : selectedLessons,
      });
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? ""
            )
          : "";
      Alert.alert(
        t("home.freeClasses.selectTitle"),
        message || t("home.freeClasses.saveFailed")
      );
    } finally {
      setSaving(false);
    }
  }, [navigation, queryClient, selectedLessons, t]);

  const renderItem = useCallback(
    ({ item }: { item: FreeLessonCatalogItem }) => {
      const selected = selectedIds.includes(item.lessonId);
      return (
        <LessonSelectRow
          item={item}
          selected={selected}
          disabled={atLimit}
          onToggle={() => toggle(item.lessonId)}
        />
      );
    },
    [atLimit, selectedIds, toggle]
  );

  return (
    <Screen
      loading={catalogQuery.isLoading && !catalogQuery.data}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => [styles.backRow, pressed ? { opacity: 0.7 } : null]}
        >
          <Text style={styles.backText}>
            ← {t("home.freeClasses.classSelected", { class: classTitle })}
          </Text>
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>

        <Text style={styles.title}>{t("home.freeClasses.selectTitle")}</Text>
        <Text style={styles.step}>{t("home.freeClasses.stepOf", { step: 2, total: 3 })}</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          {t("home.freeClasses.maxSelectNotice", { count: FREE_LESSON_MAX_SELECT })}
        </Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => String(item.lessonId)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState
            title={t("home.freeClasses.emptyTitle")}
            message={t("home.freeClasses.emptyMessage")}
          />
        }
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title={t("home.freeClasses.confirmCount", { count: selectedCount })}
          onPress={() => void onConfirm()}
          loading={saving}
          disabled={selectedCount === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  backRow: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.inkMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 26,
    lineHeight: 34,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  step: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  notice: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "#fff8f0",
    borderWidth: 1,
    borderColor: "#f0c9a0",
  },
  noticeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    lineHeight: 20,
    color: "#c56a1a",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rowSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Outfit_700Bold",
    lineHeight: 16,
  },
  rowCopy: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: "#eef1f0",
  },
  badgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.inkMuted,
  },
  rowTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
