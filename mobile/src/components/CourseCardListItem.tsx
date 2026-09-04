import React, { memo, useCallback } from "react";

import { CourseCard } from "@/components/CourseCard";
import type { CourseDetails } from "@/types/api";

type Props = {
  course: CourseDetails;
  compact?: boolean;
  onPressSlug: (slug: string) => void;
};

function CourseCardListItemInner({ course, compact, onPressSlug }: Props) {
  const handlePress = useCallback(
    () => onPressSlug(course.slug),
    [course.slug, onPressSlug]
  );

  return (
    <CourseCard course={course} compact={compact} onPress={handlePress} />
  );
}

export const CourseCardListItem = memo(CourseCardListItemInner);
