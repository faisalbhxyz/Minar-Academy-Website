import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Iconify } from "react-native-iconify";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { useTranslation } from "@/i18n";
import { HSC_BATCHES, needsDepartment, type HscBatch } from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { radii } from "@/theme";
import type { OnboardingStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SelectHscBatch">;

const BATCH_COLORS: Record<HscBatch, string> = {
  hsc_2026: "#0d9488",
  hsc_2027: "#3b82f6",
  hsc_2028: "#8b5cf6",
  after_hsc: "#f59e0b",
};

function BatchIcon({ batch }: { batch: HscBatch }) {
  if (batch === "after_hsc") {
    return (
      <View
        style={[
          iconStyles.wrap,
          { backgroundColor: BATCH_COLORS.after_hsc },
        ]}
      >
        <Iconify icon="solar:square-academic-cap-bold" size={22} color="#fff" />
      </View>
    );
  }

  const short = batch.replace("hsc_", "");
  return (
    <View
      style={[iconStyles.wrap, { backgroundColor: BATCH_COLORS[batch] }]}
    >
      <Text style={iconStyles.label}>HSC</Text>
      <Text style={iconStyles.year}>{short}</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    color: "#fff",
    lineHeight: 10,
  },
  year: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
    color: "#fff",
    lineHeight: 16,
  },
});

export function SelectHscBatchScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setDraftHscBatch = useOnboardingStore((s) => s.setDraftHscBatch);
  const draftClassLevel = useOnboardingStore((s) => s.draftClassLevel);

  const onSelect = (batch: HscBatch) => {
    setDraftHscBatch(batch);
    if (draftClassLevel && needsDepartment(draftClassLevel, batch)) {
      navigation.navigate("SelectDepartment", { batch });
      return;
    }
    navigation.navigate("Welcome");
  };

  return (
    <OnboardingLayout
      progress={55}
      title={t("onboarding.batch.title")}
      onBack={() => navigation.goBack()}
    >
      {HSC_BATCHES.map((batch) => (
        <OnboardingOptionCard
          key={batch}
          title={t(`onboarding.batch.${batch}.title`)}
          subtitle={t(`onboarding.batch.${batch}.subtitle`)}
          icon={<BatchIcon batch={batch} />}
          onPress={() => onSelect(batch)}
        />
      ))}
    </OnboardingLayout>
  );
}
