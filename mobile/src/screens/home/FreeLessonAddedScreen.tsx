import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Iconify } from "react-native-iconify";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import {
  freeLessonToPlayerParams,
  type FreeLessonCatalogItem,
} from "@/lib/freeLessons";
import type { AppStackParamList } from "@/navigation/types";
import { colors, radii, spacing } from "@/theme";

function AddedLessonRow({
  item,
  onPress,
}: {
  item: FreeLessonCatalogItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? { opacity: 0.9 } : null]}
    >
      <View style={styles.thumb}>
        {item.featuredImage ? (
          <Image
            source={{ uri: item.featuredImage }}
            style={styles.thumbImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.thumbFallback} />
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.lessonTitle}
        </Text>
        <Text style={styles.rowReady}>{t("home.freeClasses.readyToPlay")}</Text>
      </View>
    </Pressable>
  );
}

export function FreeLessonAddedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, "FreeLessonAdded">>();
  const lessons = route.params.lessons ?? [];

  const playLesson = useCallback(
    (item: FreeLessonCatalogItem) => {
      navigation.navigate("LessonPlayer", freeLessonToPlayerParams(item));
    },
    [navigation]
  );

  const playFirst = useCallback(() => {
    if (lessons[0]) playLesson(lessons[0]);
  }, [lessons, playLesson]);

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Iconify icon="solar:check-circle-bold" size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{t("home.freeClasses.addedTitle")}</Text>
          <Text style={styles.heroSub}>{t("home.freeClasses.addedSubtitle")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("home.freeClasses.myFreeLessons")}</Text>
          <View style={styles.list}>
            {lessons.map((item) => (
              <AddedLessonRow
                key={item.lessonId}
                item={item}
                onPress={() => playLesson(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title={t("home.freeClasses.playFirst")}
          onPress={playFirst}
          disabled={lessons.length === 0}
        />
        <Button
          title={t("home.freeClasses.goToHub")}
          onPress={() => navigation.navigate("FreeLessons")}
          variant="secondary"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: "#eef7f5",
    gap: spacing.sm,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
    color: colors.ink,
    textAlign: "center",
  },
  heroSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.ink,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbFallback: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  rowReady: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
});
