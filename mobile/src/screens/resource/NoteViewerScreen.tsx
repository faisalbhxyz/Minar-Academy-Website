import React from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as WebBrowser from "expo-web-browser";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import type { AppStackParamList } from "@/navigation/types";
import { colors, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "NoteViewer">;

export function NoteViewerScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { title, pdfUrl } = route.params;

  const viewerUrl =
    Platform.OS === "android"
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl;

  const openExternal = async () => {
    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch {
      const can = await Linking.canOpenURL(pdfUrl);
      if (can) await Linking.openURL(pdfUrl);
    }
  };

  return (
    <Screen
      edges={["top", "left", "right"]}
      header={
        <AppHeader
          title={title}
          onBack={() => navigation.goBack()}
          right={
            <Button
              title={t("resources.viewer.open")}
              variant="ghost"
              onPress={() => void openExternal()}
              style={styles.openBtn}
            />
          }
        />
      }
    >
      <View style={styles.viewer}>
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          startInLoadingState
          originWhitelist={["*"]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  openBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
});
