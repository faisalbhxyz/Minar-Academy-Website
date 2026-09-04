import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Text onPress={onAction} style={styles.action}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  action: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
    paddingBottom: 2,
  },
});
