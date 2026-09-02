import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme";

export type ShortcutItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type Props = {
  items: ShortcutItem[];
};

export function ShortcutGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.card,
            pressed ? { opacity: 0.88 } : null,
          ]}
        >
          <View style={styles.iconWrap}>{item.icon}</View>
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: colors.ink,
    textAlign: "center",
  },
});
