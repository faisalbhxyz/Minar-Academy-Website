import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { Button } from "@/components/Button";
import { StarRatingLabel } from "@/components/StarRating";
import { useTranslation } from "@/i18n";
import { formatReviewStudentName } from "@/lib/courseReview";
import { colors, radii, spacing } from "@/theme";

type Props = {
  courseSlug: string;
  courseTitle: string;
  isCompleted?: boolean;
  onWriteReview?: () => void;
};

export function CourseReviewsSection({
  courseSlug,
  courseTitle,
  isCompleted = false,
  onWriteReview,
}: Props) {
  const { t } = useTranslation();
  const reviewsQuery = useQuery({
    queryKey: ["course-reviews", courseSlug],
    queryFn: () => api.fetchCourseReviews(courseSlug),
    staleTime: 60_000,
  });

  const summary = reviewsQuery.data;
  const reviews = summary?.reviews ?? [];
  const totalReviews = summary?.total_reviews ?? reviews.length;
  const averageRating = summary?.average_rating ?? 0;
  const canReview =
    Boolean(onWriteReview) &&
    (summary?.can_review || (isCompleted && !summary?.student_review));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("reviews.studentReviews")}</Text>
          {totalReviews > 0 ? (
            <View style={styles.summaryRow}>
              <StarRatingLabel rating={Math.round(averageRating)} />
              <Text style={styles.summaryText}>
                {t("reviews.reviewCount", {
                  rating: averageRating.toFixed(1),
                  count: totalReviews,
                })}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyHint}>{t("reviews.noReviewsYet")}</Text>
          )}
        </View>
        {canReview ? (
          <Button title={t("reviews.writeReview")} onPress={onWriteReview} />
        ) : null}
      </View>

      {reviewsQuery.isLoading ? (
        <Text style={styles.emptyHint}>{t("reviews.loading")}</Text>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {canReview
              ? t("reviews.firstReviewPrompt", { courseTitle })
              : t("reviews.noReviewsFromOthers")}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => {
            const studentName = formatReviewStudentName(
              review.student?.first_name,
              review.student?.last_name
            );
            return (
              <View key={review.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {review.student?.profile_image ? (
                    <Image
                      source={{ uri: review.student.profile_image }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarText}>
                        {studentName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{studentName}</Text>
                    <StarRatingLabel rating={review.rating} />
                  </View>
                </View>
                {review.comment ? (
                  <Text style={styles.comment}>{review.comment}</Text>
                ) : (
                  <Text style={styles.noComment}>{t("reviews.noWrittenComment")}</Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: colors.ink,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  summaryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  emptyHint: {
    marginTop: spacing.xs,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkFaint,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.primary,
  },
  name: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.ink,
  },
  comment: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  noComment: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkFaint,
    fontStyle: "italic",
  },
});
