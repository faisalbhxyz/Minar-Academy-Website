import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { colors, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "ChangePassword">;

export function ChangePasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    if (!currentPassword.trim()) {
      setError(t("profile.changePassword.error.currentRequired"));
      return;
    }
    if (password.length < 6) {
      setError(t("profile.changePassword.error.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("profile.changePassword.error.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        password,
        confirm_password: confirmPassword,
      });
      Alert.alert(
        t("profile.changePassword.successTitle"),
        t("profile.changePassword.successMessage"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              void logout();
            },
          },
        ]
      );
    } catch (err) {
      setError(
        getApiErrorMessage(err, t("profile.changePassword.error.failed"))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      header={
        <AppHeader
          title={t("profile.changePassword.title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.sheet}>
          <Text style={styles.sub}>{t("profile.changePassword.subtitle")}</Text>
          <Input
            label={t("profile.changePassword.currentPassword")}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoComplete="password"
          />
          <Input
            label={t("profile.changePassword.newPassword")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
          />
          <Input
            label={t("profile.changePassword.confirmPassword")}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title={t("profile.changePassword.submit")}
            loading={loading}
            onPress={() => void onSubmit()}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 21,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
    fontSize: 13,
  },
});
