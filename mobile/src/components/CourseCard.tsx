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
        {course.general_settings?.category?.name ? (
          <Text style={styles.category} numberOfLines={1}>
            {course.general_settings.category.name}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        {course.summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {course.summary}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardInner);

const styles = StyleSheet.create({
  card: {
    width: 260,
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
    height: 140,
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
    padding: spacing.lg,
    gap: 6,
  },
  category: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 17,
    color: colors.ink,
    lineHeight: 22,
  },
  summary: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
});
