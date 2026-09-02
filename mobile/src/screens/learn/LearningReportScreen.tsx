import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { LearningReportDashboard } from "@/components/dashboard/LearningReportDashboard";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import {
  fetchFullLearningReport,
  type EnrollmentWithProgress,
  type LearningTimePeriod,
} from "@/lib/learningReport";
import { colors, radii, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

function CourseReportRow({
  item,
  onPress,
}: {
  item: EnrollmentWithProgress;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { enrollment, progress } = item;
  const pct = progress?.progress_percent ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? { opacity: 0.9 } : null]}
    >
      {enrollment.course.featured_image ? (
        <Image
          source={{ uri: enrollment.course.featured_image }}
          style={styles.thumb}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {enrollment.course.title}
        </Text>
        <Text style={styles.rowMeta}>
          {t("learning.report.lessonMeta", {
            done: progress?.lessons_completed ?? 0,
            total: progress?.lessons_total ?? "—",
          })}
          {progress && progress.quizzes_total > 0
            ? t("learning.report.quizMeta", {
                done: progress.quizzes_completed,
                total: progress.quizzes_total,
              })
            : ""}
        </Text>
        <View style={styles.rowProgress}>
          <ProgressBar percent={pct} />
          <Text style={styles.rowPct}>{Math.round(pct)}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function LearningReportScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<
    RouteProp<AppStackParamList, "LearningReportMain" | "LearningReport">
  >();
  const isTabRoot = route.name === "LearningReportMain";
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<LearningTimePeriod>("7d");

  const reportQuery = useQuery({
    queryKey: ["learning-report", period],
    queryFn: () => fetchFullLearningReport(period),
    staleTime: 60_000,
  });

  const report = reportQuery.data;
  const items = report?.items ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await reportQuery.refetch();
    setRefreshing(false);
  };

  const listHeader = useMemo(() => {
    if (!report) return null;
    return (
      <View style={styles.headerBlock}>
        {isTabRoot ? (
          <View style={styles.tabHeader}>
            <Text style={styles.tabTitle}>{t("learning.report.title")}</Text>
          </View>
        ) : null}

        <LearningReportDashboard
          report={report}
          period={period}
          onPeriodChange={setPeriod}
        />

        {items.length > 0 ? (
          <Text style={styles.sectionLabel}>{t("learning.report.byCourse")}</Text>
        ) : null}
      </View>
    );
  }, [report, isTabRoot, period, items.length, t]);

  return (
    <Screen
      loading={reportQuery.isLoading && !reportQuery.data}
      edges={isTabRoot ? ["top", "left", "right"] : undefined}
      header={
        isTabRoot ? undefined : (
          <AppHeader
            title={t("learning.report.title")}
            onBack={() => navigation.goBack()}
          />
        )
      }
    >
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.enrollment.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          report ? (
            <EmptyState
              title={t("learning.report.empty.title")}
              message={t("learning.report.empty.message")}
              actionLabel={t("learning.report.empty.action")}
              onAction={() => navigation.getParent()?.navigate("Courses")}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <CourseReportRow
            item={item}
            onPress={() =>
              navigation.navigate("CourseDetail", {
                slug: item.enrollment.course.slug,
              })
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabHeader: {
    gap: 4,
  },
  tabTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 26,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  thumb: {
    width: 88,
    height: 88,
  },
  thumbFallback: {
    backgroundColor: colors.primarySoft,
  },
  rowBody: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
    justifyContent: "center",
  },
  rowTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
  },
  rowMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  rowProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  rowPct: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.primaryDark,
    width: 36,
    textAlign: "right",
  },
});
