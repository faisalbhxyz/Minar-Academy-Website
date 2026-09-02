import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import * as api from "@/api";
import type { ProfileImageAsset } from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "EditProfile">;

const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

function fileNameFromUri(uri: string, mime: string): string {
  const segment = uri.split("/").pop() ?? "";
  if (segment.includes(".")) return segment;
  return mime === "image/png" ? "profile.png" : "profile.jpg";
}

export function EditProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [imageAsset, setImageAsset] = useState<ProfileImageAsset | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    first_name?: string;
    last_name?: string;
    phone?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayImage = previewUri ?? user?.profile_image ?? null;

  const pickImage = async () => {
    setError(null);
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t("common.permissionRequired"),
        t("profile.editScreen.permissionMessage")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? mimeFromUri(asset.uri);

    if (mime !== "image/jpeg" && mime !== "image/jpg" && mime !== "image/png") {
      setError(t("profile.editScreen.error.invalidImageType"));
      return;
    }

    if (asset.fileSize != null && asset.fileSize > PROFILE_IMAGE_MAX_BYTES) {
      setError(t("profile.editScreen.error.imageTooLarge"));
      return;
    }

    setPreviewUri(asset.uri);
    setImageAsset({
      uri: asset.uri,
      name: asset.fileName ?? fileNameFromUri(asset.uri, mime),
      type: mime === "image/jpg" ? "image/jpeg" : mime,
    });
  };

  const clearPendingImage = () => {
    setPreviewUri(null);
    setImageAsset(null);
  };

  const validate = (): boolean => {
    const next: typeof fieldErrors = {};
    const first = firstName.trim();
    const last = lastName.trim();
    const phoneDigits = phone.trim().replace(/\s+/g, "");

    if (!first) {
      next.first_name = t("profile.editScreen.error.firstNameRequired");
    } else if (first.length > 100) {
      next.first_name = t("profile.editScreen.error.firstNameTooLong");
    }

    if (last.length > 100) {
      next.last_name = t("profile.editScreen.error.lastNameTooLong");
    }

    if (!phoneDigits) {
      next.phone = t("profile.editScreen.error.phoneRequired");
    } else if (!/^01\d{9}$/.test(phoneDigits)) {
      next.phone = t("profile.editScreen.error.invalidPhone");
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const updated = await api.updateStudentProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim().replace(/\s+/g, ""),
        profile_image: imageAsset,
      });
      setUser(updated);
      clearPendingImage();
      Alert.alert(t("common.success"), t("profile.editScreen.successMessage"), [
        { text: t("common.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(
        getApiErrorMessage(err, t("profile.editScreen.error.updateFailed"))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      scroll
      edges={["top", "left", "right", "bottom"]}
      header={
        <AppHeader
          title={t("profile.editScreen.title")}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <BrandLogo size="sm" />
          <Text style={styles.heading}>{t("profile.editScreen.title")}</Text>
          <Text style={styles.sub}>{t("profile.editScreen.subtitle")}</Text>

          <View style={styles.avatarBlock}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarLetter}>
                  {(firstName.trim()[0] || user?.first_name?.[0] || "M").toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarActions}>
              <Text style={styles.avatarLabel}>
                {user?.profile_image || previewUri
                  ? t("profile.editScreen.photo")
                  : t("profile.editScreen.addPhoto")}
              </Text>
              <Text style={styles.avatarHint}>{t("profile.editScreen.imageHint")}</Text>
              <Pressable onPress={pickImage} disabled={loading}>
                <Text style={styles.avatarLink}>
                  {user?.profile_image || previewUri
                    ? t("profile.editScreen.changePhoto")
                    : t("profile.editScreen.addPhotoLink")}
                </Text>
              </Pressable>
              {imageAsset ? (
                <Pressable onPress={clearPendingImage} disabled={loading}>
                  <Text style={styles.avatarCancel}>{t("profile.editScreen.cancelPhoto")}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label={t("profile.editScreen.firstName")}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("profile.editScreen.firstNamePlaceholder")}
              error={fieldErrors.first_name}
              editable={!loading}
            />
            <Input
              label={t("profile.editScreen.lastName")}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("profile.editScreen.lastNamePlaceholder")}
              error={fieldErrors.last_name}
              editable={!loading}
            />
            <View style={styles.emailWrap}>
              <Input
                label={t("common.email")}
                value={user?.email ?? ""}
                editable={false}
                style={styles.emailInput}
              />
              <Text style={styles.emailHint}>{t("profile.editScreen.emailHint")}</Text>
            </View>
            <Input
              label={t("profile.editScreen.phoneLabel")}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder={t("profile.editScreen.phonePlaceholder")}
              error={fieldErrors.phone}
              editable={!loading}
              maxLength={11}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t("profile.editScreen.save")} loading={loading} onPress={onSave} />
            <Button
              title={t("profile.editScreen.cancel")}
              variant="ghost"
              disabled={loading}
              onPress={() => navigation.goBack()}
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
  heading: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: spacing.lg,
  },
  avatarBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: "Outfit_700Bold",
    fontSize: 32,
    color: "#fff",
  },
  avatarActions: {
    flex: 1,
    gap: 4,
  },
  avatarLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  avatarHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  avatarLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  avatarCancel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  form: {
    gap: spacing.lg,
  },
  emailWrap: {
    gap: 6,
  },
  emailInput: {
    backgroundColor: colors.surface,
    color: colors.inkMuted,
  },
  emailHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
    fontSize: 13,
  },
});
