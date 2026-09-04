import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ProfileMenuRow } from "@/components/profile/ProfileMenuRow";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { openHelpCenterChannel } from "@/lib/helpCenter";
import { fullName } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, spacing } from "@/theme";

type ProfileNav = NativeStackScreenProps<
  AppStackParamList,
  "ProfileMain"
>["navigation"];

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t("profile.title")}</Text>
      </View>

      <View style={styles.card}>
        {user?.profile_image ? (
          <Image
            source={{ uri: user.profile_image }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>
              {(user?.first_name?.[0] || "M").toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>
          {fullName(user?.first_name, user?.last_name)}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("profile.account")}</Text>
          <Pressable
            onPress={() => void onLogout()}
            disabled={loading}
            hitSlop={8}
            style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}
          >
            <Text style={styles.logoutLink}>
              {loading ? "…" : t("profile.signOut")}
            </Text>
          </Pressable>
        </View>
        <View style={styles.menuCard}>
          <ProfileMenuRow
            icon="solar:user-circle-bold"
            iconColor="#ea580c"
            iconBg="#fff7ed"
            label={t("profile.profileInfo")}
            onPress={() => navigation.navigate("EditProfile")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:lock-password-bold"
            iconColor="#2563eb"
            iconBg="#eff6ff"
            label={t("profile.changePassword.title")}
            onPress={() => navigation.navigate("ChangePassword")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:devices-bold"
            iconColor="#16a34a"
            iconBg="#f0fdf4"
            label={t("profile.deviceManager.title")}
            onPress={() => navigation.navigate("DeviceManager")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:phone-calling-bold"
            iconColor="#16a34a"
            iconBg="#f0fdf4"
            label={t("profile.call")}
            onPress={() => openHelpCenterChannel("call")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:global-bold"
            iconColor="#0d9488"
            iconBg="#f0fdfa"
            label={t("profile.language")}
            showChevron={false}
            trailing={<LanguageToggle variant="light" />}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.myItems")}</Text>
        <View style={styles.menuCard}>
          <ProfileMenuRow
            icon="solar:book-2-bold"
            iconColor="#2563eb"
            iconBg="#eff6ff"
            label={t("common.myCourses")}
            onPress={() => navigation.navigate("MyLearning")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:medal-ribbons-star-bold"
            iconColor="#ca8a04"
            iconBg="#fefce8"
            label={t("profile.certificates")}
            onPress={() => navigation.navigate("Certificates")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:clipboard-list-bold"
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
            label={t("profile.assignments")}
            onPress={() => navigation.navigate("Assignments")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:question-circle-bold"
            iconColor="#db2777"
            iconBg="#fdf2f8"
            label={t("profile.quizzes")}
            onPress={() => navigation.navigate("Quizzes")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:bag-3-bold"
            iconColor="#c68e43"
            iconBg="#f7efe3"
            label={t("profile.orders")}
            onPress={() => navigation.navigate("Orders")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:bell-bold"
            iconColor="#6366f1"
            iconBg="#eef2ff"
            label={t("common.notifications")}
            onPress={() => navigation.navigate("Notifications")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:notebook-bold"
            iconColor="#ea580c"
            iconBg="#fff7ed"
            label={t("profile.academicNotes")}
            onPress={() => navigation.navigate("Resources")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:users-group-rounded-bold"
            iconColor="#0891b2"
            iconBg="#ecfeff"
            label={t("profile.teachers")}
            onPress={() => navigation.navigate("Teachers")}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="solar:info-circle-bold"
            iconColor="#64748b"
            iconBg="#f1f5f9"
            label={t("profile.about")}
            onPress={() => navigation.navigate("About")}
          />
        </View>
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
    fontSize: 28,
    color: colors.ink,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.sm,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: "Outfit_700Bold",
    fontSize: 32,
    color: "#fff",
  },
  name: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: colors.ink,
  },
  email: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
  },
  phone: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.ink,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: spacing.xs,
  },
  logoutLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.danger,
  },
  menuCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
});
