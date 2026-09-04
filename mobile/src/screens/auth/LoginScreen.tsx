import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, spacing } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t("auth.error.credentialsRequired"));
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getApiErrorMessage(err, t("auth.error.loginFailed")));
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
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, "#2f857c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.tagline}>{t("auth.tagline")}</Text>
        </LinearGradient>

        <View style={styles.sheet}>
          <LanguageToggle variant="light" style={styles.langToggle} />
          <View style={styles.logoWrap}>
            <BrandLogo size="md" navigateHome={false} style={styles.sheetLogo} />
          </View>
          <Text style={styles.heading}>{t("auth.signIn")}</Text>
          <Text style={styles.sub}>{t("auth.signInSubtitle")}</Text>

          <View style={styles.form}>
            <Input
              label={t("auth.email")}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
            />
            <View style={styles.passwordField}>
              <Input
                label={t("auth.password")}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="password"
              />
              <Pressable
                style={styles.forgotLink}
                onPress={() => navigation.navigate("ForgotPassword")}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>{t("auth.forgotPassword")}</Text>
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t("auth.continue")} loading={loading} onPress={onSubmit} />
            <Button
              title={t("auth.createAccount")}
              variant="ghost"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    minHeight: 160,
    justifyContent: "flex-end",
  },
  langToggle: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.xl,
    zIndex: 1,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sheetLogo: {
    alignSelf: "center",
  },
  tagline: {
    marginTop: spacing.sm,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.88)",
  },
  sheet: {
    flex: 1,
    marginTop: -spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heading: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  sub: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
  },
  form: {
    gap: spacing.lg,
  },
  passwordField: {
    gap: spacing.sm,
  },
  forgotLink: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
    fontSize: 13,
  },
});
