import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
} from "react-native";

import { useNavigateHome } from "@/navigation/useNavigateHome";
import { useTranslation } from "@/i18n";

type Size = "sm" | "md" | "lg";

type Props = {
  size?: Size;
  style?: StyleProp<ImageStyle>;
  /** Tap logo to open the Home tab (off on auth screens). */
  navigateHome?: boolean;
};

const SIZES: Record<Size, { width: number; height: number }> = {
  sm: { width: 132, height: 56 },
  md: { width: 168, height: 72 },
  lg: { width: 220, height: 94 },
};

export function BrandLogo({
  size = "sm",
  style,
  navigateHome = true,
}: Props) {
  const { t } = useTranslation();
  const goHome = useNavigateHome();

  const logo = (
    <Image
      source={require("../../assets/logo.png")}
      style={[SIZES[size], styles.logo, style]}
      resizeMode="contain"
      accessibilityLabel={t("common.brandName")}
    />
  );

  if (!navigateHome) {
    return logo;
  }

  return (
    <Pressable
      onPress={goHome}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t("common.goHome")}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {logo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.75,
  },
});
