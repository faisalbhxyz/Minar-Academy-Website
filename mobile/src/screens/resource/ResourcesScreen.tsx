import React, { useState } from "react";
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
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

export function ResourcesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["academic-notes"],
    queryFn: api.fetchAcademicNoteClasses,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("resources.error.loadFailed"))
    : null;

  return (
    <Screen loading={query.isLoading && !query.data}>
      <AppHeader title={t("resources.title")} onBack={() => navigation.goBack()} />
      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <Text style={styles.intro}>{t("resources.intro")}</Text>
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
              title={t("resources.empty.title")}
              message={t("resources.empty.message")}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("ResourceClass", {
                classSlug: item.slug,
                classTitle: item.title,
              })
            }
            style={({ pressed }) => [
              styles.card,
              pressed ? { opacity: 0.9 } : null,
            ]}
          >
            <View
              style={[
                styles.icon,
                { backgroundColor: item.icon_color || colors.primary },
              ]}
            >
              <Text style={styles.iconLabel}>
                {item.icon_label || t("resources.class.defaultIconLabel")}
              </Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.count}>
                {t("resources.sheetsCountPdf", { count: item.note_count })}
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </Pressable>
        )}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  meta: { flex: 1, gap: 4 },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  count: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  chevron: {
    fontSize: 16,
    color: colors.primary,
  },
});
