import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  AppState,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Iconify } from "react-native-iconify";
import { useQuery } from "@tanstack/react-query";

import * as WebBrowser from "expo-web-browser";
import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { withDRMProtection } from "@/components/withDRMProtection";
import { useTranslation } from "@/i18n";
import {
  extractHtmlFileLinks,
  extractVimeoId,
  extractYouTubeId,
  formatFileSize,
  isPdfFile,
  lessonResourceUrl,
  normalizeLessonResources,
  sameMediaUrl,
  stripHtml,
} from "@/lib/format";
import { isDownloadableMaterial, isDownloadableLesson, offlineIdForMaterial } from "@/lib/offlineDownloads";
import {
  dismissReviewPrompt,
  isReviewPromptDismissed,
} from "@/lib/courseReview";
import { buildPlyrPlayerHtml } from "@/lib/plyrPlayerHtml";
import { useLessonWatch } from "@/lib/useLessonWatch";
import {
  flattenLessonsForNavigation,
  LESSON_COMPLETE_THRESHOLD,
  lessonNeighbors,
  lessonToPlayerParams,
} from "@/lib/watchProgress";
import { colors, radii, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useLearningStore, userCourseKey } from "@/store/learningStore";

type Props = NativeStackScreenProps<AppStackParamList, "LessonPlayer">;

const PLAYER_ORIGIN = "https://minaracademy.com";
const SCREEN_W = Dimensions.get("window").width;
const PLAYER_H = Math.round((SCREEN_W * 9) / 16);

function FileTypeIcon({ isPdf }: { isPdf: boolean }) {
  return (
    <View style={styles.resourceIcon}>
      <View style={styles.fileFold} />
      <Text style={styles.fileTypeLabel}>{isPdf ? "PDF" : "FILE"}</Text>
    </View>
  );
}

type ProgressHandler = (current: number, duration: number) => void;

function ResumableVideoPlayer({
  uri,
  startAt,
  onProgress,
  onEnded,
}: {
  uri: string;
  startAt: number;
  onProgress: ProgressHandler;
  onEnded: () => void;
}) {
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const sought = useRef(false);
  onProgressRef.current = onProgress;
  onEndedRef.current = onEnded;

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
    instance.timeUpdateEventInterval = 1;
  });

  useEffect(() => {
    sought.current = false;
    const timeSub = player.addListener("timeUpdate", ({ currentTime }) => {
      onProgressRef.current(currentTime, player.duration || 0);
    });
    const endSub = player.addListener("playToEnd", () => {
      onEndedRef.current();
    });
    const sourceSub = player.addListener("sourceLoad", ({ duration }) => {
      if (!sought.current && startAt > 3 && duration > 0 && startAt < duration - 5) {
        player.currentTime = startAt;
        sought.current = true;
      }
      player.play();
    });
    player.play();
    return () => {
      timeSub.remove();
      endSub.remove();
      sourceSub.remove();
    };
  }, [player, startAt]);

  return (
    <VideoView
      player={player}
      style={styles.webview}
      nativeControls
      contentFit="contain"
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

function DRMLessonPlayerSlot({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const ProtectedDRMLessonPlayerSlot = withDRMProtection(DRMLessonPlayerSlot);

export function LessonPlayerScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const notesScrollRef = useRef<ScrollView>(null);
  const user = useAuthStore((s) => s.user);
  const setLastLesson = useLearningStore((s) => s.setLastLesson);
  const {
    courseId,
    courseSlug,
    courseTitle,
    lessonId,
    lessonTitle,
    lessonDescription,
    lessonType,
    sourceType,
    sourceData,
    offlineDownloadable: routeOfflineDownloadable,
  } = route.params;
  const cachedProgress = useLearningStore((s) =>
    user?.id ? s.progressByUserCourse[userCourseKey(user.id, courseSlug)] : undefined
  );

  const hydrateDownloads = useDownloadsStore((s) => s.hydrate);
  const downloadsReady = useDownloadsStore((s) => s.ready);
  const offline = useDownloadsStore((s) => s.items[lessonId]);
  const downloading = useDownloadsStore((s) => s.downloading[lessonId]);
  const downloadProgress = useDownloadsStore((s) => s.progress[lessonId] ?? 0);
  const downloadItems = useDownloadsStore((s) => s.items);
  const downloadingMap = useDownloadsStore((s) => s.downloading);
  const startDownload = useDownloadsStore((s) => s.startDownload);
  const removeDownload = useDownloadsStore((s) => s.remove);

  const courseQuery = useQuery({
    queryKey: ["course", courseSlug],
    queryFn: () => api.fetchCourseBySlug(courseSlug),
    staleTime: 5 * 60_000,
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments"],
    queryFn: api.fetchEnrollments,
    staleTime: 60_000,
    enabled: Boolean(user?.id),
  });
  const progressQuery = useQuery({
    queryKey: ["course-progress", courseSlug],
    queryFn: () => api.fetchCourseProgress(courseSlug),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const enrolled = useMemo(() => {
    if (!user?.id || !enrollmentsQuery.data) return false;
    return enrollmentsQuery.data.some((e) => e.course_id === courseId);
  }, [courseId, enrollmentsQuery.data, user?.id]);

  const alreadyCompleted = Boolean(
    progressQuery.data?.completed_lesson_ids?.some(
      (id) => Number(id) === Number(lessonId)
    )
  );
  const completionPromptShown = useRef(false);

  const handleCourseCompleted = useCallback(async () => {
    if (completionPromptShown.current) return;
    completionPromptShown.current = true;
    if (await isReviewPromptDismissed(courseSlug)) return;
    try {
      const summary = await api.fetchCourseReviews(courseSlug);
      if (summary?.student_review || summary?.can_review === false) return;
    } catch {
      // Still offer review prompt if summary fetch fails.
    }

    Alert.alert(
      t("learning.lesson.courseCompleteAlertTitle"),
      t("learning.lesson.courseCompleteAlertMessage", { title: courseTitle }),
      [
        {
          text: t("learning.lesson.reviewLater"),
          style: "cancel",
          onPress: () => {
            void dismissReviewPrompt(courseSlug);
          },
        },
        {
          text: t("learning.lesson.writeReview"),
          onPress: () => {
            navigation.navigate("CourseReview", {
              slug: courseSlug,
              courseTitle,
            });
          },
        },
      ]
    );
  }, [courseSlug, courseTitle, navigation, t]);

  const watch = useLessonWatch({
    courseSlug,
    lessonId,
    courseId,
    userId: user?.id,
    source: enrolled ? "enrolled" : "free_lesson",
    alreadyCompleted,
    onCourseCompleted: () => {
      void handleCourseCompleted();
    },
  });

  useEffect(() => {
    notesScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [lessonId]);

  useEffect(() => {
    if (!downloadsReady) void hydrateDownloads();
  }, [downloadsReady, hydrateDownloads]);

  const lessons = useMemo(
    () =>
      flattenLessonsForNavigation(
        courseQuery.data?.course_chapters,
        lessonId
      ),
    [courseQuery.data?.course_chapters, lessonId]
  );
  const liveLesson = useMemo(() => {
    const chapters = courseQuery.data?.course_chapters ?? [];
    for (const chapter of chapters) {
      const match = (chapter.course_lessons ?? []).find(
        (lesson) => Number(lesson.id) === Number(lessonId)
      );
      if (match) return match;
    }
    return undefined;
  }, [courseQuery.data?.course_chapters, lessonId]);

  useEffect(() => {
    if (!user?.id) return;
    setLastLesson(user.id, {
      courseId,
      courseSlug,
      courseTitle,
      lessonId,
      lessonTitle,
      lessonDescription: lessonDescription ?? null,
      lessonType,
      sourceType,
      sourceData,
      offlineDownloadable:
        liveLesson?.offline_downloadable === true ||
        routeOfflineDownloadable === true,
      updatedAt: new Date().toISOString(),
    });
  }, [
    courseId,
    courseSlug,
    courseTitle,
    lessonDescription,
    lessonId,
    lessonTitle,
    lessonType,
    liveLesson?.offline_downloadable,
    routeOfflineDownloadable,
    setLastLesson,
    sourceData,
    sourceType,
    user?.id,
  ]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") watch.flush();
    });
    return () => {
      watch.flush();
      sub.remove();
    };
  }, [watch.flush]);

  const localUri = offline?.localUri ?? null;
  const isTextLesson = lessonType === "text";
  const downloadPct = Math.round(downloadProgress * 100);

  const youtubeId = useMemo(
    () => (sourceType === "vimeo" ? null : extractYouTubeId(sourceData)),
    [sourceData, sourceType]
  );
  const vimeoId = useMemo(
    () => (sourceType === "vimeo" ? extractVimeoId(sourceData) : null),
    [sourceData, sourceType]
  );

  const playerHtml = useMemo(() => {
    if (localUri || isTextLesson) return null;
    if (sourceType === "vimeo" && vimeoId) {
      return buildPlyrPlayerHtml({
        provider: "vimeo",
        videoId: vimeoId,
        autoPlay: true,
        title: lessonTitle,
        startAt: watch.startAt,
      });
    }
    if (youtubeId) {
      return buildPlyrPlayerHtml({
        provider: "youtube",
        videoId: youtubeId,
        autoPlay: true,
        title: lessonTitle,
        startAt: watch.startAt,
      });
    }
    return null;
  }, [
    isTextLesson,
    lessonTitle,
    localUri,
    sourceType,
    vimeoId,
    watch.startAt,
    youtubeId,
  ]);

  const { prev, next, index } = useMemo(
    () => lessonNeighbors(lessons, lessonId),
    [lessonId, lessons]
  );

  const courseProgressPercent =
    progressQuery.data?.progress_percent ?? cachedProgress?.percent ?? 0;
  const lessonsCompleted =
    progressQuery.data?.lessons_completed ??
    cachedProgress?.completedIds.length ??
    0;
  const lessonsTotal = progressQuery.data?.lessons_total ?? lessons.length;
  const showCourseProgress = Boolean(
    user?.id && (progressQuery.data || cachedProgress)
  );
  const autoCompleteThreshold = Math.round(LESSON_COMPLETE_THRESHOLD * 100);

  const htmlDescription = liveLesson?.description ?? lessonDescription ?? "";
  const canDownload =
    enrolled &&
    (liveLesson
      ? isDownloadableLesson(liveLesson)
      : lessonType !== "text" && routeOfflineDownloadable === true);

  const notes = useMemo(() => {
    if (!htmlDescription.trim()) return "";
    const shareUrl = liveLesson?.download_url ?? "";
    const driveUrl = liveLesson?.source?.data?.drive_url ?? "";
    let text = stripHtml(htmlDescription);
    for (const url of [shareUrl, driveUrl]) {
      if (url) text = text.replace(url, " ");
    }
    text = text
      .replace(
        /https?:\/\/(?:drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com)\/\S+/gi,
        (url) =>
          (shareUrl && sameMediaUrl(url, shareUrl)) ||
          (driveUrl && sameMediaUrl(url, driveUrl))
            ? " "
            : url
      )
      .replace(/\s{2,}/g, " ")
      .trim();
    return text;
  }, [htmlDescription, liveLesson?.download_url, liveLesson?.source?.data?.drive_url]);

  const materials = useMemo(() => {
    const shareUrl = liveLesson?.download_url ?? "";
    const driveUrl = liveLesson?.source?.data?.drive_url ?? "";
    const isOfflineDriveLink = (url: string) =>
      Boolean(
        (shareUrl && sameMediaUrl(url, shareUrl)) ||
          (driveUrl && sameMediaUrl(url, driveUrl))
      );

    const fromApi = normalizeLessonResources(liveLesson?.resources)
      .map((resource) => {
        const url = lessonResourceUrl(resource);
        if (!url) return null;
        if (isOfflineDriveLink(url)) return null;
        return {
          key: `resource-${resource.id}`,
          title: resource.title || t("common.classNotes"),
          url,
          mimeType: resource.mime_type,
          size: resource.file_size,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const seen = new Set(fromApi.map((item) => item.url));
    const fromHtml = extractHtmlFileLinks(htmlDescription)
      .filter((link) => !seen.has(link.href))
      .filter((link) => !isOfflineDriveLink(link.href))
      .map((link, index) => ({
        key: `html-${index}-${link.href}`,
        title: link.label,
        url: link.href,
        mimeType: undefined as string | undefined,
        size: undefined as number | undefined,
      }));

    return [...fromApi, ...fromHtml];
  }, [
    htmlDescription,
    liveLesson?.download_url,
    liveLesson?.resources,
    liveLesson?.source?.data?.drive_url,
    t,
  ]);

  const courseMeta = useMemo(
    () =>
      courseQuery.data ?? {
        id: courseId,
        slug: courseSlug,
        title: courseTitle,
      },
    [courseId, courseQuery.data, courseSlug, courseTitle]
  );

  const openLesson = useCallback(
    (lesson: NonNullable<typeof next>) => {
      watch.flush();
      navigation.replace(
        "LessonPlayer",
        lessonToPlayerParams(courseMeta, lesson)
      );
    },
    [courseMeta, navigation, watch.flush]
  );

  const onDownloadPress = async () => {
    if (!canDownload && !offline) return;
    if (offline) {
      Alert.alert(
        t("learning.lesson.offlineDeleteTitle"),
        t("learning.lesson.offlineDeleteMessage", { title: lessonTitle }),
        [
          { text: t("common.no"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => {
              void removeDownload(lessonId);
            },
          },
        ]
      );
      return;
    }
    if (downloading) return;
    try {
      await startDownload({
        lessonId,
        courseId,
        courseSlug,
        courseTitle,
        lessonTitle,
        lessonDescription: lessonDescription ?? null,
        sourceType,
        mode: "api",
      });
    } catch (err) {
      Alert.alert(
        t("learning.lesson.saveFailed"),
        err instanceof Error ? err.message : t("learning.lesson.saveFailedRetry")
      );
    }
  };

  const onPlayerMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        current?: number;
        duration?: number;
      };
      const current = Number(payload.current) || 0;
      const duration = Number(payload.duration) || 0;
      if (payload.type === "progress" || payload.type === "ready") {
        watch.onTick(current, duration);
      }
      if (payload.type === "ended") {
        watch.onTick(Math.max(current, duration), duration);
        void watch.completeLesson().catch(() => undefined);
      }
    } catch {
      // Ignore malformed WebView messages.
    }
  };

  const openExternal = async () => {
    const watchUrl = youtubeId
      ? `https://www.youtube.com/watch?v=${youtubeId}`
      : vimeoId
        ? `https://vimeo.com/${vimeoId}`
        : sourceData;
    if (!watchUrl) return;
    const can = await Linking.canOpenURL(watchUrl);
    if (can) await Linking.openURL(watchUrl);
  };

  const openMaterial = async (material: (typeof materials)[number]) => {
    if (isPdfFile(material.mimeType, `${material.url} ${material.title}`)) {
      const materialId = offlineIdForMaterial(material.url);
      const local = downloadItems[materialId];
      navigation.navigate("NoteViewer", {
        title: material.title,
        pdfUrl: local?.localUri ?? material.url,
        fileName: material.title,
        fitWidth: true,
      });
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(material.url);
    } catch {
      const can = await Linking.canOpenURL(material.url);
      if (can) await Linking.openURL(material.url);
    }
  };

  const onMaterialDownloadPress = async (
    material: (typeof materials)[number]
  ) => {
    if (
      !isDownloadableMaterial(material.url, material.title, material.mimeType)
    ) {
      return;
    }
    const materialId = offlineIdForMaterial(material.url);
    if (downloadItems[materialId]) {
      Alert.alert(
        t("learning.lesson.offlineDeleteTitle"),
        t("learning.lesson.offlineDeleteMessage", { title: material.title }),
        [
          { text: t("common.no"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => {
              void removeDownload(materialId);
            },
          },
        ]
      );
      return;
    }
    if (downloadingMap[materialId]) return;
    try {
      await startDownload({
        lessonId: materialId,
        courseId,
        courseSlug,
        courseTitle,
        lessonTitle: material.title,
        lessonDescription: lessonDescription ?? null,
        sourceType: "pdf",
        mode: "direct",
        remoteUrl: material.url,
      });
    } catch (err) {
      Alert.alert(
        t("learning.lesson.saveFailed"),
        err instanceof Error ? err.message : t("learning.lesson.saveFailedRetry")
      );
    }
  };

  /**
   * Prefer local offline file when saved. Otherwise stream YouTube/Vimeo
   * (or upload URL) — never use Drive share links for playback.
   */
  const nativeVideoUri = localUri ?? (sourceType === "upload" ? sourceData : null);
  const resumeHint =
    watch.ready && watch.startAt > 3 ? t("learning.lesson.resumeHint") : null;
  const saveHint =
    canDownload && !localUri
      ? downloading
        ? t("learning.lesson.savingProgress", { percent: downloadPct })
        : t("learning.lesson.savePrompt")
      : localUri
        ? t("learning.lesson.offlineAvailable")
        : null;

  return (
    <Screen
      edges={["top", "left", "right"]}
      header={
        <AppHeader
          title={lessonTitle}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.root}>
        <View style={styles.courseRow}>
          <Text style={styles.course} numberOfLines={1}>
            {courseTitle}
            {index >= 0 ? ` · ${index + 1}/${lessons.length}` : ""}
          </Text>
          {localUri ? <Text style={styles.offlineBadge}>{t("common.offline")}</Text> : null}
          {watch.completed ? (
            <Text style={styles.doneBadge}>{t("common.completed")}</Text>
          ) : null}
          {canDownload || offline ? (
            <Pressable
              onPress={() => void onDownloadPress()}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t("learning.lesson.saveOffline")}
              style={({ pressed }) => [
                styles.courseDownload,
                pressed ? { opacity: 0.7 } : null,
              ]}
            >
              <Iconify
                icon={
                  offline
                    ? "solar:check-circle-bold"
                    : "solar:download-minimalistic-bold"
                }
                size={16}
                color={offline ? colors.success : colors.primary}
              />
              <Text
                style={[
                  styles.courseDownloadText,
                  offline ? { color: colors.success } : null,
                ]}
              >
                {downloading
                  ? `${downloadPct}%`
                  : offline
                    ? t("common.offline")
                    : t("learning.lesson.download")}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {showCourseProgress ? (
          <View style={styles.courseProgressWrap}>
            <Text style={styles.courseProgressLabel}>
              {t("learning.lesson.courseProgressLabel", {
                percent: Math.round(courseProgressPercent),
                lessonsPart: progressQuery.data
                  ? t("learning.lesson.courseProgressLessons", {
                      done: lessonsCompleted,
                      total: lessonsTotal,
                    })
                  : "",
              })}
            </Text>
            <ProgressBar percent={courseProgressPercent} />
          </View>
        ) : null}

        {isTextLesson ? null : (
          <View style={styles.player}>
            <ProtectedDRMLessonPlayerSlot drmCheckKey={lessonId}>
              {nativeVideoUri && watch.ready ? (
                <ResumableVideoPlayer
                  key={`${lessonId}-${nativeVideoUri}`}
                  uri={nativeVideoUri}
                  startAt={watch.startAt}
                  onProgress={watch.onTick}
                  onEnded={() => void watch.completeLesson().catch(() => undefined)}
                />
              ) : playerHtml && watch.ready ? (
                <WebView
                  key={`webview-${lessonId}`}
                  source={{ html: playerHtml, baseUrl: PLAYER_ORIGIN }}
                  style={styles.webview}
                  containerStyle={styles.webview}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  mixedContentMode="always"
                  setSupportMultipleWindows={false}
                  scrollEnabled={false}
                  bounces={false}
                  onMessage={onPlayerMessage}
                  userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                />
              ) : !watch.ready ? (
                <View style={styles.fallback}>
                  <Text style={styles.fallbackMsg}>{t("learning.lesson.playerPreparing")}</Text>
                </View>
              ) : (
                <View style={styles.fallback}>
                  <Text style={styles.fallbackTitle}>{t("learning.lesson.videoNotFound")}</Text>
                  <Text style={styles.fallbackMsg}>
                    {t("learning.lesson.videoPlayFailed")}
                  </Text>
                  {sourceData ? (
                    <Button title={t("learning.lesson.openExternal")} onPress={openExternal} />
                  ) : null}
                </View>
              )}
            </ProtectedDRMLessonPlayerSlot>
          </View>
        )}

        {!isTextLesson && watch.ready && !watch.completed && watch.watchPercent > 0 ? (
          <View style={styles.lessonProgressWrap}>
            <Text style={styles.lessonProgressLabel}>
              {t("learning.lesson.lessonWatchLabel", {
                percent: watch.watchPercent,
              })}
              {watch.watchPercent >= autoCompleteThreshold
                ? t("learning.lesson.autoCompleting")
                : t("learning.lesson.autoCompleteHint", {
                    threshold: autoCompleteThreshold,
                  })}
            </Text>
            <ProgressBar percent={watch.watchPercent} />
          </View>
        ) : null}

        <ScrollView
          ref={notesScrollRef}
          style={styles.notesScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notesContent}
        >
          {resumeHint ? <Text style={styles.resumeHint}>{resumeHint}</Text> : null}
          {saveHint ? <Text style={styles.streamHint}>{saveHint}</Text> : null}

          <View style={styles.navRow}>
            <Button
              title={t("learning.lesson.previous")}
              variant="ghost"
              disabled={!prev}
              onPress={() => prev && openLesson(prev)}
              style={styles.navBtn}
              leftIcon={
                <Iconify
                  icon="solar:alt-arrow-left-linear"
                  size={18}
                  color={colors.ink}
                />
              }
            />
            <Button
              title={t("learning.lesson.nextLesson")}
              variant="secondary"
              disabled={!next}
              onPress={() => next && openLesson(next)}
              style={styles.navBtn}
              rightIcon={
                <Iconify
                  icon="solar:alt-arrow-right-linear"
                  size={18}
                  color={colors.primaryDark}
                />
              }
            />
          </View>

          <Text style={styles.notesHeading}>{t("learning.lesson.notesHeading")}</Text>
          {materials.length > 0
            ? materials.map((material) => {
                const isPdf = isPdfFile(
                  material.mimeType,
                  `${material.url} ${material.title}`
                );
                const canSaveMaterial =
                  isPdf &&
                  isDownloadableMaterial(
                    material.url,
                    material.title,
                    material.mimeType
                  );
                const materialId = canSaveMaterial
                  ? offlineIdForMaterial(material.url)
                  : null;
                const materialSaved = materialId
                  ? Boolean(downloadItems[materialId])
                  : false;
                const materialDownloading = materialId
                  ? Boolean(downloadingMap[materialId])
                  : false;
                return (
                  <View key={material.key} style={styles.resourceRow}>
                    <Pressable
                      onPress={() => void openMaterial(material)}
                      style={({ pressed }) => [
                        styles.resourceMain,
                        pressed ? { opacity: 0.88 } : null,
                      ]}
                    >
                      <FileTypeIcon isPdf={isPdf} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resourceTitle} numberOfLines={2}>
                          {material.title}
                        </Text>
                        <Text style={styles.resourceMeta}>
                          {isPdf ? t("common.pdf") : t("common.file")}
                          {material.size
                            ? ` · ${formatFileSize(material.size)}`
                            : ""}
                          {t("learning.lesson.viewSuffix")}
                        </Text>
                      </View>
                    </Pressable>
                    {canSaveMaterial ? (
                      <Pressable
                        onPress={() => void onMaterialDownloadPress(material)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t("learning.lesson.saveOffline")}
                        style={({ pressed }) => [
                          styles.resourceDownloadBtn,
                          pressed ? { opacity: 0.7 } : null,
                        ]}
                      >
                        {materialDownloading ? (
                          <Text style={styles.resourceDownloadPct}>…</Text>
                        ) : (
                          <Iconify
                            icon={
                              materialSaved
                                ? "solar:check-circle-bold"
                                : "solar:download-minimalistic-bold"
                            }
                            size={20}
                            color={
                              materialSaved ? colors.success : colors.primary
                            }
                          />
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            : null}
          {notes ? <Text style={styles.notesBody}>{notes}</Text> : null}
          {!notes && materials.length === 0 && !canDownload ? (
            <Text style={styles.notesEmpty}>
              {courseQuery.isFetching
                ? t("learning.lesson.notesLoading")
                : t("learning.lesson.noNotes")}
            </Text>
          ) : null}
          {canDownload || offline ? (
            <Button
              title={
                downloading
                  ? t("learning.lesson.savingPct", { percent: downloadPct })
                  : offline
                    ? t("learning.lesson.offlineSaved")
                    : t("learning.lesson.saveOffline")
              }
              variant={offline ? "ghost" : "secondary"}
              loading={Boolean(downloading)}
              onPress={() => void onDownloadPress()}
            />
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  course: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  offlineBadge: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doneBadge: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.success,
    backgroundColor: "#e8f6ee",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseProgressWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  courseProgressLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.inkMuted,
  },
  lessonProgressWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  lessonProgressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  player: {
    width: SCREEN_W,
    height: PLAYER_H,
    backgroundColor: "#000",
    alignSelf: "center",
    overflow: "hidden",
  },
  webview: {
    width: SCREEN_W,
    height: PLAYER_H,
    backgroundColor: "#000",
  },
  notesScroll: {
    flex: 1,
  },
  notesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  resumeHint: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  streamHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    backgroundColor: colors.secondarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    lineHeight: 20,
  },
  navRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  notesHeading: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.secondarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  resourceDownloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceDownloadPct: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  resourceIcon: {
    width: 40,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 7,
    overflow: "hidden",
  },
  fileFold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: colors.secondarySoft,
    borderLeftColor: colors.primaryDark,
  },
  fileTypeLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.5,
    color: "#fff",
  },
  resourceTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.ink,
  },
  resourceMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  notesBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  notesEmpty: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkFaint,
    lineHeight: 20,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.ink,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.md,
  },
  fallbackTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  fallbackMsg: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  courseDownload: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  courseDownloadText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.primary,
  },
});
