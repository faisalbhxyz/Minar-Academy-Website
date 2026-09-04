import React, { memo, useCallback } from "react";

import { EnrolledCourseCard } from "@/components/EnrolledCourseCard";
import type { EnrollmentWithProgress } from "@/lib/learningReport";

type Props = {
  item: EnrollmentWithProgress;
  certificateId?: number;
  onPressSlug: (slug: string) => void;
  onCertificatePress?: (certificateId: number) => void;
};

function EnrolledCourseListItemInner({
  item,
  certificateId,
  onPressSlug,
  onCertificatePress,
}: Props) {
  const slug = item.enrollment.course.slug;

  const handlePress = useCallback(
    () => onPressSlug(slug),
    [slug, onPressSlug]
  );

  const handleCertificatePress = useCallback(() => {
    if (certificateId != null) {
      onCertificatePress?.(certificateId);
    }
  }, [certificateId, onCertificatePress]);

  return (
    <EnrolledCourseCard
      item={item}
      certificateId={certificateId}
      onPress={handlePress}
      onCertificatePress={
        onCertificatePress && certificateId != null
          ? handleCertificatePress
          : undefined
      }
    />
  );
}

export const EnrolledCourseListItem = memo(EnrolledCourseListItemInner);
