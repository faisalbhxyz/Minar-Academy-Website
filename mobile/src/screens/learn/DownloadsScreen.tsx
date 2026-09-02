import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Iconify } from "react-native-iconify";

import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import {
  formatBytes,
  offlineContentKind,
  type OfflineDownload,
} from "@/lib/offlineDownloads";
import type { AppStackParamList } from "@/navigation/types";
import {
  useDownloadsStore,
  type PendingDownloadMeta,
} from "@/store/downloadsStore";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "DownloadsMain">;

type FilterKey = "latest" | "playlist" | "all" | "book";

type DownloadRow =
  | { kind: "completed"; item: OfflineDownload }
  | { kind: "downloading"; meta: PendingDownloadMeta; progress: number };

function CircularProgress({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  return (
    <View style={styles.progressRing}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.progressPct}>{pct}%</Text>
    </View>
  );
}

function DownloadIcon({ contentKind }: { contentKind: "video" | "book" }) {
  return (
    <View style={styles.iconWrap}>
      <Iconify
        icon={
          contentKind === "book"
            ? "solar:document-text-bold"
            : "solar:play-circle-bold"
        }
        size={22}
        color={colors.secondary}
      />
    </View>
  );
}

export function DownloadsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const hydrate = useDownloadsStore((s) => s.hydrate);
  const ready = useDownloadsStore((s) => s.ready);
  const itemsMap = useDownloadsStore((s) => s.items);
  const pendingMeta = useDownloadsStore((s) => s.pendingMeta);
  const downloadingMap = useDownloadsStore((s) => s.downloading);
  const progressMap = useDownloadsStore((s) => s.progress);
  const remove = useDownloadsStore((s) => s.remove);

  const [filter, setFilter] = useState<FilterKey>("latest");

  const filters: { key: FilterKey; label: string }[] = [
    { key: "latest", label: t("downloads.filter.latest") },
    { key: "playlist", label: t("downloads.filter.playlist") },
    { key: "all", label: t("downloads.filter.all") },
    { key: "book", label: t("downloads.filter.book") },
  ];

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  const rows = useMemo(() => {
    const completed = Object.values(itemsMap).map(
      (item): DownloadRow => ({ kind: "completed", item })
    );

    const inProgress: DownloadRow[] = Object.entries(downloadingMap)
      .filter(([id]) => !itemsMap[Number(id)])
      .map(([id]) => {
        const lessonId = Number(id);
        const meta = pendingMeta[lessonId];
        if (!meta) return null;
        return {
          kind: "downloading" as const,
          meta,
          progress: progressMap[lessonId] ?? 0,
        };
      })
      .filter((row): row is DownloadRow & { kind: "downloading" } => row !== null);

    const all = [...inProgress, ...completed];

    const byDate = (a: DownloadRow, b: DownloadRow) => {
      const aTime =
        a.kind === "completed"
          ? new Date(a.item.downloadedAt).getTime()
          : Date.now();
      const bTime =
        b.kind === "completed"
          ? new Date(b.item.downloadedAt).getTime()
          : Date.now();
      return bTime - aTime;
    };

    switch (filter) {
      case "latest":
        return all.sort(byDate);
      case "playlist":
        return all
          .filter(
            (row) =>
              row.kind === "downloading" ||
              offlineContentKind(row.item) === "video"
          )
          .sort(byDate);
      case "book":
        return completed
          .filter((row) => offlineContentKind(row.item) === "book")
          .sort(byDate);
      case "all":
      default:
        return all.sort(byDate);
    }
  }, [itemsMap, pendingMeta, downloadingMap, progressMap, filter]);

  const openLesson = (params: {
    courseId: number;
    courseSlug: string;
    courseTitle: string;
    lessonId: number;
    lessonTitle: string;
    lessonDescription?: string | null;
    sourceType: string;
    sourceData: string;
  }) => {
    navigation.navigate("LessonPlayer", {
      ...params,
      lessonType: "video",
    });
  };

  const confirmRemove = (lessonId: number, title: string) => {
    Alert.alert(
      t("downloads.deleteConfirm.title"),
      t("downloads.deleteConfirm.message", { title }),
      [
        { text: t("common.no"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            void remove(lessonId);
          },
        },
      ]
    );
  };

  const showItemMenu = (item: OfflineDownload) => {
    Alert.alert(item.lessonTitle, item.courseTitle, [
      {
        text: t("common.play"),
        onPress: () =>
          openLesson({
            courseId: item.courseId,
            courseSlug: item.courseSlug,
            courseTitle: item.courseTitle,
            lessonId: item.lessonId,
            lessonTitle: item.lessonTitle,
            lessonDescription: item.lessonDescription,
            sourceType: item.sourceType,
            sourceData: item.remoteUrl,
          }),
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => confirmRemove(item.lessonId, item.lessonTitle),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const sectionTitle =
    filter === "latest"
      ? t("downloads.section.latest")
      : filter === "playlist"
        ? t("downloads.section.video")
        : filter === "book"
          ? t("downloads.section.book")
          : t("downloads.section.all");

  return (
    <Screen edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("downloads.title")}</Text>
        <Text style={styles.subtitle}>{t("downloads.subtitle")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.chip, active ? styles.chipActive : null]}
            >
              <Text
                style={[styles.chipText, active ? styles.chipTextActive : null]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={rows}
        keyExtractor={(row) =>
          row.kind === "completed"
            ? `done-${row.item.lessonId}`
            : `dl-${row.meta.lessonId}`
        }
        contentContainerStyle={
          rows.length === 0 ? styles.emptyList : styles.list
        }
        ListHeaderComponent={
          rows.length > 0 ? (
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title={t("downloads.empty.title")}
            message={t("downloads.empty.message")}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item: row }) => {
          if (row.kind === "downloading") {
            const { meta, progress } = row;
            return (
              <View style={styles.row}>
                <DownloadIcon contentKind="video" />
                <View style={styles.meta}>
                  <Text style={styles.lessonTitle} numberOfLines={2}>
                    {meta.lessonTitle}
                  </Text>
                  <Text style={styles.courseTitle} numberOfLines={1}>
                    {meta.courseTitle}
                  </Text>
                  <Text style={styles.downloadingLabel}>{t("downloads.downloading")}</Text>
                </View>
                <CircularProgress progress={progress} />
              </View>
            );
          }

          const { item } = row;
          const contentKind = offlineContentKind(item);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed ? { opacity: 0.9 } : null,
              ]}
              onPress={() =>
                openLesson({
                  courseId: item.courseId,
                  courseSlug: item.courseSlug,
                  courseTitle: item.courseTitle,
                  lessonId: item.lessonId,
                  lessonTitle: item.lessonTitle,
                  lessonDescription: item.lessonDescription,
                  sourceType: item.sourceType,
                  sourceData: item.remoteUrl,
                })
              }
            >
              <DownloadIcon contentKind={contentKind} />
              <View style={styles.meta}>
                <Text style={styles.lessonTitle} numberOfLines={2}>
                  {item.lessonTitle}
                </Text>
                <Text style={styles.courseTitle} numberOfLines={1}>
                  {item.courseTitle} · {formatBytes(item.fileSize)}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => showItemMenu(item)}
                accessibilityLabel={t("downloads.moreOptions")}
                style={({ pressed }) => [
                  styles.menuBtn,
                  pressed ? { opacity: 0.65 } : null,
                ]}
              >
                <Iconify
                  icon="solar:menu-dots-bold"
                  size={20}
                  color={colors.inkMuted}
                />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  filters: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  chipTextActive: {
    color: "#fff",
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
  },
  courseTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  downloadingLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  progressPct: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: colors.primary,
  },
});
