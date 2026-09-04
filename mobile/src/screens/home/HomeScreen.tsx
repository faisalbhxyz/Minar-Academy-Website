import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { ClassSelectModal } from "@/components/ClassSelectModal";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EnrolledCoursesSection } from "@/components/EnrolledCoursesSection";
import { LearningActivityCard } from "@/components/LearningActivityCard";
import { QuickAccessRow } from "@/components/QuickAccessRow";
import { HelpCenterModal } from "@/components/HelpCenterModal";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useTranslation } from "@/i18n";
import {
  buildCertificateIdByCourseId,
  buildLearningReportSummary,
  fetchEnrollmentsWithProgress,
} from "@/lib/learningReport";
import {
  findClassOption,
  getClassSubcategories,
  type ClassOption,
} from "@/lib/classCategories";
import { fetchFreeLessonCatalog } from "@/lib/freeLessons";
import { HomeBannerSection } from "@/screens/home/components/HomeBannerSection";
import { HomeContinueLesson } from "@/screens/home/components/HomeContinueLesson";
import { HomeFreeClasses } from "@/screens/home/components/HomeFreeClasses";
import { HomePopularCourses } from "@/screens/home/components/HomePopularCourses";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useLatestLastLesson, useLearningStore } from "@/store/learningStore";
import { colors, radii, spacing } from "@/theme";
import { snapshotToPlayerParams } from "@/lib/watchProgress";
import type { AppStackParamList } from "@/navigation/types";
import { Iconify } from "react-native-iconify";

const CategoryChip = memo(function CategoryChip({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{name}</Text>
    </Pressable>
  );
});

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const preferredClassSlug = useOnboardingStore((s) => s.preferredClassSlug);
  const setPreferredClassSlug = useOnboardingStore(
    (s) => s.setPreferredClassSlug
  );
  const lastLesson = useLatestLastLesson(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [classSelectOpen, setClassSelectOpen] = useState(false);
  const [selectedClassSlug, setSelectedClassSlug] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fromServer =
      preferredClassSlug ?? user?.class_profile?.preferred_class_slug ?? null;
    if (fromServer) {
      setSelectedClassSlug(fromServer);
    }
  }, [preferredClassSlug, user?.class_profile?.preferred_class_slug]);

  const bannersQuery = useQuery({
    queryKey: ["banners"],
    queryFn: api.fetchBanners,
    staleTime: 5 * 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.fetchCategories,
    staleTime: 10 * 60_000,
  });
  const classOptions = useMemo(
    () => getClassSubcategories(categoriesQuery.data),
    [categoriesQuery.data]
  );
  const activeClassSlug = useMemo(() => {
    if (
      selectedClassSlug &&
      classOptions.some((c) => c.slug === selectedClassSlug)
    ) {
      return selectedClassSlug;
    }
    return classOptions[0]?.slug ?? null;
  }, [classOptions, selectedClassSlug]);

  const coursesQuery = useQuery({
    queryKey: ["courses-by-menu", activeClassSlug ?? "all"],
    queryFn: () =>
      activeClassSlug
        ? api.fetchCoursesByMenu(activeClassSlug)
        : api.fetchCourses(12),
    staleTime: 3 * 60_000,
  });
  const freeLessonsQuery = useQuery({
    queryKey: ["free-lesson-catalog", activeClassSlug ?? "all"],
    queryFn: () =>
      fetchFreeLessonCatalog({
        classSlug: activeClassSlug ?? undefined,
      }),
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
    queryKey: ["learning-report-api", "7d", user?.id],
    queryFn: () => api.fetchLearningReport("7d"),
    enabled: Boolean(user?.id) && Boolean(learningReportQuery.data),
    staleTime: 30_000,
  });

  const localDailyWatch = useLearningStore((s) => s.dailyWatchByUserDate);
  const streakDays = useMemo(() => {
    const apiStreak = learningInsightsQuery.data?.streak_days ?? 0;
    // Server report is authoritative once GET succeeds.
    if (learningInsightsQuery.data && !learningInsightsQuery.isError) {
      return apiStreak;
    }
    if (!user?.id) return apiStreak;

    const prefix = `${user.id}:`;
    let localStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, "0");
      const d = String(day.getDate()).padStart(2, "0");
      const key = `${prefix}${y}-${m}-${d}`;
      const localSec = localDailyWatch[key] ?? 0;
      if (localSec > 0) {
        localStreak += 1;
        continue;
      }
      break;
    }
    return Math.max(apiStreak, localStreak);
  }, [
    learningInsightsQuery.data,
    learningInsightsQuery.isError,
    localDailyWatch,
    user?.id,
  ]);

  const summary = learningReportQuery.data?.summary;
  const selectedClass = useMemo(
    () => findClassOption(classOptions, activeClassSlug),
    [classOptions, activeClassSlug]
  );

  const classLabel =
    selectedClass?.title ??
    (summary && summary.enrolledCourses > 0
      ? t("common.enrolledCoursesCount", { count: summary.enrolledCourses })
      : t("common.chooseCourse"));

  const banners = bannersQuery.data ?? [];
  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .filter((cat) => cat.slug !== "classes")
        .slice(0, 12),
    [categoriesQuery.data]
  );

  const popularCourses = useMemo(() => {
    const list = coursesQuery.data ?? [];
    return list.slice(0, 12);
  }, [coursesQuery.data]);

  const navigateToSearch = useCallback(
    () => navigation.navigate("Search"),
    [navigation]
  );
  const navigateToNotifications = useCallback(
    () => navigation.navigate("Notifications"),
    [navigation]
  );
  const navigateToProfile = useCallback(
    () => navigation.getParent()?.navigate("Profile"),
    [navigation]
  );
  const navigateToResources = useCallback(
    () => navigation.navigate("Resources"),
    [navigation]
  );
  const openClassSelect = useCallback(() => {
    setClassSelectOpen(true);
  }, []);
  const onSelectClass = useCallback(
    (classItem: ClassOption) => {
      setSelectedClassSlug(classItem.slug);
      void setPreferredClassSlug(classItem.slug);
      setClassSelectOpen(false);
    },
    [setPreferredClassSlug]
  );
  const navigateToEditProfile = useCallback(
    () => navigation.navigate("EditProfile"),
    [navigation]
  );
  const navigateToLearningTab = useCallback(
    () => navigation.getParent()?.navigate("Learning"),
    [navigation]
  );
  const navigateToLearningReport = useCallback(
    () => navigation.navigate("LearningReport"),
    [navigation]
  );
  const navigateToCertificates = useCallback(
    () => navigation.navigate("Certificates"),
    [navigation]
  );
  const navigateToCoursesTab = useCallback(() => {
    if (selectedClass) {
      navigation.getParent()?.navigate("Courses", {
        screen: "CoursesMain",
        params: {
          categorySlug: selectedClass.slug,
          categoryName: selectedClass.title,
          filter: "menu",
        },
      });
      return;
    }
    navigation.getParent()?.navigate("Courses");
  }, [navigation, selectedClass]);
  const navigateToFreeLessons = useCallback(() => {
    navigation.navigate("FreeLessons");
  }, [navigation]);
  const onCoursePress = useCallback(
    (slug: string) => navigation.navigate("CourseDetail", { slug }),
    [navigation]
  );
  const onCertificatePress = useCallback(
    (certificateId: number) =>
      navigation.navigate("CertificateDetail", { certificateId }),
    [navigation]
  );
  const onContinueLesson = useCallback(() => {
    if (!lastLesson) return;
    navigation.navigate("LessonPlayer", snapshotToPlayerParams(lastLesson));
  }, [lastLesson, navigation]);

  const quickAccessItems = useMemo(
    () => [
      {
        key: "courses",
        label: t("home.quickAccess.myCourses"),
        color: "#f97316",
        icon: <Iconify icon="solar:book-2-bold" size={24} color="#fff" />,
        onPress: navigateToLearningTab,
      },
      {
        key: "notes",
        label: t("home.quickAccess.academicNotes"),
        color: "#ef4444",
        icon: <Iconify icon="solar:notebook-bold" size={24} color="#fff" />,
        onPress: navigateToResources,
      },
      {
        key: "freeClass",
        label: t("home.quickAccess.freeClass"),
        color: "#246962",
        icon: <Iconify icon="solar:play-circle-bold" size={24} color="#fff" />,
        onPress: navigateToFreeLessons,
      },
      {
        key: "report",
        label: t("home.quickAccess.learningReport"),
        color: "#8b5cf6",
        icon: <Iconify icon="solar:chart-2-bold" size={24} color="#fff" />,
        onPress: navigateToLearningReport,
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
        onPress: navigateToCertificates,
      },
      {
        key: "help",
        label: t("home.quickAccess.helpCenter"),
        color: "#22c55e",
        icon: (
          <Iconify icon="solar:phone-calling-bold" size={24} color="#fff" />
        ),
        onPress: () => setHelpCenterOpen(true),
      },
    ],
    [
      t,
      navigateToLearningTab,
      navigateToResources,
      navigateToFreeLessons,
      navigateToLearningReport,
      navigateToCertificates,
    ]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      bannersQuery.refetch(),
      coursesQuery.refetch(),
      freeLessonsQuery.refetch(),
      categoriesQuery.refetch(),
      user?.id ? learningReportQuery.refetch() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [
    bannersQuery.refetch,
    coursesQuery.refetch,
    freeLessonsQuery.refetch,
    categoriesQuery.refetch,
    learningReportQuery.refetch,
    user?.id,
  ]);

  const navigateToCategory = useCallback(
    (categorySlug: string, categoryName: string) => {
      navigation.getParent()?.navigate("Courses", {
        screen: "CoursesMain",
        params: {
          categorySlug,
          categoryName,
          filter: "category",
        },
      });
    },
    [navigation]
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}
        removeClippedSubviews
      >
        <DashboardHeader
          user={user}
          classLabel={classLabel}
          onSearch={navigateToSearch}
          onNotifications={navigateToNotifications}
          onProfilePress={navigateToProfile}
          onClassPress={openClassSelect}
          onEditProfile={navigateToEditProfile}
        />

        <QuickAccessRow items={quickAccessItems} />

        <HomeBannerSection banners={banners} />

        <HomeFreeClasses
          lessons={freeLessonsQuery.data ?? []}
          onOpenSelect={navigateToFreeLessons}
        />

        {learningReportQuery.data?.items &&
        learningReportQuery.data.items.length > 0 ? (
          <EnrolledCoursesSection
            items={learningReportQuery.data.items}
            certificateByCourseId={
              learningReportQuery.data.certificateByCourseId
            }
            onCoursePress={onCoursePress}
            onCertificatePress={onCertificatePress}
            onViewAll={navigateToLearningTab}
          />
        ) : null}

        {user ? (
          <LearningActivityCard
            streakDays={streakDays}
            onPress={navigateToLearningReport}
          />
        ) : null}

        {lastLesson ? (
          <HomeContinueLesson
            lesson={lastLesson}
            kicker={t("home.continueLesson.kicker")}
            onPress={onContinueLesson}
          />
        ) : null}

        {categories.length > 0 ? (
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
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  name={cat.name}
                  onPress={() => navigateToCategory(cat.slug, cat.name)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader
          title={t("home.popular.title")}
          subtitle={t("home.popular.subtitle")}
          actionLabel={t("common.viewAll")}
          onAction={navigateToCoursesTab}
        />

        <HomePopularCourses
          courses={popularCourses}
          isPending={coursesQuery.isPending}
          onPressSlug={onCoursePress}
          emptyTitle={t("home.empty.coursesNotFound")}
          emptyMessage={t("home.empty.tryAgainLater")}
        />
      </ScrollView>
      <HelpCenterModal
        visible={helpCenterOpen}
        onClose={() => setHelpCenterOpen(false)}
      />
      <ClassSelectModal
        visible={classSelectOpen}
        classes={classOptions}
        selectedSlug={selectedClass?.slug}
        loading={categoriesQuery.isPending}
        onClose={() => setClassSelectOpen(false)}
        onSelect={onSelectClass}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
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
});
