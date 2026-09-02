import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchStudentQuiz, submitQuiz } from "@/api/quiz";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import { colors, radii, spacing } from "@/theme";
import type {
  QuizAnswerPayload,
  QuizQuestion,
  QuizSubmissionResult,
  StudentQuizDetail,
} from "@/types/api";
import type { AppStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "Quiz">;
type AnswerMap = Record<number, string | boolean | string[]>;

function quizTimeLimitToSeconds(limit: number, option: string): number {
  if (!limit) return 0;
  const multipliers: Record<string, number> = {
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000,
  };
  return limit * (multipliers[option] ?? 60);
}

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function QuizScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { courseSlug, quizId, quizTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<StudentQuizDetail | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [focusedQuestion, setFocusedQuestion] = useState(0);
  const submittingRef = useRef(false);

  const questions = quiz?.questions ?? [];
  const totalQuestions =
    quiz?.total_questions ||
    quiz?.total_visible_questions ||
    questions.length ||
    0;

  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const value = answers[q.id];
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }).length;
  }, [answers, questions]);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchStudentQuiz(courseSlug, quizId);
      setQuiz(data);
      setAnswers({});
      setFocusedQuestion(0);
      const remaining =
        data.seconds_remaining != null
          ? data.seconds_remaining
          : quizTimeLimitToSeconds(data.time_limit, data.time_limit_option) ||
            null;
      setSecondsLeft(remaining && remaining > 0 ? remaining : null);
    } catch (err) {
      setError(getApiErrorMessage(err, t("quiz.error.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [courseSlug, quizId, t]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const buildPayload = useCallback((): QuizAnswerPayload[] => {
    const known = new Set(questions.map((q) => q.id));
    return Object.entries(answers)
      .filter(([id, value]) => {
        if (!known.has(Number(id))) return false;
        if (value === undefined || value === null) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      })
      .map(([id, value]) => ({
        question_id: Number(id),
        value:
          typeof value === "string"
            ? value.trim()
            : (value as string | boolean | string[]),
      }));
  }, [answers, questions]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittingRef.current || !quiz) return;

      const requiredMissing = questions.filter((q) => {
        if (!q.answer_required) return false;
        const value = answers[q.id];
        if (value === undefined || value === null) return true;
        if (typeof value === "string") return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
      });

      if (!auto && requiredMissing.length > 0) {
        Alert.alert(
          t("quiz.take.answerMissingTitle"),
          t("quiz.take.answerMissingMessage", {
            question: stripHtml(requiredMissing[0].title),
          })
        );
        return;
      }

      const payload = buildPayload();
      if (!auto && payload.length === 0) {
        Alert.alert(t("quiz.take.noAnswersTitle"), t("quiz.take.noAnswersMessage"));
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      try {
        const res = await submitQuiz(courseSlug, quiz.id, payload);
        setResult(res.result);
        setSecondsLeft(null);
      } catch (err) {
        Alert.alert(
          t("quiz.take.submitFailedTitle"),
          getApiErrorMessage(err, t("quiz.take.submitFailedMessage"))
        );
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [answers, buildPayload, courseSlug, questions, quiz, t]
  );

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      void handleSubmit(true);
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(t);
          void handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft, result, handleSubmit]);

  const setSingleAnswer = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const toggleMultiAnswer = (questionId: number, optionId: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId])
        ? [...(prev[questionId] as string[])]
        : [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  };

  const setTextAnswer = (questionId: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const setBoolAnswer = (questionId: number, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (loading) {
    return (
      <Screen
        loading
        header={
          <AppHeader
            title={quizTitle || t("quiz.take.title")}
            onBack={() => navigation.goBack()}
          />
        }
      />
    );
  }

  if (error || !quiz) {
    return (
      <Screen
        edges={["top", "left", "right"]}
        header={
          <AppHeader
            title={quizTitle || t("quiz.take.title")}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error || t("quiz.take.notFound")}
          </Text>
          <Button title={t("common.retry")} onPress={() => void loadQuiz()} />
          <Button
            title={t("quiz.take.back")}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      </Screen>
    );
  }

  if (result) {
    return (
      <Screen
        edges={["top", "left", "right"]}
        scroll
        header={
          <AppHeader
            title={quizTitle || quiz.title}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <View style={styles.resultWrap}>
          <Text style={styles.resultTitle}>
            {result.passed ? t("quiz.result.passed") : t("quiz.result.title")}
          </Text>
          <Text style={styles.resultScore}>
            {t("quiz.result.score", {
              score: result.score,
              max: result.max_score,
              percent: Math.round(result.percentage),
            })}
          </Text>
          <Text style={styles.resultMeta}>
            {result.status === "pending_review"
              ? t("quiz.result.pendingReview")
              : result.passed
                ? t("quiz.result.passedMessage")
                : t("quiz.result.failedMessage")}
          </Text>
          <Button title={t("quiz.result.backToCourse")} onPress={() => navigation.goBack()} />
          {quiz.can_retry ? (
            <Button
              title={t("quiz.result.retry")}
              variant="ghost"
              onPress={() => void loadQuiz()}
            />
          ) : null}
          {result.id ? (
            <Button
              title={t("quiz.result.viewDetails")}
              variant="ghost"
              onPress={() =>
                navigation.navigate("QuizSubmission", {
                  submissionId: result.id,
                  courseSlug,
                })
              }
            />
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      edges={["top", "left", "right"]}
      header={
        <AppHeader
          title={quizTitle || quiz.title}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() =>
              setFocusedQuestion((i) =>
                Math.min(Math.max(i, 0), Math.max(totalQuestions - 1, 0))
              )
            }
            style={styles.progressChip}
          >
            <Text style={styles.progressText}>
              {t("quiz.take.questionProgress", {
                current: Math.min(
                  focusedQuestion + 1,
                  Math.max(totalQuestions, 1)
                ),
                total: Math.max(totalQuestions, questions.length || 1),
              })}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>

          <View style={styles.timerWrap}>
            <Text style={styles.timerIcon}>🕒</Text>
            <Text style={styles.timerText}>
              {secondsLeft != null ? formatTimer(secondsLeft) : "--:--"}
            </Text>
          </View>

          <Pressable
            onPress={() => void handleSubmit(false)}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed ? { opacity: 0.85 } : null,
              submitting ? { opacity: 0.6 } : null,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.ink} />
            ) : (
              <Text style={styles.submitText}>{t("common.submit")}</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.answeredHint}>
          {t("quiz.take.answeredHint", {
            count: answeredCount,
            total: questions.length,
          })}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: spacing.xxl + Math.max(insets.bottom, 8) },
          ]}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const approx = Math.floor(y / 220);
            if (approx !== focusedQuestion && approx >= 0) {
              setFocusedQuestion(approx);
            }
          }}
          scrollEventThrottle={120}
        >
          {questions.map((question, index) => (
            <QuestionBlock
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id]}
              onSelectSingle={(optionId) => {
                setFocusedQuestion(index);
                setSingleAnswer(question.id, optionId);
              }}
              onToggleMulti={(optionId) => {
                setFocusedQuestion(index);
                toggleMultiAnswer(question.id, optionId);
              }}
              onChangeText={(text) => {
                setFocusedQuestion(index);
                setTextAnswer(question.id, text);
              }}
              onSelectBool={(value) => {
                setFocusedQuestion(index);
                setBoolAnswer(question.id, value);
              }}
            />
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

function QuestionBlock({
  question,
  index,
  value,
  onSelectSingle,
  onToggleMulti,
  onChangeText,
  onSelectBool,
}: {
  question: QuizQuestion;
  index: number;
  value: string | boolean | string[] | undefined;
  onSelectSingle: (optionId: string) => void;
  onToggleMulti: (optionId: string) => void;
  onChangeText: (text: string) => void;
  onSelectBool: (value: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionLabel}>
        {t("common.questionN", { n: index + 1 })}
      </Text>
      <Text style={styles.questionTitle}>{stripHtml(question.title)}</Text>
      {question.details ? (
        <Text style={styles.questionDetails}>{stripHtml(question.details)}</Text>
      ) : null}

      {question.type === "single_choice" || question.type === "true_false" ? (
        <View style={styles.options}>
          {(question.type === "true_false"
            ? [
                { id: "true", text: t("common.true") },
                { id: "false", text: t("common.false") },
              ]
            : question.options ?? []
          ).map((option) => {
            const selected =
              question.type === "true_false"
                ? (option.id === "true" && value === true) ||
                  (option.id === "false" && value === false)
                : value === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  if (question.type === "true_false") {
                    onSelectBool(option.id === "true");
                  } else {
                    onSelectSingle(option.id);
                  }
                }}
                style={[
                  styles.option,
                  selected ? styles.optionSelected : null,
                ]}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selected ? styles.radioOuterSelected : null,
                  ]}
                >
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {question.type === "multiple_choice" ? (
        <View style={styles.options}>
          {(question.options ?? []).map((option) => {
            const selected = Array.isArray(value) && value.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => onToggleMulti(option.id)}
                style={[
                  styles.option,
                  selected ? styles.optionSelected : null,
                ]}
              >
                <View
                  style={[
                    styles.checkOuter,
                    selected ? styles.checkOuterSelected : null,
                  ]}
                >
                  {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {question.type === "short_answer" ||
      question.type === "fill_blank" ||
      question.type === "open_ended" ? (
        <TextInput
          value={typeof value === "string" ? value : ""}
          onChangeText={onChangeText}
          placeholder={t("common.answerPlaceholder")}
          placeholderTextColor={colors.inkFaint}
          multiline={question.type === "open_ended"}
          style={styles.textAnswer}
        />
      ) : null}

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 88,
  },
  progressText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: colors.ink,
  },
  chevron: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerIcon: {
    fontSize: 13,
  },
  timerText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.ink,
    minWidth: 42,
    textAlign: "center",
  },
  submitBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: "#fff",
    minWidth: 96,
    alignItems: "center",
  },
  submitText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.ink,
  },
  answeredHint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  questionBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questionLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: colors.ink,
  },
  questionTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  questionDetails: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#fff",
  },
  optionSelected: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.ink,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  checkOuter: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOuterSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  checkMark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  optionText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  textAnswer: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: "top",
  },
  divider: {
    marginTop: spacing.lg,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e5e7eb",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
    textAlign: "center",
  },
  resultWrap: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  resultTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  resultScore: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 20,
    color: colors.primary,
  },
  resultMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
