import React, { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "ResourceClass">;

export function ResourceClassScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { classSlug, classTitle } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["academic-notes", classSlug],
    queryFn: () => api.fetchAcademicNoteClassDetail(classSlug),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const detail = query.data;
  const subjects = detail?.subjects ?? [];
  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("resources.class.loadFailed"))
    : null;

  return (
    <Screen loading={query.isLoading && !detail}>
      <AppHeader
        title={detail?.title || classTitle}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {errorMessage ? (
          <EmptyState
            title={t("common.loadFailed")}
            message={errorMessage}
            actionLabel={t("common.retry")}
            onAction={() => void query.refetch()}
          />
        ) : subjects.length === 0 ? (
          <EmptyState
            title={t("resources.class.emptyTitle")}
            message={t("resources.class.emptyMessage")}
          />
        ) : (
          subjects.map((subject) => (
            <View key={subject.id} style={styles.section}>
              <Text style={styles.subject}>{subject.title}</Text>
              {subject.papers.map((paper) => (
                <Pressable
                  key={paper.id}
                  onPress={() =>
                    navigation.navigate("ResourceNotes", {
                      classSlug,
                      subjectSlug: subject.slug,
                      paperSlug: paper.slug,
                      title: `${subject.title} · ${paper.title}`,
                    })
                  }
                  style={({ pressed }) => [
                    styles.paper,
                    pressed ? { opacity: 0.9 } : null,
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: paper.icon_color || colors.primary },
                    ]}
                  >
                    <Text style={styles.iconLabel}>
                      {paper.icon_label || t("resources.class.paperIconLabel")}
                    </Text>
                  </View>
                  <View style={styles.meta}>
                    <Text style={styles.paperTitle}>{paper.title}</Text>
                    <Text style={styles.count}>
                      {t("common.sheetsCount", { count: paper.note_count })}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>→</Text>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    flexGrow: 1,
  },
  section: { gap: spacing.sm },
  subject: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  paper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    color: "#fff",
  },
  meta: { flex: 1, gap: 2 },
  paperTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  count: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  chevron: { fontSize: 16, color: colors.primary },
});
