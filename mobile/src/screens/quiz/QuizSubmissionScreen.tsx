import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";
import { useTranslation } from "@/i18n";
import { formatDateTime, getApiErrorMessage, stripHtml } from "@/lib/format";
import { formatSubmittedAnswer, quizResultLabel } from "@/lib/quizzes";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "QuizSubmission">;

export function QuizSubmissionScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { submissionId, courseSlug } = route.params;

  const query = useQuery({
    queryKey: ["quiz-submission", submissionId],
    queryFn: () => api.fetchQuizSubmissionDetail(submissionId),
  });

  const result = query.data;
  const answers = result?.answers ?? [];
  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("quiz.submission.loadFailed"))
    : null;

  return (
    <Screen
      scroll
      loading={query.isLoading && !result}
      header={
        <AppHeader title={t("quiz.submission.title")} onBack={() => navigation.goBack()} />
      }
      contentContainerStyle={styles.content}
    >
      {errorMessage ? (
        <EmptyState
          title={t("common.loadFailed")}
          message={errorMessage}
          actionLabel={t("common.retry")}
          onAction={() => void query.refetch()}
        />
      ) : result ? (
        <>
          <Text style={styles.title}>{result.quiz_title}</Text>
          <StatusPill
            label={quizResultLabel(result)}
            tone={
              result.status === "pending_review"
                ? "warning"
                : result.passed
                  ? "success"
                  : "danger"
            }
          />
          <Text style={styles.score}>
            {t("quiz.result.score", {
              score: result.score,
              max: result.max_score,
              percent: Math.round(result.percentage),
            })}
          </Text>
          <Text style={styles.meta}>
            {t("quiz.submission.attemptMeta", {
              n: result.attempt_number,
              date: formatDateTime(result.submitted_at),
            })}
          </Text>
          {result.instructor_feedback ? (
            <Text style={styles.body}>
              {stripHtml(result.instructor_feedback)}
            </Text>
          ) : null}

          {result.reveal_answers && answers.length > 0 ? (
            <View style={styles.answers}>
              <Text style={styles.section}>{t("quiz.submission.answerReview")}</Text>
              {answers.map((answer, index) => (
                <View key={answer.question_id} style={styles.answerCard}>
                  <Text style={styles.qIndex}>
                    {t("common.questionN", { n: index + 1 })}
                  </Text>
                  <Text style={styles.qTitle}>{answer.question_title}</Text>
                  <Text style={styles.meta}>
                    {t("quiz.submission.yourAnswer", {
                      answer: formatSubmittedAnswer(answer.submitted_answer),
                    })}
                  </Text>
                  {answer.is_correct != null ? (
                    <StatusPill
                      label={
                        answer.is_correct ? t("common.correct") : t("common.incorrect")
                      }
                      tone={answer.is_correct ? "success" : "danger"}
                    />
                  ) : (
                    <StatusPill
                      label={t("quiz.submission.pendingReview")}
                      tone="warning"
                    />
                  )}
                  {answer.answer_explanation ? (
                    <Text style={styles.body}>
                      {stripHtml(answer.answer_explanation)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {courseSlug ? (
            <Button
              title={t("quiz.submission.backToQuizzes")}
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          title={t("common.notFound")}
          message={t("quiz.submission.notFound")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 24,
    color: colors.ink,
  },
  score: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 20,
    color: colors.ink,
  },
  meta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 21,
  },
  section: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: colors.ink,
  },
  answers: { gap: spacing.md, marginTop: spacing.sm },
  answerCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  qIndex: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.primary,
  },
  qTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
});
