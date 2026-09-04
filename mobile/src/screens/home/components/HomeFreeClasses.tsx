import React, { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { useTranslation } from "@/i18n";
import type { FreeLessonCatalogItem } from "@/lib/freeLessons";
import { radii, spacing } from "@/theme";

const PREVIEW_COUNT = 2;

type Props = {
  lessons: FreeLessonCatalogItem[];
  onPressLesson?: (lesson: FreeLessonCatalogItem) => void;
  onOpenSelect: () => void;
};

function lessonSubtitle(item: FreeLessonCatalogItem): string {
  const chapter = item.chapterTitle?.trim() ?? "";
  const course = item.courseTitle?.trim() ?? "";
  if (chapter && course) return `${chapter} · ${course}`;
  return chapter || course;
}

const FreeClassRow = memo(function FreeClassRow({
  item,
  onPress,
}: {
  item: FreeLessonCatalogItem;
  onPress: () => void;
}) {
  const subtitle = lessonSubtitle(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
    >
      <View style={styles.thumb}>
        {item.featuredImage ? (
          <Image
            source={{ uri: item.featuredImage }}
            style={styles.thumbImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={String(item.lessonId)}
            transition={160}
          />
        ) : (
          <LinearGradient
            colors={["#1f5c55", "#0d3d38"]}
            style={styles.thumbImage}
          />
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.lessonTitle}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

export const HomeFreeClasses = memo(function HomeFreeClasses({
  lessons,
  onPressLesson,
  onOpenSelect,
}: Props) {
  const { t } = useTranslation();

  const visible = useMemo(() => lessons.slice(0, PREVIEW_COUNT), [lessons]);
  const remaining = Math.max(0, lessons.length - PREVIEW_COUNT);

  const onFooterPress = useCallback(() => {
    onOpenSelect();
  }, [onOpenSelect]);

  const onRowPress = useCallback(
    (item: FreeLessonCatalogItem) => {
      if (onPressLesson) {
        onPressLesson(item);
        return;
      }
      onOpenSelect();
    },
    [onOpenSelect, onPressLesson]
  );

  if (lessons.length === 0) return null;

  const footerLabel =
    remaining > 0
      ? t("home.freeClasses.seeMore", { count: remaining })
      : t("home.freeClasses.viewAll");

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t("home.freeClasses.badge")}</Text>
        </View>
        <Text style={styles.heading}>{t("home.freeClasses.title")}</Text>

        <View style={styles.list}>
          {visible.map((item) => (
            <FreeClassRow
              key={item.lessonId}
              item={item}
              onPress={() => onRowPress(item)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <Pressable
          onPress={onFooterPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.footerBtn,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Text style={styles.footerText}>{footerLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: "#134e4a",
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(167, 220, 210, 0.45)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  badgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#c8ebe4",
  },
  heading: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
    color: "#ffffff",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(167, 220, 210, 0.18)",
  },
  rowPressed: {
    opacity: 0.9,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: "#0d3d38",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    color: "#ffffff",
  },
  rowSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#9bbdb6",
  },
  divider: {
    borderStyle: "dashed",
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "rgba(167, 220, 210, 0.28)",
    marginTop: spacing.xs,
  },
  footerBtn: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  footerText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#7dd3c0",
  },
});
