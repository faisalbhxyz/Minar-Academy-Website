import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ExitAppModal({ visible, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.message}>{t("nav.exitApp.message")}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.cancelLabel}>{t("nav.exitApp.notNow")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.confirmLabel}>{t("nav.exitApp.confirm")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  message: {
    fontFamily: "DMSans_500Medium",
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
  confirmLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  pressed: {
    opacity: 0.88,
  },
});
