import React, { useCallback } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Iconify } from "react-native-iconify";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";
import type { StudentNotification } from "@/types/api";
import type { AppStackParamList } from "@/navigation/types";

function notificationBody(notification: StudentNotification): string {
  return notification.body ?? notification.message ?? "";
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: api.fetchNotifications,
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const onRefresh = useCallback(async () => {
    await notificationsQuery.refetch();
  }, [notificationsQuery]);

  const notifications = notificationsQuery.data ?? [];

  return (
    <Screen
      loading={notificationsQuery.isLoading && notifications.length === 0}
      header={
        <AppHeader
          title={t("notifications.title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={notificationsQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          !notificationsQuery.isLoading ? (
            <EmptyState
              title={t("notifications.emptyTitle")}
              message={t("notifications.emptyMessage")}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!item.is_read) markReadMutation.mutate(item.id);
            }}
            style={({ pressed }) => [
              styles.card,
              !item.is_read ? styles.cardUnread : null,
              pressed ? { opacity: 0.92 } : null,
            ]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  !item.is_read ? styles.iconWrapUnread : null,
                ]}
              >
                <Iconify
                  icon="solar:bell-bold"
                  size={20}
                  color={!item.is_read ? colors.primary : colors.inkFaint}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                {notificationBody(item) ? (
                  <Text style={styles.body}>{notificationBody(item)}</Text>
                ) : null}
                <Text style={styles.time}>{formatWhen(item.created_at)}</Text>
              </View>
              {!item.is_read ? <View style={styles.unreadDot} /> : null}
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    gap: spacing.sm,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardUnread: {
    borderColor: colors.primarySoft,
    backgroundColor: "#f8fcfb",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapUnread: {
    backgroundColor: colors.primarySoft,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  time: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
});
