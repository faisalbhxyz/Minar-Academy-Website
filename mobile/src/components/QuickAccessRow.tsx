import React, { memo } from "react";
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

export const QuickAccessRow = memo(function QuickAccessRow({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.row}>
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
      </View>
    </ScrollView>
  );
});

const ITEM_WIDTH = 88;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  item: {
    width: ITEM_WIDTH,
    flexShrink: 0,
    alignItems: "center",
    gap: spacing.sm + 2,
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
    width: "100%",
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 16,
    minHeight: 32,
  },
});
