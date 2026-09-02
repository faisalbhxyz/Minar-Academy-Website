import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "@/i18n";
import { colors, spacing } from "@/theme";

const APP_VERSION =
  Constants.expoConfig?.version ??
  Constants.nativeAppVersion ??
  "1.0.0";

export function AppLoadingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.centerBlock}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel={t("common.brandName")}
        />
        <Text style={styles.welcome}>{t("common.welcomeLoading")}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.version}>
          {t("common.version", { version: APP_VERSION })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 220,
    height: 94,
    marginBottom: spacing.xl,
  },
  welcome: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.ink,
    textAlign: "center",
    maxWidth: 320,
  },
  footer: {
    alignItems: "center",
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  version: {
    fontSize: 13,
    color: colors.inkMuted,
    letterSpacing: 0.2,
  },
});
