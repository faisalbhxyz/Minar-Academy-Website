import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

type Variant = "light" | "dark";

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function LanguageToggle({ variant = "dark", style }: Props) {
  const { locale, setLocale } = useTranslation();
  const isDark = variant === "dark";

  return (
    <View
      style={[
        styles.wrap,
        isDark ? styles.wrapDark : styles.wrapLight,
        style,
      ]}
    >
      <Pressable
        onPress={() => void setLocale("bn")}
        style={[
          styles.option,
          locale === "bn" && (isDark ? styles.optionActiveDark : styles.optionActiveLight),
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: locale === "bn" }}
        accessibilityLabel="বাংলা"
      >
        <Text
          style={[
            styles.optionText,
            isDark ? styles.optionTextDark : styles.optionTextLight,
            locale === "bn" &&
              (isDark ? styles.optionTextActiveDark : styles.optionTextActiveLight),
          ]}
        >
          বাংলা
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void setLocale("en")}
        style={[
          styles.option,
          locale === "en" && (isDark ? styles.optionActiveDark : styles.optionActiveLight),
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: locale === "en" }}
        accessibilityLabel="English"
      >
        <Text
          style={[
            styles.optionText,
            isDark ? styles.optionTextDark : styles.optionTextLight,
            locale === "en" &&
              (isDark ? styles.optionTextActiveDark : styles.optionTextActiveLight),
          ]}
        >
          English
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: radii.pill,
    padding: 3,
    gap: 2,
  },
  wrapDark: {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  wrapLight: {
    backgroundColor: colors.border,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    minWidth: 72,
    alignItems: "center",
  },
  optionActiveDark: {
    backgroundColor: "#fff",
  },
  optionActiveLight: {
    backgroundColor: "#fff",
  },
  optionText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
  },
  optionTextDark: {
    color: "rgba(255,255,255,0.85)",
  },
  optionTextLight: {
    color: colors.inkMuted,
  },
  optionTextActiveDark: {
    color: colors.ink,
  },
  optionTextActiveLight: {
    color: colors.ink,
  },
});
