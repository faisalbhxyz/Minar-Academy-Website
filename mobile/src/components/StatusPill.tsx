import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme";

type Tone = "neutral" | "success" | "danger" | "warning" | "info";

type Props = {
  label: string;
  tone?: Tone;
};

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.primarySoft, fg: colors.inkMuted },
  success: { bg: "#e8f6ee", fg: colors.success },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  warning: { bg: colors.secondarySoft, fg: "#8a5a18" },
  info: { bg: "#e8f1fb", fg: "#185fa5" },
};

export function StatusPill({ label, tone = "neutral" }: Props) {
  const palette = TONE_STYLES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
  },
});
