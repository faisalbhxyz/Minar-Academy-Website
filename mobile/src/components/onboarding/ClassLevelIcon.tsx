import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ClassLevel } from "@/lib/onboarding";
import { radii } from "@/theme";

const TILE_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#6366f1"] as const;

type Props = {
  level: ClassLevel;
  compact?: boolean;
};

export function ClassLevelIcon({ level, compact }: Props) {
  if (level === "hsc_beyond" || level === "class_9_10_ssc") {
    return (
      <View style={[styles.wrap, compact && styles.compact]}>
        {TILE_COLORS.map((color, i) => (
          <View
            key={color}
            style={[styles.tile, { backgroundColor: color }]}
          >
            <Text style={styles.tileText}>
              {["G", "A", "M", "E"][i]}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const num = level.replace("class_", "").replace("_", " ");
  return (
    <View style={[styles.single, compact && styles.compactSingle]}>
      <Text style={styles.singleText}>{num.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 48,
    height: 48,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: radii.md,
    overflow: "hidden",
  },
  compact: {
    width: 40,
    height: 40,
  },
  tile: {
    width: "50%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  tileText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    color: "#fff",
  },
  single: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "#e8f3f1",
    alignItems: "center",
    justifyContent: "center",
  },
  compactSingle: {
    width: 40,
    height: 40,
  },
  singleText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: "#246962",
  },
});
