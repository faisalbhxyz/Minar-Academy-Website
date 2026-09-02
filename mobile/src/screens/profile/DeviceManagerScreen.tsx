import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Device from "expo-device";

import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getDeviceId, getDeviceName } from "@/lib/storage";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "DeviceManager">;

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export function DeviceManagerScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const deviceName = getDeviceName();
  const platform = Device.osName ?? "Unknown";

  useEffect(() => {
    void getDeviceId().then(setDeviceId);
  }, []);

  return (
    <Screen
      scroll
      header={
        <AppHeader
          title={t("profile.deviceManager.title")}
          onBack={() => navigation.goBack()}
        />
      }
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sub}>{t("profile.deviceManager.subtitle")}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {t("profile.deviceManager.thisDevice")}
          </Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>
              {t("profile.deviceManager.active")}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {t("profile.deviceManager.deviceName")}
          </Text>
          <Text style={styles.detailValue}>{deviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {t("profile.deviceManager.platform")}
          </Text>
          <Text style={styles.detailValue}>{platform}</Text>
        </View>

        {deviceId ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t("profile.deviceManager.deviceId")}
            </Text>
            <Text style={styles.detailValueMono}>{truncateId(deviceId)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>{t("profile.sessionNote.title")}</Text>
        <Text style={styles.noteBody}>{t("profile.sessionNote.body")}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  activeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.primaryDark,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  detailValue: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.ink,
  },
  detailValueMono: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  note: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 6,
  },
  noteTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.primaryDark,
  },
  noteBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
  },
});
