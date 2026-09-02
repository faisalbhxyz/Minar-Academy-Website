import React from "react";
import { StyleSheet, View } from "react-native";

import { colors, radii } from "@/theme";

type Props = {
  percent: number;
};

export function ProgressBar({ percent }: Props) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${width}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
});
