import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";

import { colors, radii, spacing } from "@/theme";

type Props = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  fullWidth?: boolean;
};

export function OnboardingOptionCard({
  title,
  subtitle,
  icon,
  onPress,
  fullWidth,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Iconify
        icon="solar:alt-arrow-right-linear"
        size={20}
        color={colors.inkFaint}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
});
