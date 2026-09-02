import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import { colors, radii, spacing } from "@/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, secureTextEntry, ...rest }: Props) {
  const { t } = useTranslation();
  const isPassword = secureTextEntry === true;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.inkFaint}
          style={[
            styles.input,
            isPassword ? styles.inputWithToggle : null,
            error ? styles.inputError : null,
            style,
          ]}
          secureTextEntry={isPassword ? hidden : undefined}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            style={styles.toggle}
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? t("common.showPassword") : t("common.hidePassword")
            }
          >
            <Iconify
              icon={hidden ? "solar:eye-bold" : "solar:eye-closed-bold"}
              size={20}
              color={colors.inkFaint}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
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
  inputWithToggle: {
    paddingRight: spacing.xxxl + spacing.sm,
  },
  toggle: {
    position: "absolute",
    right: spacing.lg,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.danger,
  },
});
