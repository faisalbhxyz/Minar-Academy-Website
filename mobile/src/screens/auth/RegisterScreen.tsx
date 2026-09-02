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
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, spacing } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const startOnboarding = useOnboardingStore((s) => s.startOnboarding);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const phoneDigits = phone.trim().replace(/\s+/g, "");

    if (!firstName.trim() || !email.trim() || !password || !phoneDigits) {
      setError(t("auth.register.error.fieldsRequired"));
      return;
    }
    if (!email.includes("@")) {
      setError(t("auth.register.error.invalidEmail"));
      return;
    }
    if (!/^01\d{9}$/.test(phoneDigits)) {
      setError(t("auth.register.error.invalidPhone"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.register.error.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.register.error.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits,
        password,
        confirm_password: confirm,
      });
      try {
        await login(email.trim().toLowerCase(), password);
        const signedInUser = useAuthStore.getState().user;
        if (signedInUser?.id) {
          await startOnboarding(signedInUser.id);
        }
      } catch {
        setError(null);
        navigation.replace("Login");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.register.error.failed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <View style={styles.topRow}>
            <Text style={styles.back} onPress={() => navigation.goBack()}>
              {t("auth.backLink")}
            </Text>
            <LanguageToggle variant="light" />
          </View>
          <BrandLogo size="sm" navigateHome={false} />
          <Text style={styles.heading}>{t("auth.register.title")}</Text>
          <Text style={styles.sub}>{t("auth.register.subtitle")}</Text>

          <View style={styles.form}>
            <Input
              label={t("auth.register.firstName")}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("auth.register.firstNamePlaceholder")}
            />
            <Input
              label={t("auth.register.lastName")}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("auth.register.lastNamePlaceholder")}
            />
            <Input
              label={t("auth.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
            />
            <Input
              label={t("auth.register.phone")}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder={t("auth.register.phonePlaceholder")}
            />
            <Input
              label={t("auth.password")}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              label={t("auth.register.confirmPassword")}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={t("auth.register.submit")}
              loading={loading}
              onPress={onSubmit}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  back: {
    fontFamily: "DMSans_500Medium",
    color: colors.primary,
  },
  heading: {
    fontFamily: "Outfit_700Bold",
    fontSize: 30,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
    fontSize: 13,
  },
});
