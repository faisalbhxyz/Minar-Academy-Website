import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";

import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/theme";

type Props = {
  progress: number;
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
};

export function OnboardingLayout({ progress, title, onBack, children }: Props) {
  return (
    <Screen scroll edges={["top", "left", "right", "bottom"]}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Iconify
                icon="solar:arrow-left-linear"
                size={24}
                color={colors.ink}
              />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        <View style={styles.progressWrap}>
          <ProgressBar percent={progress} />
        </View>

        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.sm,
  },
  backPlaceholder: {
    height: 40,
  },
  pressed: {
    opacity: 0.7,
  },
  progressWrap: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
    marginBottom: spacing.xl,
    lineHeight: 36,
  },
});
