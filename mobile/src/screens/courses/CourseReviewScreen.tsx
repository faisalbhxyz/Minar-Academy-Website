import React from "react";
import { StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { CourseReviewForm } from "@/components/CourseReviewForm";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "CourseReview">;

export function CourseReviewScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { slug, courseTitle } = route.params;

  const progressQuery = useQuery({
    queryKey: ["course-progress", slug],
    queryFn: () => api.fetchCourseProgress(slug),
    staleTime: 30_000,
  });

  const isCompleted = (progressQuery.data?.progress_percent ?? 0) >= 100;

  return (
    <Screen
      scroll
      loading={progressQuery.isLoading}
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={t("reviews.title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {isCompleted ? (
        <CourseReviewForm
          courseSlug={slug}
          courseTitle={courseTitle}
          onSubmitted={() => navigation.goBack()}
          onCancel={() => navigation.goBack()}
        />
      ) : (
        <EmptyState
          title={t("reviews.notCompletedTitle")}
          message={t("reviews.notCompletedMessage")}
          actionLabel={t("common.back")}
          onAction={() => navigation.goBack()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
  },
});
