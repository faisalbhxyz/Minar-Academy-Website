import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Iconify } from "react-native-iconify";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { CourseReviewsSection } from "@/components/CourseReviewsSection";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { formatPrice, lessonCount } from "@/lib/format";
import {
  downloadUrlForLesson,
  isDownloadableLesson,
} from "@/lib/offlineDownloads";
import {
  findContinueLesson,
  flattenPlayableLessons,
  lessonToPlayerParams,
} from "@/lib/watchProgress";
import { colors, radii, spacing } from "@/theme";
import type { CourseLesson } from "@/types/api";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import {
  useLearningStore,
  userCourseKey,
} from "@/store/learningStore";

type Props = NativeStackScreenProps<AppStackParamList, "CourseDetail">;

export function CourseDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { slug } = route.params;
  const user = useAuthStore((s) => s.user);
  const setCourseProgress = useLearningStore((s) => s.setCourseProgress);
  const lastLesson = useLearningStore((s) =>
    user?.id ? s.lastByUserCourse[userCourseKey(user.id, slug)] : undefined
  );
  const cachedProgress = useLearningStore((s) =>
    user?.id ? s.progressByUserCourse[userCourseKey(user.id, slug)] : undefined
  );
  const items = useDownloadsStore((s) => s.items);
  const downloadingMap = useDownloadsStore((s) => s.downloading);
  const progressMap = useDownloadsStore((s) => s.progress);
  const startDownload = useDownloadsStore((s) => s.startDownload);

  const courseQuery = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.fetchCourseBySlug(slug),
    staleTime: 5 * 60_000,
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments"],
    queryFn: api.fetchEnrollments,
    staleTime: 60_000,
  });

  const course = courseQuery.data;
  const enrolled = useMemo(() => {
    if (!course || !enrollmentsQuery.data) return false;
    return enrollmentsQuery.data.some((e) => e.course_id === course.id);
  }, [course, enrollmentsQuery.data]);

  const progressQuery = useQuery({
    queryKey: ["course-progress", slug],
    queryFn: () => api.fetchCourseProgress(slug),
    enabled: enrolled,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!user?.id || !progressQuery.data) return;
    setCourseProgress(user.id, slug, {
      percent: progressQuery.data.progress_percent,
      completedIds: progressQuery.data.completed_lesson_ids ?? [],
    });
  }, [progressQuery.data, setCourseProgress, slug, user?.id]);

  const completedLessonIds = useMemo(
    () =>
      new Set(
        progressQuery.data?.completed_lesson_ids ??
          cachedProgress?.completedIds ??
          []
      ),
    [cachedProgress?.completedIds, progressQuery.data?.completed_lesson_ids]
  );
  const progressPercent =
    progressQuery.data?.progress_percent ?? cachedProgress?.percent ?? 0;
  const isCourseCompleted = progressPercent >= 100;

  const chapters = course?.course_chapters ?? [];
  const playableLessons = useMemo(
    () => flattenPlayableLessons(chapters),
    [chapters]
  );
  const continueLesson = useMemo(
    () =>
      findContinueLesson(playableLessons, completedLessonIds, lastLesson?.lessonId),
    [completedLessonIds, lastLesson?.lessonId, playableLessons]
  );
  const hasStarted =
    progressPercent > 0 || Boolean(lastLesson?.lessonId);

  const openLesson = (lesson: CourseLesson) => {
    if (!course) return;
    navigation.navigate("LessonPlayer", lessonToPlayerParams(course, lesson));
  };

  const queueDownload = (lesson: CourseLesson) => {
    if (!course) return;
    const remoteUrl = downloadUrlForLesson(lesson);
    if (!remoteUrl) return;
    void startDownload({
      lessonId: lesson.id,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      lessonDescription: lesson.description ?? null,
      sourceType: lesson.source_type,
      remoteUrl,
    }).catch(() => undefined);
  };

  const hasOfflineVideos = Object.values(items).some(
    (item) => item.courseSlug === slug
  );
  const hasDownloadableLessons = playableLessons.some(isDownloadableLesson);

  return (
    <Screen
      scroll
      loading={courseQuery.isLoading && !course}
      contentContainerStyle={styles.content}
      header={
        <AppHeader
          title={course?.title || t("courses.detail.fallbackTitle")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {course ? (
        <>
          <View style={styles.heroImageWrap}>
            {course.featured_image ? (
              <Image
                source={{ uri: course.featured_image }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={course.slug}
                transition={180}
              />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.heroImage}
              />
            )}
          </View>

          <BrandLogo size="sm" style={styles.logo} />
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.meta}>
            {formatPrice(
              course.pricing_model,
              course.sale_price,
              course.regular_price
            )}
            {" · "}
            {t("courses.detail.lessonCount", {
              count: lessonCount(course.course_chapters),
            })}
            {course.general_settings?.language
              ? ` · ${course.general_settings.language}`
              : ""}
          </Text>

          {enrolled && (progressQuery.data || cachedProgress) ? (
            <View style={styles.progressWrap}>
              <Text style={styles.progressLabel}>
                {t("courses.detail.progressLabel", {
                  percent: Math.round(progressPercent),
                })}
                {progressQuery.data
                  ? t("courses.detail.progressLessons", {
                      done: progressQuery.data.lessons_completed,
                      total: progressQuery.data.lessons_total,
                    })
                  : ""}
              </Text>
              <ProgressBar percent={progressPercent} />
            </View>
          ) : null}

          {course.summary ? (
            <Text style={styles.summary}>{course.summary}</Text>
          ) : null}

          <View style={styles.ctaRow}>
            {enrolled ? (
              <View style={styles.ctaBlock}>
                <Button
                  title={
                    hasStarted
                      ? t("common.continue")
                      : t("courses.detail.startLearning")
                  }
                  onPress={() => continueLesson && openLesson(continueLesson)}
                  disabled={!continueLesson}
                  style={{ alignSelf: "stretch" }}
                />
                {continueLesson ? (
                  <Text style={styles.ctaHint} numberOfLines={1}>
                    {lastLesson?.lessonId === continueLesson.id &&
                    !completedLessonIds.has(continueLesson.id)
                      ? t("courses.detail.resumeHint")
                      : hasStarted
                        ? t("courses.detail.nextLessonHint")
                        : t("courses.detail.firstLessonHint")}
                    {continueLesson.title}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Button
                title={
                  course.pricing_model === "free"
                    ? t("courses.detail.freeEnroll")
                    : t("courses.detail.enrollPay")
                }
                onPress={() =>
                  navigation.navigate("Checkout", {
                    courseId: course.id,
                    courseTitle: course.title,
                    pricingModel: course.pricing_model,
                    priceLabel: formatPrice(
                      course.pricing_model,
                      course.sale_price,
                      course.regular_price
                    ),
                  })
                }
                style={{ flex: 1 }}
              />
            )}
          </View>

          {enrolled && (hasDownloadableLessons || hasOfflineVideos) ? (
            <Pressable
              onPress={() => navigation.getParent()?.navigate("Downloads")}
              style={({ pressed }) => [
                styles.downloadsLink,
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <Iconify
                icon="solar:download-minimalistic-bold"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.downloadsLinkText}>
                {t("courses.detail.viewDownloads")}
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.sectionTitle}>{t("courses.detail.syllabus")}</Text>
          {chapters.map((chapter) => (
            <View key={chapter.id} style={styles.chapter}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              {(chapter.course_lessons ?? []).map((lesson) => {
                const locked = !enrolled && !lesson.is_public;
                const isOffline = Boolean(items[lesson.id]);
                const isDone = completedLessonIds.has(lesson.id);
                const isContinue = continueLesson?.id === lesson.id;
                const canSaveOffline = enrolled && isDownloadableLesson(lesson);
                const isDownloading = Boolean(downloadingMap[lesson.id]);
                const downloadPct = Math.round(
                  (progressMap[lesson.id] ?? 0) * 100
                );

                return (
                  <View
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      isContinue && !locked ? styles.lessonContinue : null,
                    ]}
                  >
                    <Pressable
                      disabled={locked}
                      onPress={() => openLesson(lesson)}
                      accessibilityRole="button"
                      accessibilityLabel={t("courses.detail.playLesson", {
                        title: lesson.title,
                      })}
                      style={({ pressed }) => [
                        styles.lessonMain,
                        locked ? styles.lessonLocked : null,
                        pressed && !locked ? { opacity: 0.85 } : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.playIcon,
                          locked ? styles.playIconLocked : null,
                        ]}
                      >
                        <Iconify
                          icon={
                            locked
                              ? "solar:lock-keyhole-bold"
                              : isDone
                                ? "solar:check-circle-bold"
                                : "solar:play-circle-bold"
                          }
                          size={28}
                          color={
                            locked
                              ? colors.inkFaint
                              : isDone
                                ? colors.success
                                : colors.primary
                          }
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonType}>
                          {lesson.lesson_type}
                          {locked ? t("courses.detail.metaLocked") : ""}
                          {isDone ? t("courses.detail.metaCompleted") : ""}
                          {isContinue && !isDone
                            ? t("courses.detail.metaContinue")
                            : ""}
                          {isOffline ? t("courses.detail.metaOffline") : ""}
                          {isDownloading
                            ? t("courses.detail.metaDownloading", {
                                percent: downloadPct,
                              })
                            : ""}
                        </Text>
                      </View>
                    </Pressable>
                    {canSaveOffline ? (
                      <Pressable
                        onPress={() => queueDownload(lesson)}
                        disabled={isDownloading || isOffline}
                        accessibilityLabel={t("courses.detail.saveOffline")}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.lessonDownload,
                          pressed && !isDownloading && !isOffline
                            ? { opacity: 0.7 }
                            : null,
                        ]}
                      >
                        {isDownloading ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Iconify
                            icon={
                              isOffline
                                ? "solar:check-circle-bold"
                                : "solar:download-minimalistic-bold"
                            }
                            size={22}
                            color={isOffline ? colors.success : colors.primary}
                          />
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
              {(chapter.assignments ?? [])
                .filter((assignment) => assignment.is_published)
                .map((assignment) => {
                  const locked = !enrolled;
                  return (
                    <Pressable
                      key={`assignment-${assignment.id}`}
                      disabled={locked}
                      onPress={() =>
                        navigation.navigate("AssignmentDetail", {
                          courseSlug: course.slug,
                          assignmentId: assignment.id,
                          assignmentTitle: assignment.title,
                        })
                      }
                      style={({ pressed }) => [
                        styles.lessonRow,
                        styles.lessonMain,
                        locked ? styles.lessonLocked : null,
                        pressed && !locked ? { opacity: 0.85 } : null,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonTitle}>
                          {assignment.title}
                        </Text>
                        <Text style={styles.lessonType}>
                          {t("common.assignment")}
                          {locked ? t("courses.detail.metaLocked") : ""}
                        </Text>
                      </View>
                      <Text style={styles.playHint}>{locked ? "🔒" : "✎"}</Text>
                    </Pressable>
                  );
                })}
              {(chapter.quizzes ?? [])
                .filter((quiz) => quiz.is_published)
                .map((quiz) => {
                  const locked = !enrolled;
                  return (
                    <Pressable
                      key={`quiz-${quiz.id}`}
                      disabled={locked}
                      onPress={() =>
                        navigation.navigate("Quiz", {
                          courseSlug: course.slug,
                          quizId: quiz.id,
                          quizTitle: quiz.title,
                        })
                      }
                      style={({ pressed }) => [
                        styles.lessonRow,
                        styles.lessonMain,
                        locked ? styles.lessonLocked : null,
                        pressed && !locked ? { opacity: 0.85 } : null,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonTitle}>{quiz.title}</Text>
                        <Text style={styles.lessonType}>
                          {t("common.quiz")}
                          {locked ? t("courses.detail.metaLocked") : ""}
                        </Text>
                      </View>
                      <Text style={styles.playHint}>{locked ? "🔒" : "☰"}</Text>
                    </Pressable>
                  );
                })}
            </View>
          ))}
          <CourseReviewsSection
            courseSlug={slug}
            courseTitle={course.title}
            isCompleted={enrolled && isCourseCompleted}
            onWriteReview={
              enrolled && isCourseCompleted
                ? () =>
                    navigation.navigate("CourseReview", {
                      slug,
                      courseTitle: course.title,
                    })
                : undefined
            }
          />
        </>
      ) : (
        <Text style={styles.summary}>{t("courses.detail.loadFailed")}</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroImageWrap: {
    borderRadius: radii.lg,
    overflow: "hidden",
    height: 200,
    backgroundColor: colors.primarySoft,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  logo: {
    marginTop: spacing.sm,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
    lineHeight: 34,
  },
  meta: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.secondary,
  },
  summary: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  ctaRow: {
    flexDirection: "row",
    marginVertical: spacing.sm,
  },
  ctaBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  ctaHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  progressWrap: {
    gap: spacing.sm,
  },
  progressLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  lessonContinue: {
    backgroundColor: colors.primarySoft,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  downloadsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  downloadsLinkText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  sectionTitle: {
    marginTop: spacing.md,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: colors.ink,
  },
  chapter: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  chapterTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  lessonMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  lessonDownload: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  playIconLocked: {
    opacity: 0.7,
  },
  lessonLocked: {
    opacity: 0.55,
  },
  lessonTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.ink,
  },
  lessonType: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 2,
    textTransform: "capitalize",
  },
  playHint: {
    fontSize: 14,
    color: colors.primary,
  },
});
