import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import type { ClassOption } from "@/lib/classCategories";
import { colors, radii, spacing } from "@/theme";

type Props = {
  visible: boolean;
  classes: ClassOption[];
  selectedSlug?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSelect: (classItem: ClassOption) => void;
};

export function ClassSelectModal({
  visible,
  classes,
  selectedSlug,
  loading = false,
  onClose,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />
        <View style={styles.dropdown}>
          <Text style={styles.title}>{t("home.classSelect.title")}</Text>
          {loading && classes.length === 0 ? (
            <View style={styles.statusBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.statusText}>
                {t("home.classSelect.loading")}
              </Text>
            </View>
          ) : classes.length === 0 ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                {t("home.classSelect.empty")}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {classes.map((item, index) => {
                const isSelected = item.slug === selectedSlug;
                const isLast = index === classes.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected ? styles.optionActive : null,
                      isLast ? styles.optionLast : null,
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
                        {item.icon_label || item.title.slice(0, 2)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected ? styles.optionTitleActive : null,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {isSelected ? (
                      <Iconify
                        icon="solar:check-circle-bold"
                        size={20}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    paddingTop: 132,
    paddingHorizontal: spacing.xl,
  },
  dropdown: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    maxHeight: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    color: colors.inkMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  statusText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    color: "#fff",
  },
  optionTitle: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.ink,
  },
  optionTitleActive: {
    color: colors.primaryDark,
  },
});
