import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { formatPrice } from "@/lib/format";
import { colors, radii, spacing } from "@/theme";
import type { CourseDetails } from "@/types/api";

type Props = {
  course: CourseDetails;
  onPress: () => void;
  compact?: boolean;
};

function CourseCardInner({ course, onPress, compact }: Props) {
  const price = formatPrice(
    course.pricing_model,
    course.sale_price,
    course.regular_price
  );
  const categoryName = course.general_settings?.category?.name?.trim() ?? "";
  const summary = course.summary?.trim() ?? "";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.imageWrap}>
        {course.featured_image ? (
          <Image
            source={{ uri: course.featured_image }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={course.slug}
            transition={180}
          />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.image}
          />
        )}
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.category} numberOfLines={1}>
          {categoryName}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
      </View>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardInner);

const CARD_IMAGE_HEIGHT = 140;
const CATEGORY_LINE_HEIGHT = 16;
const TITLE_LINE_HEIGHT = 22;
const SUMMARY_LINE_HEIGHT = 18;
/** Image + meta padding + reserved text slots — keeps every card the same size. */
const CARD_HEIGHT =
  CARD_IMAGE_HEIGHT +
  spacing.lg * 2 +
  6 * 2 +
  CATEGORY_LINE_HEIGHT +
  TITLE_LINE_HEIGHT * 2 +
  SUMMARY_LINE_HEIGHT * 2;

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: CARD_HEIGHT,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    width: "100%",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  imageWrap: {
    height: CARD_IMAGE_HEIGHT,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pricePill: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  priceText: {
    color: "#fff",
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
  },
  meta: {
    flex: 1,
    padding: spacing.lg,
    gap: 6,
  },
  category: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    lineHeight: CATEGORY_LINE_HEIGHT,
    height: CATEGORY_LINE_HEIGHT,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 17,
    color: colors.ink,
    lineHeight: TITLE_LINE_HEIGHT,
    height: TITLE_LINE_HEIGHT * 2,
  },
  summary: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: SUMMARY_LINE_HEIGHT,
    height: SUMMARY_LINE_HEIGHT * 2,
  },
});
