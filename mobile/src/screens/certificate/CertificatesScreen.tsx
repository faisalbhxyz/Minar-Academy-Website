import React, { useState } from "react";
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
import { CertificateCardView } from "@/components/CertificateCardView";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { colors, spacing } from "@/theme";

export function CertificatesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["certificates"],
    queryFn: api.fetchStudentCertificates,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const errorMessage = query.isError
    ? getApiErrorMessage(query.error, t("certificates.error.loadFailed"))
    : null;

  return (
    <Screen loading={query.isLoading && !query.data}>
      <AppHeader
        title={t("certificates.title")}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <Text style={styles.intro}>{t("certificates.intro")}</Text>
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
              title={t("certificates.empty.title")}
              message={t("certificates.empty.message")}
              actionLabel={t("certificates.empty.action")}
              onAction={() => navigation.navigate("MyLearning")}
            />
          )
        }
        renderItem={({ item }) => (
          <CertificateCardView
            certificate={item}
            compact
            onPress={() =>
              navigation.navigate("CertificateDetail", {
                certificateId: item.id,
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
});
