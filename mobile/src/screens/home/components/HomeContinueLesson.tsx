import React, { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type { LastLessonSnapshot } from "@/lib/watchProgress";
import { colors, radii, spacing } from "@/theme";

type Props = {
  lesson: LastLessonSnapshot;
  kicker: string;
  onPress: () => void;
};

export const HomeContinueLesson = memo(function HomeContinueLesson({
  lesson,
  kicker,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.continueCard,
        pressed ? { opacity: 0.92 } : null,
      ]}
    >
      <Text style={styles.continueKicker}>{kicker}</Text>
      <Text style={styles.continueTitle} numberOfLines={2}>
        {lesson.lessonTitle}
      </Text>
      <Text style={styles.continueCourse} numberOfLines={1}>
        {lesson.courseTitle}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  continueCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  continueKicker: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  continueTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.ink,
    lineHeight: 24,
  },
  continueCourse: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
});
