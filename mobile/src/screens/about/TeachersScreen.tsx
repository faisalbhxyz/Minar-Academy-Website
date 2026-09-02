import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { fullName, getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

export function TeachersScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["instructors"],
    queryFn: api.fetchInstructors,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("errors.teachers.loadFailed"))
    : null;

  return (
    <Screen loading={query.isLoading && !query.data}>
      <AppHeader title={t("profile.teachers")} onBack={() => navigation.goBack()} />
      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={(query.data?.length ?? 0) > 0 ? styles.row : undefined}
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
              title={t("errors.teachers.emptyTitle")}
              message={t("errors.teachers.emptyMessage")}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.fallback]}>
                <Text style={styles.letter}>
                  {(item.first_name?.[0] || "T").toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={2}>
              {fullName(item.first_name, item.last_name)}
            </Text>
            {item.designation ? (
              <Text style={styles.role} numberOfLines={2}>
                {item.designation}
              </Text>
            ) : null}
          </View>
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
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  fallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: "#fff",
  },
  name: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
    textAlign: "center",
  },
  role: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
