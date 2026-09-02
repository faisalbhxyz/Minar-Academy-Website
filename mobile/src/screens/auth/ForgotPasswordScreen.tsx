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

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError(t("auth.forgot.error.emailRequired"));
      return;
    }
    setLoading(true);
    try {
      await api.requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.forgot.error.sendFailed")));
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
          {submitted ? (
            <>
              <Text style={styles.heading}>{t("auth.forgot.successTitle")}</Text>
              <Text style={styles.sub}>{t("auth.forgot.successMessage")}</Text>
              <Button
                title={t("auth.forgot.resetWithToken")}
                onPress={() =>
                  navigation.navigate("ResetPassword", { email: email.trim() })
                }
              />
              <Button
                title={t("auth.forgot.backToLogin")}
                variant="ghost"
                onPress={() => navigation.navigate("Login")}
              />
            </>
          ) : (
            <>
              <Text style={styles.heading}>{t("auth.forgot.title")}</Text>
              <Text style={styles.sub}>{t("auth.forgot.subtitle")}</Text>
              <Input
                label={t("auth.email")}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.emailPlaceholder")}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={t("auth.forgot.submit")}
                loading={loading}
                onPress={() => void onSubmit()}
              />
              <Button
                title={t("auth.forgot.backToLogin")}
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            </>
          )}
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
