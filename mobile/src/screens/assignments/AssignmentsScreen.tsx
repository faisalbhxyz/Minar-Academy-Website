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
import {
  assignmentResultLabel,
  buildDashboardAssignments,
} from "@/lib/assignments";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

export function AssignmentsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments"],
    queryFn: api.fetchEnrollments,
  });
  const submissionsQuery = useQuery({
    queryKey: ["assignment-submissions"],
    queryFn: () => api.fetchAssignmentSubmissions(),
  });

  const items = useMemo(
    () =>
      buildDashboardAssignments(
        enrollmentsQuery.data ?? [],
        submissionsQuery.data ?? []
      ),
    [enrollmentsQuery.data, submissionsQuery.data]
  );

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
          t("assignments.error.loadFailed")
        )
      : null;

  return (
    <Screen loading={loading}>
      <AppHeader title={t("assignments.title")} onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.courseSlug}-${item.assignment.id}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <Text style={styles.intro}>{t("assignments.intro")}</Text>
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
              title={t("assignments.empty.title")}
              message={t("assignments.empty.message")}
              actionLabel={t("assignments.empty.action")}
              onAction={() => navigation.navigate("MyLearning")}
            />
          )
        }
        renderItem={({ item }) => {
          const submission = item.submission;
          return (
            <Pressable
              onPress={() =>
                navigation.navigate("AssignmentDetail", {
                  courseSlug: item.courseSlug,
                  assignmentId: item.assignment.id,
                  assignmentTitle: item.assignment.title,
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed ? { opacity: 0.92 } : null,
              ]}
            >
              <Text style={styles.title}>{item.assignment.title}</Text>
              <Text style={styles.meta}>
                {item.courseTitle} · {item.chapterTitle}
              </Text>
              <Text style={styles.marks}>
                {t("assignments.marks", {
                  total: item.assignment.total_marks,
                  pass: item.assignment.minimum_pass_marks,
                })}
              </Text>
              {submission ? (
                <StatusPill
                  label={assignmentResultLabel(submission)}
                  tone={
                    submission.status === "pending_review"
                      ? "warning"
                      : submission.passed
                        ? "success"
                        : "danger"
                  }
                />
              ) : (
                <StatusPill label={t("common.notSubmitted")} tone="neutral" />
              )}
            </Pressable>
          );
        }}
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
  marks: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.secondary,
  },
});
