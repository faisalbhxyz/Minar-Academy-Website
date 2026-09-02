import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import * as api from "@/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import { colors, spacing } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [token, setToken] = useState(route.params?.token ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !token.trim()) {
      setError(t("auth.reset.error.fieldsRequired"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.reset.error.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.reset.error.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email: email.trim(),
        token: token.trim(),
        password,
      });
      navigation.navigate("Login");
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.reset.error.failed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.langRow}>
          <LanguageToggle variant="light" />
        </View>
        <View style={styles.sheet}>
          <Text style={styles.heading}>{t("auth.reset.title")}</Text>
          <Text style={styles.sub}>{t("auth.reset.subtitle")}</Text>
          <Input
            label={t("auth.email")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder={t("auth.emailPlaceholder")}
          />
          <Input
            label={t("auth.reset.tokenLabel")}
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
            placeholder={t("auth.reset.tokenPlaceholder")}
          />
          <Input
            label={t("auth.reset.newPassword")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.reset.passwordPlaceholder")}
          />
          <Input
            label={t("auth.reset.confirmPassword")}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t("auth.reset.passwordPlaceholder")}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title={t("auth.reset.submit")}
            loading={loading}
            onPress={() => void onSubmit()}
          />
          <Button
            title={t("auth.reset.backToLogin")}
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  langRow: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sheet: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
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
