import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppHeader } from "@/components/AppHeader";
import { BrandLogo } from "@/components/BrandLogo";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

export function AboutScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <Screen
      scroll
      header={
        <AppHeader
          title={t("about.title")}
          onBack={() => navigation.goBack()}
        />
      }
      contentContainerStyle={styles.content}
    >
      <BrandLogo size="lg" />
      <Text style={styles.title}>{t("about.hero")}</Text>
      <Text style={styles.body}>{t("about.intro")}</Text>

      <View style={styles.story}>
        <Text style={styles.storyTitle}>{t("about.story.title")}</Text>
        <Text style={styles.storyBody}>{t("about.story.p1")}</Text>
        <Text style={styles.storyBody}>{t("about.story.p2")}</Text>
      </View>

      <View style={styles.mission}>
        <Text style={styles.missionTitle}>{t("about.vision.title")}</Text>
        <Text style={styles.missionBody}>{t("about.vision.body")}</Text>
      </View>

      <View style={[styles.mission, styles.missionAlt]}>
        <Text style={styles.missionTitle}>{t("about.mission.title")}</Text>
        <Text style={styles.missionBody}>{t("about.mission.body")}</Text>
      </View>

      <View style={styles.founder}>
        <Image
          source={require("../../../assets/founder.jpg")}
          style={styles.founderImage}
          contentFit="cover"
          accessibilityLabel={t("about.founder.imageLabel")}
        />
        <Text style={styles.founderTitle}>{t("about.founder.title")}</Text>
        <Text style={styles.founderBody}>{t("about.founder.p1")}</Text>
        <Text style={styles.founderBody}>{t("about.founder.p2")}</Text>
        <Text style={styles.founderBody}>{t("about.founder.p3")}</Text>
        <Text style={styles.founderBody}>{t("about.founder.p4")}</Text>
        <View style={styles.quoteBox}>
          <Text style={styles.quote}>{t("about.founder.quote")}</Text>
        </View>
        <Text style={styles.founderName}>{t("about.founder.name")}</Text>
        <Text style={styles.founderRole}>{t("about.founder.role")}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 24,
    color: colors.ink,
    lineHeight: 32,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 23,
  },
  story: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  storyTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  storyBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 22,
  },
  mission: {
    backgroundColor: colors.secondary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  missionAlt: {
    backgroundColor: colors.primaryDark,
  },
  missionTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  missionBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 22,
  },
  founder: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  founderImage: {
    width: "100%",
    height: 280,
    borderRadius: radii.md,
  },
  founderTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: colors.ink,
    lineHeight: 28,
  },
  founderBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  quoteBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  quote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    fontStyle: "italic",
  },
  founderName: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  founderRole: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkFaint,
  },
});
