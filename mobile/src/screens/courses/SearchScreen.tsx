import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { CourseCardListItem } from "@/components/CourseCardListItem";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "Search">;

export function SearchScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => api.searchCourses(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const onPressSlug = useCallback(
    (slug: string) => navigation.navigate("CourseDetail", { slug }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NonNullable<typeof searchQuery.data>[number] }) => (
      <CourseCardListItem compact course={item} onPressSlug={onPressSlug} />
    ),
    [onPressSlug]
  );

  const keyExtractor = useCallback(
    (item: NonNullable<typeof searchQuery.data>[number]) => String(item.id),
    []
  );

  return (
    <Screen
      header={
        <AppHeader title={t("courses.search.title")} onBack={() => navigation.goBack()} />
      }
    >
      <View style={styles.searchBox}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("courses.search.placeholder")}
          placeholderTextColor={colors.inkFaint}
          autoFocus
          style={styles.input}
        />
      </View>

      {searchQuery.isFetching ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : null}

      {debounced.length < 2 ? (
        <EmptyState
          title={t("courses.search.startTitle")}
          message={t("courses.search.startMessage")}
        />
      ) : (
        <FlatList
          data={searchQuery.data ?? []}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            !searchQuery.isFetching ? (
              <EmptyState
                title={t("courses.search.noResultsTitle")}
                message={t("courses.search.noResultsMessage", { query: debounced })}
              />
            ) : null
          }
          renderItem={renderItem}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: colors.ink,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
