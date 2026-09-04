import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import { toBengaliNumerals } from "@/lib/format";
import type { EnrollmentWithProgress } from "@/lib/learningReport";
import { useLocaleStore } from "@/store/localeStore";
import { colors, radii, spacing } from "@/theme";

type Props = {
  item: EnrollmentWithProgress;
  certificateId?: number;
  onPress: () => void;
  onCertificatePress?: (certificateId: number) => void;
};

function EnrolledCourseCardInner({
  item,
  certificateId,
  onPress,
  onCertificatePress,
}: Props) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const { enrollment, progress } = item;
  const percent = Math.round(progress?.progress_percent ?? 0);
  const clamped = Math.min(100, Math.max(0, percent));
  const percentLabel =
    locale === "bn" ? toBengaliNumerals(percent) : String(percent);
  const hasCertificate = certificateId != null;

  const markerLeft = hasCertificate ? Math.min(clamped, 92) : 92;

  const statusText =
    percent >= 100
      ? t("courses.detail.courseComplete")
      : t("courses.detail.readyToLearn");

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {enrollment.course.title}
      </Text>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrackWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${clamped}%` }]} />
            </View>
            <View
              style={[
                styles.progressMarker,
                hasCertificate ? styles.progressMarkerEarned : null,
                { left: `${markerLeft}%` },
              ]}
            >
              <Iconify
                icon="solar:diploma-bold"
                size={14}
                color={hasCertificate ? "#fff" : colors.inkMuted}
              />
            </View>
          </View>
          <Text style={styles.progressText}>
            {t("common.percentComplete", { percent: percentLabel })}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusIcons}>
          <View style={[styles.statusIcon, styles.statusIconVideo]}>
            <Iconify icon="solar:play-bold" size={12} color="#fff" />
          </View>
          <View style={[styles.statusIcon, styles.statusIconDoc]}>
            <Iconify
              icon="solar:document-text-bold"
              size={12}
              color="#fff"
            />
          </View>
          <View style={[styles.statusIcon, styles.statusIconNote]}>
            <Iconify icon="solar:notebook-bold" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.actionBtn,
            hasCertificate ? styles.actionBtnHalf : styles.actionBtnFull,
            pressed ? { opacity: 0.9 } : null,
          ]}
        >
          <Text style={styles.actionBtnText}>{t("home.enrolled.courseHome")}</Text>
        </Pressable>

        {hasCertificate && certificateId != null ? (
          <Pressable
            onPress={() => onCertificatePress?.(certificateId)}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnHalf,
              pressed ? { opacity: 0.9 } : null,
            ]}
          >
            <Text style={styles.actionBtnText}>
              {t("home.enrolled.certificate")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const EnrolledCourseCard = memo(EnrolledCourseCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 17,
    color: colors.ink,
    lineHeight: 24,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrackWrap: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: "#e8edf0",
    overflow: "hidden",
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7eb8e8",
    borderRadius: radii.pill,
  },
  progressMarker: {
    position: "absolute",
    top: 1,
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  progressMarkerEarned: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  progressText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.inkMuted,
    minWidth: 88,
    textAlign: "right",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
  },
  statusIconVideo: {
    backgroundColor: "#ef4444",
  },
  statusIconDoc: {
    backgroundColor: "#3b82f6",
  },
  statusIconNote: {
    backgroundColor: "#f97316",
  },
  statusText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnFull: {
    flex: 1,
  },
  actionBtnHalf: {
    flex: 1,
  },
  actionBtnText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
});
