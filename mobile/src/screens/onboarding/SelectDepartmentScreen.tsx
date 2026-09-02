import React from "react";
import { StyleSheet, View } from "react-native";
import { Iconify } from "react-native-iconify";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { useTranslation } from "@/i18n";
import { DEPARTMENTS, type Department } from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { radii } from "@/theme";
import type { OnboardingStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectDepartment"
>;

const DEPT_CONFIG: Record<
  Department,
  { color: string; icon: "science" | "business" | "humanities" }
> = {
  science: { color: "#8b5cf6", icon: "science" },
  business_studies: { color: "#eab308", icon: "business" },
  humanities: { color: "#38bdf8", icon: "humanities" },
};

function DepartmentIcon({ department }: { department: Department }) {
  const config = DEPT_CONFIG[department];
  const iconName =
    config.icon === "science"
      ? "solar:atom-bold"
      : config.icon === "business"
        ? "solar:chart-2-bold"
        : "solar:global-bold";

  return (
    <View style={[styles.icon, { backgroundColor: config.color }]}>
      <Iconify icon={iconName} size={22} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function SelectDepartmentScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const setDraftDepartment = useOnboardingStore((s) => s.setDraftDepartment);
  const batch = route.params.batch;

  const onSelect = (department: Department) => {
    setDraftDepartment(department);
    navigation.navigate("Welcome");
  };

  const batchLabel = t(`onboarding.batch.${batch}.title`);

  return (
    <OnboardingLayout
      progress={80}
      title={t("onboarding.department.title", { batch: batchLabel })}
      onBack={() => navigation.goBack()}
    >
      {DEPARTMENTS.map((department) => (
        <OnboardingOptionCard
          key={department}
          title={t(`onboarding.department.${department}`)}
          icon={<DepartmentIcon department={department} />}
          onPress={() => onSelect(department)}
        />
      ))}
    </OnboardingLayout>
  );
}
