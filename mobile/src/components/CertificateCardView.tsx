import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";

import { useTranslation } from "@/i18n";
import { formatCertificateIssuedAt } from "@/lib/format";
import type { Certificate } from "@/types/api";
import { colors, radii, spacing } from "@/theme";

type Props = {
  certificate: Certificate;
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function skillTags(certificate: Certificate): string[] {
  const raw = [certificate.subtitle_one, certificate.subtitle_two]
    .filter((v): v is string => Boolean(v && v.trim()))
    .flatMap((v) => v.split(/[,·|]/).map((s) => s.trim()))
    .filter(Boolean);
  return [...new Set(raw)].slice(0, 4);
}

export function CertificateCardView({
  certificate,
  compact,
  onPress,
  style,
}: Props) {
  const { t } = useTranslation();
  const heading =
    certificate.title?.trim() ||
    certificate.course_title ||
    t("certificates.card.fallbackTitle");
  const org =
    certificate.organization_name?.trim() || t("common.brandName");
  const skills = skillTags(certificate);
  const signerName = certificate.signer_name?.trim();
  const signerRole =
    certificate.signer_role?.trim() ||
    certificate.signer_org?.trim() ||
    t("certificates.card.headOfLearning");

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.compactCard,
          pressed && onPress ? { opacity: 0.92 } : null,
          style,
        ]}
      >
        <View style={styles.compactBadge}>
          <Text style={styles.compactBadgeText}>MA</Text>
        </View>
        <View style={styles.compactBody}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {heading}
          </Text>
          <Text style={styles.compactMeta} numberOfLines={1}>
            {certificate.student_name}
          </Text>
          <Text style={styles.compactSub} numberOfLines={1}>
            {formatCertificateIssuedAt(certificate.issued_at)} ·{" "}
            {certificate.certificate_number}
          </Text>
        </View>
        <Text style={styles.compactChevron}>→</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.frame, style]}>
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.brandLogo}
            contentFit="contain"
            accessibilityLabel={t("common.brandName")}
          />
          {certificate.brand_logo ? (
            <Image
              source={{ uri: certificate.brand_logo }}
              style={styles.partnerLogo}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.orgLabel} numberOfLines={2}>
              {org}
            </Text>
          )}
        </View>

        <Text style={styles.heading}>{heading}</Text>

        <Text style={styles.completedBy}>
          {t("certificates.card.completedBy")}{" "}
          <Text style={styles.studentName}>{certificate.student_name}</Text>
        </Text>
        <Text style={styles.issuedLine}>
          {formatCertificateIssuedAt(certificate.issued_at)}
          {certificate.progress_percent >= 100
            ? `  ·  ${t("certificates.card.complete100")}`
            : `  ·  ${t("certificates.card.completePercent", {
                percent: Math.round(certificate.progress_percent),
              })}`}
        </Text>

        {skills.length > 0 ? (
          <View style={styles.skillsBlock}>
            <Text style={styles.skillsLabel}>{t("certificates.card.skillsLabel")}</Text>
            <View style={styles.skillsRow}>
              {skills.map((skill) => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.signerCol}>
            {certificate.owner_signature || certificate.instructor_signature ? (
              <Image
                source={{
                  uri:
                    certificate.owner_signature ||
                    certificate.instructor_signature ||
                    "",
                }}
                style={styles.signatureImg}
                contentFit="contain"
              />
            ) : signerName ? (
              <Text style={styles.signatureScript}>{signerName}</Text>
            ) : (
              <Text style={styles.signatureScript}>
                {t("certificates.card.brandFallback")}
              </Text>
            )}
            <View style={styles.signerRule} />
            <Text style={styles.signerRole}>{signerRole}</Text>
            {signerName &&
            (certificate.owner_signature ||
              certificate.instructor_signature) ? (
              <Text style={styles.signerName}>{signerName}</Text>
            ) : null}
          </View>

          <View style={styles.seal}>
            <View style={styles.sealInner}>
              <Text style={styles.sealMark}>MA</Text>
              <Text style={styles.sealTitle}>{t("certificates.card.sealLine1")}</Text>
              <Text style={styles.sealTitle}>{t("certificates.card.sealLine2")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.certId} numberOfLines={1}>
          {t("certificates.card.certificateId", {
            id: certificate.certificate_number,
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: "#e8eef2",
    borderRadius: 4,
    padding: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  inner: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d7dde3",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    minHeight: 420,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  brandLogo: {
    width: 120,
    height: 40,
  },
  partnerLogo: {
    width: 96,
    height: 36,
  },
  orgLabel: {
    flexShrink: 1,
    maxWidth: 120,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
    color: colors.ink,
    textAlign: "right",
  },
  heading: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  completedBy: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  studentName: {
    fontFamily: "DMSans_500Medium",
    color: colors.ink,
  },
  issuedLine: {
    marginTop: 4,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  skillsBlock: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  skillsLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: "center",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  skillChip: {
    borderWidth: 1,
    borderColor: "#c9d4db",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  skillChipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.ink,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing.xl,
    minHeight: 110,
  },
  signerCol: {
    flex: 1,
    paddingRight: spacing.md,
    gap: 2,
  },
  signatureImg: {
    width: 140,
    height: 44,
  },
  signatureScript: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 22,
    color: "#1e3a5f",
    fontStyle: "italic",
  },
  signerRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#cbd5e1",
    width: "78%",
    marginVertical: 4,
  },
  signerRole: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.inkMuted,
  },
  signerName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.ink,
  },
  seal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#1d4f91",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f6fc",
  },
  sealInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  sealMark: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: "#1d4f91",
    marginBottom: 2,
  },
  sealTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: "#1d4f91",
    letterSpacing: 0.2,
  },
  certId: {
    marginTop: spacing.md,
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: "center",
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  compactBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  compactBadgeText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    color: colors.secondary,
  },
  compactBody: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  compactMeta: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  compactSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.inkFaint,
  },
  compactChevron: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.primary,
  },
});
