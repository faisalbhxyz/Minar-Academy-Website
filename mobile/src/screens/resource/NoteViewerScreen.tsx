import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import * as WebBrowser from "expo-web-browser";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { buildPdfViewerHtml } from "@/lib/pdfViewerHtml";
import type { AppStackParamList } from "@/navigation/types";
import { colors, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "NoteViewer">;

export function NoteViewerScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { title, pdfUrl, fitWidth = false } = route.params;
  const webRef = useRef<WebView>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(fitWidth);
  const [viewerReady, setViewerReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const pageViewerUrl =
    Platform.OS === "android"
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl;

  useEffect(() => {
    if (!fitWidth) return;

    let cancelled = false;
    const cacheDir = FileSystem.cacheDirectory;

    async function loadPdf() {
      setLoadingPdf(true);
      setLoadError(false);
      setPdfBase64(null);
      setViewerReady(false);
      try {
        if (!cacheDir) throw new Error("No cache directory");
        const isLocal =
          pdfUrl.startsWith("file://") ||
          Boolean(
            FileSystem.documentDirectory &&
              pdfUrl.startsWith(FileSystem.documentDirectory)
          );
        let sourceUri = pdfUrl;
        if (!isLocal) {
          const target = `${cacheDir}pdf-view-${Date.now()}.pdf`;
          const result = await FileSystem.downloadAsync(pdfUrl, target);
          sourceUri = result.uri;
        }
        const base64 = await FileSystem.readAsStringAsync(sourceUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (!isLocal) {
          await FileSystem.deleteAsync(sourceUri, { idempotent: true });
        }
        if (!cancelled) setPdfBase64(base64);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    }

    void loadPdf();
    return () => {
      cancelled = true;
    };
  }, [fitWidth, pdfUrl]);

  useEffect(() => {
    if (!fitWidth || !viewerReady || !pdfBase64) return;
    const payload = JSON.stringify({ type: "pdf-base64", data: pdfBase64 });
    // injectJavaScript is more reliable than postMessage for large base64 payloads.
    webRef.current?.injectJavaScript(`
      (function () {
        try {
          var data = ${JSON.stringify(payload)};
          var ev = new MessageEvent("message", { data: data });
          document.dispatchEvent(ev);
          window.dispatchEvent(ev);
        } catch (e) {}
      })();
      true;
    `);
  }, [fitWidth, viewerReady, pdfBase64]);

  const openExternal = async () => {
    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch {
      const can = await Linking.canOpenURL(pdfUrl);
      if (can) await Linking.openURL(pdfUrl);
    }
  };

  const onMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { type?: string };
      if (msg.type === "viewer-ready") setViewerReady(true);
      if (msg.type === "error") setLoadError(true);
    } catch {
      // Ignore malformed WebView messages.
    }
  }, []);

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
      <View style={[styles.viewer, fitWidth ? styles.viewerFit : null]}>
        {fitWidth ? (
          <>
            {(loadingPdf || (!pdfBase64 && !loadError)) && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {loadError ? (
              <View style={styles.loading}>
                <Button
                  title={t("resources.viewer.open")}
                  onPress={() => void openExternal()}
                />
              </View>
            ) : (
              <WebView
                ref={webRef}
                originWhitelist={["*"]}
                source={{ html: buildPdfViewerHtml(), baseUrl: "https://localhost" }}
                style={[
                  styles.webview,
                  styles.webviewFit,
                  loadingPdf ? styles.webviewHidden : null,
                ]}
                onMessage={onMessage}
                javaScriptEnabled
                setSupportMultipleWindows={false}
                mixedContentMode="always"
                allowFileAccess
                allowUniversalAccessFromFileURLs
              />
            )}
          </>
        ) : (
          <WebView
            source={{ uri: pageViewerUrl }}
            style={styles.webview}
            startInLoadingState
            originWhitelist={["*"]}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  viewerFit: {
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webviewFit: {
    backgroundColor: "#ffffff",
  },
  webviewHidden: {
    opacity: 0,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    zIndex: 1,
  },
  openBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
});
