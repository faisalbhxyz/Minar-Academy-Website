import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
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

type Props = NativeStackScreenProps<AppStackParamList, "ResourceNotes">;

export function ResourceNotesScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { classSlug, subjectSlug, paperSlug, title } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["academic-notes", classSlug, subjectSlug, paperSlug],
    queryFn: () =>
      api.fetchAcademicNotesByPaper(classSlug, subjectSlug, paperSlug),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const notes = query.data?.notes ?? [];
  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("resources.notes.loadFailed"))
    : null;

  return (
    <Screen loading={query.isLoading && !query.data}>
      <AppHeader title={title} onBack={() => navigation.goBack()} />
      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={notes.length > 0 ? styles.row : undefined}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          errorMessage ? (
            <EmptyState
              title={t("common.loadFailed")}
              message={errorMessage}
              actionLabel={t("common.retry")}
              onAction={() => void query.refetch()}
            />
          ) : (
            <EmptyState
              title={t("resources.notes.emptyTitle")}
              message={t("resources.notes.emptyMessage")}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("NoteViewer", {
                title: item.title,
                pdfUrl: item.pdf_url,
                fileName: item.pdf_file_name,
              })
            }
            style={({ pressed }) => [
              styles.card,
              pressed ? { opacity: 0.92 } : null,
            ]}
          >
            {item.thumbnail ? (
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Text style={styles.pdfMark}>{t("common.pdf")}</Text>
              </View>
            )}
            <Text style={styles.noteTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: 120,
    backgroundColor: colors.primarySoft,
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  pdfMark: {
    fontFamily: "Outfit_700Bold",
    color: colors.primary,
    fontSize: 16,
  },
  noteTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 2,
  },
});
