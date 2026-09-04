import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import { fullName } from "@/lib/format";
import type { Student } from "@/types/api";
import { colors, radii, spacing } from "@/theme";

type Props = {
  user: Student | null;
  classLabel?: string;
  onSearch: () => void;
  onNotifications?: () => void;
  onProfilePress?: () => void;
  onClassPress?: () => void;
  onEditProfile?: () => void;
};

export const DashboardHeader = memo(function DashboardHeader({
  user,
  classLabel,
  onSearch,
  onNotifications,
  onProfilePress,
  onClassPress,
  onEditProfile,
}: Props) {
  const { t } = useTranslation();
  const displayName = fullName(user?.first_name, user?.last_name);

  return (
    <LinearGradient
      colors={["#fff8f3", "#ffe9d6", "#fff5ee"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [
          styles.profileRow,
          pressed && onProfilePress ? { opacity: 0.9 } : null,
        ]}
        disabled={!onProfilePress}
      >
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

        <View style={styles.profileText}>
          <Text style={styles.greeting} numberOfLines={1}>
            {t("common.greeting", { name: displayName })}
          </Text>
          {onEditProfile ? (
            <Pressable
              onPress={onEditProfile}
              hitSlop={8}
              style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}
            >
              <View style={styles.editLinkRow}>
                <Iconify
                  icon="solar:user-id-bold"
                  size={14}
                  color={colors.secondary}
                />
                <Text style={styles.editLink}>{t("common.editProfileLink")}</Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.toolbar}>
        <Pressable
          onPress={onClassPress}
          style={({ pressed }) => [
            styles.classPill,
            pressed ? { opacity: 0.9 } : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("home.classSelect.title")}
        >
          <Text style={styles.classText} numberOfLines={1}>
            {classLabel ?? t("common.myCourses")}
          </Text>
          <Iconify
            icon="solar:alt-arrow-down-bold"
            size={16}
            color={colors.inkMuted}
          />
        </Pressable>

        <View style={styles.iconGroup}>
          <Pressable
            onPress={onSearch}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed ? { opacity: 0.85 } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("common.search")}
          >
            <Iconify
              icon="solar:magnifer-linear"
              size={22}
              color={colors.ink}
            />
          </Pressable>

          {onNotifications ? (
            <Pressable
              onPress={onNotifications}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed ? { opacity: 0.85 } : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("common.notifications")}
            >
              <Iconify
                icon="solar:bell-linear"
                size={22}
                color={colors.ink}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: "#fff",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    lineHeight: 22,
  },
  editLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.secondary,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  classPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "rgba(198, 142, 67, 0.2)",
  },
  classText: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  iconGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 142, 67, 0.15)",
  },
});
