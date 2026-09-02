import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import * as WebBrowser from "expo-web-browser";
import { Iconify } from "react-native-iconify";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { CertificateCardView } from "@/components/CertificateCardView";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, spacing } from "@/theme";

export function CertificateDetailScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "CertificateDetail">>();
  const certificateId = route.params.certificateId;
  const [downloading, setDownloading] = useState(false);

  const query = useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: () => api.fetchStudentCertificate(certificateId),
  });

  const certificate = query.data;
  const title =
    certificate?.title?.trim() ||
    certificate?.course_title ||
    t("certificates.detail.fallbackTitle");

  const onDownload = async () => {
    if (!certificate) return;
    setDownloading(true);
    try {
      if (certificate.download_url) {
        await WebBrowser.openBrowserAsync(certificate.download_url);
        return;
      }

      const html = await api.fetchCertificateHTML(certificate.id);
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!dir) {
        throw new Error(t("certificates.detail.saveFailed"));
      }
      const path = `${dir}certificate-${certificate.id}.html`;
      await FileSystem.writeAsStringAsync(path, html, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await WebBrowser.openBrowserAsync(path);
    } catch (error) {
      Alert.alert(
        t("certificates.detail.downloadFailedTitle"),
        getApiErrorMessage(error, t("certificates.detail.downloadFailed"))
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen loading={query.isLoading && !certificate}>
      <AppHeader
        title={title}
        onBack={() => navigation.goBack()}
        right={
          certificate ? (
            <Pressable
              onPress={() => void onDownload()}
              disabled={downloading}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t("certificates.detail.downloadLabel")}
              style={({ pressed }) => [
                styles.downloadBtn,
                pressed ? { opacity: 0.65 } : null,
              ]}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : (
                <Iconify
                  icon="solar:download-minimalistic-bold"
                  size={22}
                  color={colors.ink}
                />
              )}
            </Pressable>
          ) : undefined
        }
      />

      {query.isError && !certificate ? (
        <EmptyState
          title={t("certificates.detail.notFound")}
          message={getApiErrorMessage(
            query.error,
            t("certificates.detail.loadFailed")
          )}
          actionLabel={t("common.back")}
          onAction={() => navigation.goBack()}
        />
      ) : certificate ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CertificateCardView certificate={certificate} />
          <Text style={styles.hint}>{t("certificates.detail.hint")}</Text>
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    marginTop: spacing.lg,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: "center",
    lineHeight: 18,
  },
});
