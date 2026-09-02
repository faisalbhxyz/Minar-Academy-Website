import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";
import { useTranslation } from "@/i18n";
import { formatDateTime, getApiErrorMessage } from "@/lib/format";
import { buildDashboardQuizzes, quizResultLabel } from "@/lib/quizzes";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

export function QuizzesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments"],
    queryFn: api.fetchEnrollments,
  });
  const submissionsQuery = useQuery({
    queryKey: ["quiz-submissions"],
    queryFn: () => api.fetchQuizSubmissions(),
  });

  const quizzes = useMemo(
    () =>
      buildDashboardQuizzes(
        enrollmentsQuery.data ?? [],
        submissionsQuery.data ?? []
      ),
    [enrollmentsQuery.data, submissionsQuery.data]
  );

  const submissions = submissionsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      enrollmentsQuery.refetch(),
      submissionsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const loading =
    (enrollmentsQuery.isLoading && !enrollmentsQuery.data) ||
    (submissionsQuery.isLoading && !submissionsQuery.data);
  const error =
    enrollmentsQuery.isError || submissionsQuery.isError
      ? getApiErrorMessage(
          enrollmentsQuery.error ?? submissionsQuery.error,
          t("quiz.error.loadFailed")
        )
      : null;

  return (
    <Screen loading={loading}>
      <AppHeader title={t("quiz.title")} onBack={() => navigation.goBack()} />
      <FlatList
        data={quizzes}
        keyExtractor={(item) => `${item.courseSlug}-${item.quiz.id}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <Text style={styles.intro}>{t("quiz.intro")}</Text>
        }
        ListEmptyComponent={
          error ? (
            <EmptyState
              title={t("common.loadFailed")}
              message={error}
              actionLabel={t("common.retry")}
              onAction={() => void onRefresh()}
            />
          ) : (
            <EmptyState
              title={t("quiz.empty.title")}
              message={t("quiz.empty.message")}
            />
          )
        }
        ListFooterComponent={
          submissions.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>{t("quiz.recentSubmissions")}</Text>
              {submissions.map((submission) => {
                const match = quizzes.find(
                  (item) => item.quiz.id === submission.quiz_id
                );
                return (
                  <Pressable
                    key={submission.id}
                    onPress={() =>
                      navigation.navigate("QuizSubmission", {
                        submissionId: submission.id,
                        courseSlug: match?.courseSlug,
                      })
                    }
                    style={styles.subCard}
                  >
                    <Text style={styles.title}>{submission.quiz_title}</Text>
                    <Text style={styles.meta}>
                      {submission.score}/{submission.max_score} (
                      {Math.round(submission.percentage)}%) ·{" "}
                      {formatDateTime(submission.submitted_at)}
                    </Text>
                    <StatusPill
                      label={quizResultLabel(submission)}
                      tone={
                        submission.status === "pending_review"
                          ? "warning"
                          : submission.passed
                            ? "success"
                            : "danger"
                      }
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Quiz", {
                courseSlug: item.courseSlug,
                quizId: item.quiz.id,
                quizTitle: item.quiz.title,
              })
            }
            style={({ pressed }) => [
              styles.card,
              pressed ? { opacity: 0.92 } : null,
            ]}
          >
            <Text style={styles.title}>{item.quiz.title}</Text>
            <Text style={styles.meta}>
              {item.courseTitle} · {item.chapterTitle}
            </Text>
            {item.latestSubmission ? (
              <StatusPill
                label={quizResultLabel(item.latestSubmission)}
                tone={
                  item.latestSubmission.status === "pending_review"
                    ? "warning"
                    : item.latestSubmission.passed
                      ? "success"
                      : "danger"
                }
              />
            ) : (
              <StatusPill label={t("common.notAttempted")} />
            )}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  intro: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  meta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  footer: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  footerTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: colors.ink,
  },
  subCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
