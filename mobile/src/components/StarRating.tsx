import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";

import { colors, spacing } from "@/theme";

type Props = {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
};

export function StarRating({
  rating,
  onChange,
  size = 36,
  readOnly = false,
}: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const active = value <= rating;
        return (
          <Pressable
            key={value}
            disabled={readOnly}
            onPress={() => onChange?.(value)}
            accessibilityRole="button"
            accessibilityLabel={`${value} স্টার`}
            hitSlop={6}
            style={({ pressed }) => [pressed && !readOnly ? styles.pressed : null]}
          >
            <Iconify
              icon={active ? "solar:star-bold" : "solar:star-line-duotone"}
              size={size}
              color={active ? colors.secondary : colors.border}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function StarRatingLabel({ rating }: { rating: number }) {
  return (
    <View style={styles.labelRow}>
      {Array.from({ length: 5 }, (_, index) => (
        <Iconify
          key={index}
          icon={index < rating ? "solar:star-bold" : "solar:star-line-duotone"}
          size={14}
          color={index < rating ? colors.secondary : colors.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
