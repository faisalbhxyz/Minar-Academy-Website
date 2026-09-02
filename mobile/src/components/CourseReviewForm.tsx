import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as api from "@/api";
import { Button } from "@/components/Button";
import { StarRating } from "@/components/StarRating";
import { useTranslation } from "@/i18n";
import {
  getCourseReviewTags,
  type CourseReviewTagId,
} from "@/lib/courseReview";
import { colors, radii, spacing } from "@/theme";
import type { CourseReview } from "@/types/api";

type Props = {
  courseSlug: string;
  courseTitle: string;
  onSubmitted?: (review: CourseReview) => void;
  onCancel?: () => void;
};

export function CourseReviewForm({
  courseSlug,
  courseTitle,
  onSubmitted,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const reviewTags = getCourseReviewTags();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<CourseReviewTagId[]>([]);
  const [comment, setComment] = useState("");

  const submitMutation = useMutation({
    mutationFn: () =>
      api.submitCourseReview(courseSlug, {
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      }),
    onSuccess: (review) => {
      if (!review) return;
      void queryClient.invalidateQueries({
        queryKey: ["course-reviews", courseSlug],
      });
      onSubmitted?.(review);
    },
    onError: (error: Error) => {
      Alert.alert(
        t("reviews.submitFailedTitle"),
        error.message || t("reviews.submitFailedMessage")
      );
    },
  });

  const toggleTag = useCallback((tagId: CourseReviewTagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleSubmit = () => {
    if (rating < 1) {
      Alert.alert(
        t("reviews.ratingRequiredTitle"),
        t("reviews.ratingRequiredMessage")
      );
      return;
    }
    submitMutation.mutate();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t("reviews.title")}</Text>
      <Text style={styles.subtitle}>{courseTitle}</Text>

      <Text style={styles.question}>{t("reviews.howWasCourse")}</Text>
      <StarRating rating={rating} onChange={setRating} />
      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>{t("reviews.bad")}</Text>
        <Text style={styles.scaleLabel}>{t("reviews.good")}</Text>
      </View>

      <View style={styles.tags}>
        {reviewTags.map((tag) => {
          const selected = selectedTags.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
              style={[
                styles.tag,
                selected ? styles.tagSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  selected ? styles.tagTextSelected : null,
                ]}
              >
                {tag.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>{t("reviews.commentLabel")}</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder={t("reviews.commentPlaceholder")}
        placeholderTextColor={colors.inkFaint}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textarea}
      />

      <Button
        title={
          submitMutation.isPending ? t("reviews.submitting") : t("common.submit")
        }
        onPress={handleSubmit}
        loading={submitMutation.isPending}
        disabled={rating < 1}
        style={styles.submit}
      />
      {onCancel ? (
        <Button
          title={t("reviews.later")}
          variant="ghost"
          onPress={onCancel}
          disabled={submitMutation.isPending}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
  },
  question: {
    marginTop: spacing.sm,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  scaleLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  tagTextSelected: {
    color: colors.primaryDark,
  },
  fieldLabel: {
    marginTop: spacing.sm,
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.ink,
  },
  submit: {
    marginTop: spacing.sm,
    alignSelf: "stretch",
  },
});
