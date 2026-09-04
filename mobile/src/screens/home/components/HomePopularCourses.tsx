import React, { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { CourseCardListItem } from "@/components/CourseCardListItem";
import { EmptyState } from "@/components/EmptyState";
import { spacing, radii, colors } from "@/theme";
import type { CourseDetails } from "@/types/api";

type Props = {
  courses: CourseDetails[] | undefined;
  isPending: boolean;
  onPressSlug: (slug: string) => void;
  emptyTitle: string;
  emptyMessage: string;
};

export const HomePopularCourses = memo(function HomePopularCourses({
  courses,
  isPending,
  onPressSlug,
  emptyTitle,
  emptyMessage,
}: Props) {
  if (courses && courses.length > 0) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courseList}
      >
        {courses.map((course, index) => (
          <View key={course.id} style={index > 0 ? styles.gap : undefined}>
            <CourseCardListItem course={course} onPressSlug={onPressSlug} />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (isPending) {
    return (
      <View style={styles.courseSkeletonRow}>
        {[0, 1].map((key) => (
          <View key={key} style={styles.courseSkeleton} />
        ))}
      </View>
    );
  }

  return <EmptyState title={emptyTitle} message={emptyMessage} />;
});

const styles = StyleSheet.create({
  courseList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  gap: {
    marginLeft: spacing.md,
  },
  courseSkeletonRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  courseSkeleton: {
    width: 260,
    height: 280,
    borderRadius: radii.lg,
    backgroundColor: colors.border,
    opacity: 0.45,
  },
});
