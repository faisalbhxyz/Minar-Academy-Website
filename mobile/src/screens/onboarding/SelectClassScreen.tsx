import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ClassLevelIcon } from "@/components/onboarding/ClassLevelIcon";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useTranslation } from "@/i18n";
import {
  needsHscBatch,
  type ClassLevel,
} from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, radii, spacing } from "@/theme";
import type { OnboardingStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SelectClass">;

const GRID_LEVELS: ClassLevel[] = [
  "class_five",
  "class_six",
  "class_seven",
  "class_eight",
];
const FULL_WIDTH_LEVELS: ClassLevel[] = ["class_9_10_ssc", "hsc_beyond"];

export function SelectClassScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setDraftClassLevel = useOnboardingStore((s) => s.setDraftClassLevel);

  const onSelect = (level: ClassLevel) => {
    setDraftClassLevel(level);
    if (needsHscBatch(level)) {
      navigation.navigate("SelectHscBatch");
      return;
    }
    navigation.navigate("Welcome");
  };

  return (
    <OnboardingLayout progress={25} title={t("onboarding.class.title")}>
      <View style={styles.grid}>
        {GRID_LEVELS.map((level) => (
          <Pressable
            key={level}
            onPress={() => onSelect(level)}
            style={({ pressed }) => [
              styles.gridCard,
              pressed && styles.pressed,
            ]}
          >
            <ClassLevelIcon level={level} compact />
            <Text style={styles.gridLabel}>
              {t(`onboarding.class.${level}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.fullList}>
        {FULL_WIDTH_LEVELS.map((level) => (
          <Pressable
            key={level}
            onPress={() => onSelect(level)}
            style={({ pressed }) => [
              styles.fullCard,
              pressed && styles.pressed,
            ]}
          >
            <ClassLevelIcon level={level} />
            <View style={styles.fullText}>
              <Text style={styles.gridLabel}>
                {t(`onboarding.class.${level}`)}
              </Text>
              {level === "hsc_beyond" ? (
                <Text style={styles.hint}>
                  {t("onboarding.class.hscBeyondHint")}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridCard: {
    width: "47%",
    flexGrow: 1,
    flexBasis: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  fullList: {
    gap: spacing.md,
  },
  fullCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  fullText: {
    flex: 1,
    gap: 2,
  },
  gridLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
    flex: 1,
  },
  hint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: colors.primarySoft,
  },
});
