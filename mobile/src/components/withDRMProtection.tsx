// src/components/withDRMProtection.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSecurityStatus } from "@/context/SecurityContext";
import { shouldBlockProtectedPlayback } from "@/utils/deviceSecurity";
import { colors, radii, spacing } from "@/theme";

export const DRM_LEARN_MORE_URL =
  "https://minaracademy.com/help/content-protection";

type DRMProtectionOptions = {
  learnMoreUrl?: string;
  /** Re-run security check when this value changes (e.g. lessonId). */
  checkKeyProp?: string;
};

type WithCheckKey = {
  drmCheckKey?: string | number;
};

function DRMBlockedFallback({ learnMoreUrl }: { learnMoreUrl: string }) {
  const openLearnMore = () => {
    void Linking.openURL(learnMoreUrl).catch(() => undefined);
  };

  return (
    <View style={styles.fallback} accessibilityRole="alert">
      <Text style={styles.title}>Content protection issue detected.</Text>
      <Text style={styles.message}>
        This device cannot play protected content.
      </Text>
      <Pressable
        onPress={openLearnMore}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel="Learn more"
      >
        <Text style={styles.link}>Learn more</Text>
      </Pressable>
    </View>
  );
}

function DRMLoadingFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/**
 * Blocks DRM / protected lesson playback when the device is rooted
 * or can mock location. Rest of the app is unaffected.
 */
export function withDRMProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: DRMProtectionOptions = {}
): React.ComponentType<P & WithCheckKey> {
  const learnMoreUrl = options.learnMoreUrl ?? DRM_LEARN_MORE_URL;
  const checkKeyProp = options.checkKeyProp ?? "drmCheckKey";

  function DRMProtected(props: P & WithCheckKey) {
    const { refreshSecurityStatus } = useSecurityStatus();
    const [gateReady, setGateReady] = useState(false);
    const [blocked, setBlocked] = useState(false);

    const propsRecord = props as P & WithCheckKey & Record<string, unknown>;
    const checkKey = propsRecord[checkKeyProp];
    const { drmCheckKey: _drmCheckKey, ...rest } = propsRecord;

    useEffect(() => {
      let cancelled = false;
      setGateReady(false);

      void (async () => {
        try {
          const status = await refreshSecurityStatus();
          if (cancelled) return;
          setBlocked(shouldBlockProtectedPlayback(status));
        } catch {
          if (cancelled) return;
          setBlocked(true);
        } finally {
          if (!cancelled) setGateReady(true);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [refreshSecurityStatus, checkKey]);

    if (!gateReady) {
      return <DRMLoadingFallback />;
    }

    if (blocked) {
      return <DRMBlockedFallback learnMoreUrl={learnMoreUrl} />;
    }

    return <WrappedComponent {...(rest as P)} />;
  }

  DRMProtected.displayName = `withDRMProtection(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
  })`;

  return DRMProtected;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  link: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
