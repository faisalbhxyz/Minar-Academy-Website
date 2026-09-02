import React, { useCallback } from "react";
import {
  FlatList,
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
import { colors, radii, spacing } from "@/theme";
import type { StudentOrder } from "@/types/api";
import type { AppStackParamList } from "@/navigation/types";

function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusLabel(order: StudentOrder): string {
  return order.payment_status ?? order.status ?? "pending";
}

function OrderRow({ order }: { order: StudentOrder }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{order.course_title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {formatPrice(order.total)}
          {order.payment_method ? ` · ${order.payment_method}` : ""}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabel(order)}</Text>
        </View>
      </View>
      <Text style={styles.subMeta}>
        {order.invoice_id ? `Invoice #${order.invoice_id}` : "—"}
        {" · "}
        {formatWhen(order.created_at)}
      </Text>
      {order.transaction_id ? (
        <Text style={styles.txn}>TXN: {order.transaction_id}</Text>
      ) : null}
    </View>
  );
}

export function OrdersScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const ordersQuery = useQuery({
    queryKey: ["student-orders"],
    queryFn: api.fetchStudentOrders,
    staleTime: 60_000,
  });

  const onRefresh = useCallback(async () => {
    await ordersQuery.refetch();
  }, [ordersQuery]);

  const orders = ordersQuery.data ?? [];

  return (
    <Screen
      loading={ordersQuery.isLoading && orders.length === 0}
      header={
        <AppHeader
          title="অর্ডার ইতিহাস"
          onBack={() => navigation.goBack()}
        />
      }
    >
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          !ordersQuery.isLoading ? (
            <EmptyState
              title="কোনো অর্ডার নেই"
              message="কোর্স কিনলে এখানে অর্ডার দেখাবে।"
            />
          ) : null
        }
        renderItem={({ item }) => <OrderRow order={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  meta: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.inkMuted,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.primaryDark,
    textTransform: "capitalize",
  },
  subMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
  },
  txn: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
});
