import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Iconify } from "react-native-iconify";

import { LearningTimeChart } from "@/components/dashboard/LearningTimeChart";
import { useTranslation } from "@/i18n";
import {
  formatAverageLearningDuration,
  formatLearningDuration,
  type FullLearningReport,
  type LearningTimePeriod,
} from "@/lib/learningReport";
import { colors, radii, spacing } from "@/theme";

type Props = {
  report: FullLearningReport;
  period: LearningTimePeriod;
  onPeriodChange: (period: LearningTimePeriod) => void;
};

const PERIOD_OPTIONS: LearningTimePeriod[] = ["7d", "30d", "90d"];

function MetricCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  hint,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconWrap, { backgroundColor: iconBg }]}>
        <Iconify icon={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.metricCopy}>
        <View style={styles.metricLabelRow}>
          <Text style={styles.metricLabel}>{label}</Text>
          {hint ? (
            <Iconify
              icon="solar:info-circle-linear"
              size={14}
              color={colors.inkFaint}
            />
          ) : null}
        </View>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

export function LearningReportDashboard({
  report,
  period,
  onPeriodChange,
}: Props) {
  const { t } = useTranslation();
  const [periodOpen, setPeriodOpen] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const { metrics, learningTime } = report;

  const periodLabel = useMemo(
    () => t(`learning.report.period.${period}`),
    [period, t]
  );

  const shareReport = async () => {
    const message = t("learning.report.shareMessage", {
      percent: metrics.overallPercent,
      correct: metrics.correctAnswerRate,
      participation: metrics.classParticipationRate,
      assignments: `${metrics.assignmentsCompleted}/${metrics.assignmentsTotal}`,
      time: formatLearningDuration(learningTime.totalSeconds),
    });
    await Share.share({ message });
  };

  return (
    <View style={styles.root}>
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={["#d7f0ea", "#eef8f5", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroValue}>{metrics.overallPercent}%</Text>
          <Text style={styles.heroLabel}>
            {t("learning.report.overallProgress")}
          </Text>
        </LinearGradient>

        <View style={styles.sideColumn}>
          <View style={styles.trophyCard}>
            <Iconify icon="solar:cup-star-bold" size={22} color="#f59e0b" />
            <Text style={styles.trophyValue}>{metrics.trophyCount}</Text>
          </View>

          <MetricCard
            icon="solar:check-circle-bold"
            iconColor="#2563eb"
            iconBg="#eff6ff"
            label={t("learning.report.correctAnswerRate")}
            value={`${metrics.correctAnswerRate}%`}
            hint
          />

          <MetricCard
            icon="solar:chart-2-bold"
            iconColor="#ca8a04"
            iconBg="#fefce8"
            label={t("learning.report.classParticipationRate")}
            value={`${metrics.classParticipationRate}%`}
          />

          <MetricCard
            icon="solar:clipboard-list-bold"
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
            label={t("learning.report.homeworkAssignment")}
            value={`${metrics.assignmentsCompleted}/${metrics.assignmentsTotal}`}
          />
        </View>
      </View>

      <View style={styles.shareRow}>
        <View style={styles.shareDivider} />
        <Pressable
          onPress={() => void shareReport()}
          style={({ pressed }) => [
            styles.shareButton,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Iconify icon="solar:share-bold" size={18} color={colors.primary} />
          <Text style={styles.shareLabel}>{t("learning.report.share")}</Text>
        </Pressable>
        <View style={styles.shareDivider} />
      </View>

      <View style={styles.timeSection}>
        <View style={styles.timeHeader}>
          <Text style={styles.timeTitle}>
            {t("learning.report.totalLearningTime")}
          </Text>
          <Pressable
            onPress={() => setPeriodOpen(true)}
            style={styles.periodButton}
          >
            <Text style={styles.periodLabel}>{periodLabel}</Text>
            <Iconify
              icon="solar:alt-arrow-down-linear"
              size={16}
              color={colors.inkMuted}
            />
          </Pressable>
        </View>

        <View style={styles.timeStatsRow}>
          <Text style={styles.timeTotal}>
            {formatLearningDuration(learningTime.totalSeconds)}
          </Text>
          <View style={styles.timeAverage}>
            <Iconify
              icon="solar:clock-circle-outline"
              size={16}
              color={colors.inkFaint}
            />
            <Text style={styles.timeAverageText}>
              {t("learning.report.averagePerDay", {
                value: formatAverageLearningDuration(
                  learningTime.averageSecondsPerDay
                ),
              })}
            </Text>
          </View>
        </View>

        <LearningTimeChart days={learningTime.days} width={screenWidth} />
      </View>

      <Modal
        visible={periodOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPeriodOpen(false)}
        >
          <View style={styles.periodSheet}>
            {PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onPeriodChange(option);
                  setPeriodOpen(false);
                }}
                style={({ pressed }) => [
                  styles.periodOption,
                  option === period ? styles.periodOptionActive : null,
                  pressed ? { opacity: 0.9 } : null,
                ]}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    option === period ? styles.periodOptionTextActive : null,
                  ]}
                >
                  {t(`learning.report.period.${option}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 220,
  },
  heroCard: {
    flex: 1.05,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "#cfe8e1",
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 220,
  },
  heroValue: {
    fontFamily: "Outfit_700Bold",
    fontSize: 52,
    color: colors.primaryDark,
    lineHeight: 58,
  },
  heroLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
  sideColumn: {
    flex: 1.35,
    gap: spacing.sm,
  },
  trophyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  trophyValue: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: colors.ink,
  },
  metricCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  metricCopy: {
    flex: 1,
    gap: 2,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  metricValue: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: colors.ink,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shareDivider: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  shareLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  timeSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  timeTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    flex: 1,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  periodLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.inkMuted,
  },
  timeStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: spacing.md,
  },
  timeTotal: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  timeAverage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  timeAverageText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    flexShrink: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  periodSheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  periodOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodOptionActive: {
    backgroundColor: colors.primarySoft,
  },
  periodOptionText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.ink,
  },
  periodOptionTextActive: {
    color: colors.primaryDark,
  },
});
