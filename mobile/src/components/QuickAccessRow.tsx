import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, spacing } from "@/theme";

export type QuickAccessItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
};

type Props = {
  items: QuickAccessItem[];
};

export function QuickAccessRow({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            pressed ? { opacity: 0.88 } : null,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            {item.icon}
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  item: {
    width: 72,
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 14,
  },
});
