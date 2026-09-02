import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Iconify } from "react-native-iconify";

import * as api from "@/api";
import { CourseCard } from "@/components/CourseCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EmptyState } from "@/components/EmptyState";
import { EnrolledCoursesSection } from "@/components/EnrolledCoursesSection";
import { LearningActivityCard } from "@/components/LearningActivityCard";
import { QuickAccessRow } from "@/components/QuickAccessRow";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useTranslation } from "@/i18n";
import { showHelpCenterOptions } from "@/lib/helpCenter";
import {
  buildCertificateIdByCourseId,
  buildLearningReportSummary,
  fetchEnrollmentsWithProgress,
} from "@/lib/learningReport";
import { snapshotToPlayerParams } from "@/lib/watchProgress";
import { useAuthStore } from "@/store/authStore";
import { useLatestLastLesson } from "@/store/learningStore";
import { colors, radii, spacing } from "@/theme";
import type { Banner } from "@/types/api";
import type { AppStackParamList } from "@/navigation/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_SIDE = spacing.xl;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_SIDE * 2;
const BANNER_HEIGHT = 160;
const AUTO_PLAY_MS = 3000;
const SLIDE_ANIM_MS = 350;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const lastLesson = useLatestLastLesson(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList<Banner>>(null);
  const bannerIndexRef = useRef(0);
  const isBannerFocused = useRef(true);
  const loopResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bannersQuery = useQuery({
    queryKey: ["banners"],
    queryFn: api.fetchBanners,
  });
  const coursesQuery = useQuery({
    queryKey: ["courses", 12],
    queryFn: () => api.fetchCourses(12),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.fetchCategories,
  });
  const academicClassesQuery = useQuery({
    queryKey: ["academic-note-classes"],
    queryFn: api.fetchAcademicNoteClasses,
    staleTime: 5 * 60_000,
  });
  const learningReportQuery = useQuery({
    queryKey: ["learning-report"],
    queryFn: async () => {
      const [items, certificates] = await Promise.all([
        fetchEnrollmentsWithProgress(),
        api.fetchStudentCertificates(),
      ]);
      return {
        items,
        summary: buildLearningReportSummary(items, certificates.length),
        certificateByCourseId: buildCertificateIdByCourseId(certificates),
      };
    },
    enabled: Boolean(user?.id),
    staleTime: 2 * 60_000,
  });

  const learningInsightsQuery = useQuery({
    queryKey: ["learning-report-api", "7d"],
    queryFn: () => api.fetchLearningReport("7d"),
    enabled: Boolean(user?.id),
    staleTime: 2 * 60_000,
  });

  const summary = learningReportQuery.data?.summary;
  const classLabel =
    academicClassesQuery.data?.[0]?.title ??
    (summary && summary.enrolledCourses > 0
      ? t("common.enrolledCoursesCount", { count: summary.enrolledCourses })
      : t("common.chooseCourse"));

  const banners = bannersQuery.data ?? [];
  // Clone first slide at end so last → first slides in from the side (website loop)
  const sliderData =
    banners.length > 1 ? [...banners, banners[0]] : banners;

  useFocusEffect(
    useCallback(() => {
      isBannerFocused.current = true;
      return () => {
        isBannerFocused.current = false;
      };
    }, [])
  );

  useEffect(() => {
    bannerIndexRef.current = 0;
    setBannerIndex(0);
    bannerListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      if (!isBannerFocused.current) return;
      const next = bannerIndexRef.current + 1;
      bannerListRef.current?.scrollToOffset({
        offset: next * BANNER_WIDTH,
        animated: true,
      });

      if (next >= banners.length) {
        bannerIndexRef.current = 0;
        setBannerIndex(0);
        if (loopResetTimer.current) clearTimeout(loopResetTimer.current);
        loopResetTimer.current = setTimeout(() => {
          bannerListRef.current?.scrollToOffset({
            offset: 0,
            animated: false,
          });
        }, SLIDE_ANIM_MS);
      } else {
        bannerIndexRef.current = next;
        setBannerIndex(next);
      }
    }, AUTO_PLAY_MS);

    return () => {
      clearInterval(timer);
      if (loopResetTimer.current) clearTimeout(loopResetTimer.current);
    };
  }, [banners.length]);

  const onBannerScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / BANNER_WIDTH);
    if (index >= banners.length) {
      bannerIndexRef.current = 0;
      setBannerIndex(0);
      bannerListRef.current?.scrollToOffset({ offset: 0, animated: false });
      return;
    }
    if (index >= 0 && index < banners.length) {
      bannerIndexRef.current = index;
      setBannerIndex(index);
    }
  };

  const openBanner = async (banner: Banner) => {
    if (!banner.url) return;
    try {
      const canOpen = await Linking.canOpenURL(banner.url);
      if (canOpen) await Linking.openURL(banner.url);
    } catch {
      // ignore invalid banner links
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      bannersQuery.refetch(),
      coursesQuery.refetch(),
      categoriesQuery.refetch(),
      academicClassesQuery.refetch(),
      learningReportQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const loading =
    (bannersQuery.isLoading || coursesQuery.isLoading) &&
    !bannersQuery.data &&
    !coursesQuery.data;

  return (
    <Screen loading={loading}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}
      >
        <DashboardHeader
          user={user}
          classLabel={classLabel}
          onSearch={() => navigation.navigate("Search")}
          onNotifications={() => navigation.navigate("Notifications")}
          onProfilePress={() => navigation.getParent()?.navigate("Profile")}
          onClassPress={() => navigation.navigate("Resources")}
          onEditProfile={() => navigation.navigate("EditProfile")}
        />

        <QuickAccessRow
          items={[
            {
              key: "courses",
              label: t("home.quickAccess.myCourses"),
              color: "#f97316",
              icon: (
                <Iconify
                  icon="solar:book-2-bold"
                  size={24}
                  color="#fff"
                />
              ),
              onPress: () => navigation.getParent()?.navigate("Learning"),
            },
            {
              key: "notes",
              label: t("home.quickAccess.academicNotes"),
              color: "#ef4444",
              icon: (
                <Iconify
                  icon="solar:notebook-bold"
                  size={24}
                  color="#fff"
                />
              ),
              onPress: () => navigation.navigate("Resources"),
            },
            {
              key: "report",
              label: t("home.quickAccess.learningReport"),
              color: "#8b5cf6",
              icon: (
                <Iconify
                  icon="solar:chart-2-bold"
                  size={24}
                  color="#fff"
                />
              ),
              onPress: () => navigation.navigate("LearningReport"),
            },
            {
              key: "certificates",
              label: t("home.quickAccess.certificates"),
              color: "#f59e0b",
              icon: (
                <Iconify
                  icon="solar:medal-ribbons-star-bold"
                  size={24}
                  color="#fff"
                />
              ),
              onPress: () => navigation.navigate("Certificates"),
            },
            {
              key: "help",
              label: t("home.quickAccess.helpCenter"),
              color: "#22c55e",
              icon: (
                <Iconify
                  icon="solar:phone-calling-bold"
                  size={24}
                  color="#fff"
                />
              ),
              onPress: () => showHelpCenterOptions(t),
            },
          ]}
        />

        {learningReportQuery.data?.items &&
        learningReportQuery.data.items.length > 0 ? (
          <EnrolledCoursesSection
            items={learningReportQuery.data.items}
            certificateByCourseId={
              learningReportQuery.data.certificateByCourseId
            }
            onCoursePress={(slug) =>
              navigation.navigate("CourseDetail", { slug })
            }
            onCertificatePress={(certificateId) =>
              navigation.navigate("CertificateDetail", { certificateId })
            }
            onViewAll={() => navigation.getParent()?.navigate("Learning")}
          />
        ) : null}

        {banners.length > 0 ? (
          <View style={styles.bannerSection}>
            <View style={styles.bannerFrame}>
              <FlatList
                ref={bannerListRef}
                horizontal
                data={sliderData}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                decelerationRate="fast"
                onMomentumScrollEnd={onBannerScrollEnd}
                getItemLayout={(_, index) => ({
                  length: BANNER_WIDTH,
                  offset: BANNER_WIDTH * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.bannerSlide}
                    onPress={() => void openBanner(item)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.bannerImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      recyclingKey={String(item.id)}
                    />
                  </Pressable>
                )}
              />
            </View>
            {banners.length > 1 ? (
              <View style={styles.dots}>
                {banners.map((banner, index) => (
                  <View
                    key={banner.id}
                    style={[
                      styles.dot,
                      index === bannerIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {user ? (
          <LearningActivityCard
            streakDays={learningInsightsQuery.data?.streak_days ?? 0}
            onPress={() => navigation.navigate("LearningReport")}
          />
        ) : null}

        {lastLesson ? (
          <Pressable
            onPress={() =>
              navigation.navigate(
                "LessonPlayer",
                snapshotToPlayerParams(lastLesson)
              )
            }
            style={({ pressed }) => [
              styles.continueCard,
              pressed ? { opacity: 0.92 } : null,
            ]}
          >
            <Text style={styles.continueKicker}>
              {t("home.continueLesson.kicker")}
            </Text>
            <Text style={styles.continueTitle} numberOfLines={2}>
              {lastLesson.lessonTitle}
            </Text>
            <Text style={styles.continueCourse} numberOfLines={1}>
              {lastLesson.courseTitle}
            </Text>
          </Pressable>
        ) : null}

        {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
          <>
            <SectionHeader
              title={t("home.categories.title")}
              subtitle={t("home.categories.subtitle")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categoriesQuery.data.slice(0, 12).map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.chip}
                  onPress={() =>
                    navigation.getParent()?.navigate("Courses", {
                      screen: "CoursesMain",
                      params: {
                        categorySlug: cat.slug,
                        categoryName: cat.name,
                      },
                    })
                  }
                >
                  <Text style={styles.chipText}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader
          title={t("home.popular.title")}
          subtitle={t("home.popular.subtitle")}
          actionLabel={t("common.viewAll")}
          onAction={() => navigation.getParent()?.navigate("Courses")}
        />

        {coursesQuery.data && coursesQuery.data.length > 0 ? (
          <FlatList
            horizontal
            data={coursesQuery.data}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseList}
            initialNumToRender={4}
            windowSize={5}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                onPress={() =>
                  navigation.navigate("CourseDetail", { slug: item.slug })
                }
              />
            )}
          />
        ) : (
          <EmptyState
            title={t("home.empty.coursesNotFound")}
            message={t("home.empty.tryAgainLater")}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  continueCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  continueKicker: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  continueTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.ink,
    lineHeight: 24,
  },
  continueCourse: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  bannerSection: {
    paddingHorizontal: BANNER_SIDE,
    paddingTop: spacing.md,
  },
  bannerFrame: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.primarySoft,
  },
  bannerSlide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
  },
  chipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.ink,
  },
  courseList: {
    paddingHorizontal: spacing.xl,
  },
});
