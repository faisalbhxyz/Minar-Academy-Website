import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Iconify } from "react-native-iconify";

import { colors, radii, spacing } from "@/theme";

type Props = {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
};

export function ProfileMenuRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  showChevron = true,
  style,
  trailing,
}: Props) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Iconify icon={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.trailing}>
        {trailing}
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && onPress ? (
          <Iconify
            icon="solar:alt-arrow-right-linear"
            size={18}
            color={colors.inkFaint}
          />
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.ink,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  value: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
});
