import React, { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useTranslation } from "@/i18n";
import { formatProfileSummary } from "@/lib/onboarding";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, radii, spacing } from "@/theme";
import type { OnboardingStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen(_props: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const draftClassLevel = useOnboardingStore((s) => s.draftClassLevel);
  const draftHscBatch = useOnboardingStore((s) => s.draftHscBatch);
  const draftDepartment = useOnboardingStore((s) => s.draftDepartment);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const completedRef = useRef(false);

  const displayName = useMemo(() => {
    if (!user) return t("common.student");
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.join(" ").trim() || t("common.student");
  }, [user, t]);

  const profileSummary = useMemo(() => {
    if (!draftClassLevel) return "";
    return formatProfileSummary(
      {
        classLevel: draftClassLevel,
        hscBatch: draftHscBatch ?? undefined,
        department: draftDepartment ?? undefined,
        completedAt: new Date().toISOString(),
      },
      t
    );
  }, [draftClassLevel, draftHscBatch, draftDepartment, t]);

  useEffect(() => {
    if (!user?.id || !draftClassLevel || completedRef.current) return;
    completedRef.current = true;

    const timer = setTimeout(() => {
      void completeOnboarding(user.id);
    }, 2400);

    return () => clearTimeout(timer);
  }, [user?.id, draftClassLevel, completeOnboarding]);

  return (
    <OnboardingLayout progress={100} title="">
      <View style={styles.hero}>
        <View style={styles.confettiLeft} />
        <View style={styles.confettiRight} />

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            {user?.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.welcome}>
            {t("onboarding.welcome.greeting", { name: displayName })}
          </Text>

          {profileSummary ? (
            <Text style={styles.profileLine}>{profileSummary}</Text>
          ) : null}

          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t("onboarding.welcome.preparing")}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxxl,
    minHeight: 420,
  },
  confettiLeft: {
    position: "absolute",
    top: 80,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f472b6",
    transform: [{ rotate: "-12deg" }],
    opacity: 0.85,
  },
  confettiRight: {
    position: "absolute",
    top: 120,
    right: 28,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#facc15",
    opacity: 0.9,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatarWrap: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: "#fff",
  },
  welcome: {
    fontFamily: "Outfit_700Bold",
    fontSize: 24,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 32,
  },
  profileLine: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
  },
});
