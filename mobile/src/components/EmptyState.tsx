import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme";
import { Button } from "@/components/Button";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: spacing.md,
    minWidth: 160,
  },
});
