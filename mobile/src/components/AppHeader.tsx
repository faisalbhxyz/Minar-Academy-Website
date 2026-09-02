import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "@/i18n";
import { colors, spacing } from "@/theme";

type Props = {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** When false, parent Screen already applied top safe area */
  includeSafeTop?: boolean;
};

export function AppHeader({
  title,
  onBack,
  right,
  style,
  includeSafeTop = false,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        includeSafeTop ? { paddingTop: insets.top } : null,
        style,
      ]}
    >
      <View style={styles.bar}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={({ pressed }) => [
            styles.backBtn,
            pressed ? { opacity: 0.65 } : null,
          ]}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>{right ?? <View style={styles.rightSpacer} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  bar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: colors.ink,
    lineHeight: 26,
  },
  title: {
    flex: 1,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 17,
    color: colors.ink,
  },
  right: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightSpacer: {
    width: 40,
  },
});
