import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

const DAY_KEYS = [
  "home.activity.days.sun",
  "home.activity.days.mon",
  "home.activity.days.tue",
  "home.activity.days.wed",
  "home.activity.days.thu",
  "home.activity.days.fri",
  "home.activity.days.sat",
] as const;

type Props = {
  streakDays?: number;
  onPress?: () => void;
};

export const LearningActivityCard = memo(function LearningActivityCard({
  streakDays = 0,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const todayIndex = useMemo(() => new Date().getDay(), []);

  const weekDays = useMemo(() => {
    const ordered: { label: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = (todayIndex - 6 + i + 7) % 7;
      ordered.push({
        label: t(DAY_KEYS[idx]),
        isToday: i === 6,
      });
    }
    return ordered;
  }, [todayIndex, t]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.activity.title")}</Text>
        {onPress ? (
          <Pressable onPress={onPress} hitSlop={8}>
            <Text style={styles.sectionLink}>{t("home.activity.detailsLink")}</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && onPress ? { opacity: 0.94 } : null,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardCopy}>
            <Text style={styles.streakTitle}>
              {t("home.activity.streakTitle", { days: streakDays })}
            </Text>
            <Text style={styles.streakSub}>
              {streakDays > 0
                ? t("home.activity.streakActive")
                : t("home.activity.streakStart")}
            </Text>
          </View>
          <View style={styles.mascot}>
            <Iconify
              icon="solar:ghost-smile-bold"
              size={36}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <View key={day.label} style={styles.dayCol}>
              <View
                style={[
                  styles.dayDot,
                  day.isToday ? styles.dayDotToday : null,
                ]}
              >
                {day.isToday ? (
                  <Iconify
                    icon="solar:fire-bold"
                    size={18}
                    color="#fff"
                  />
                ) : null}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  day.isToday ? styles.dayLabelToday : null,
                ]}
              >
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  sectionLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  streakTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: colors.ink,
    lineHeight: 24,
  },
  streakSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  mascot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eceff1",
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotToday: {
    backgroundColor: "#ff6b35",
  },
  dayLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 0.2,
  },
  dayLabelToday: {
    color: "#ff6b35",
  },
});
