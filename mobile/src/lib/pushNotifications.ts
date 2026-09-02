import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import * as api from "@/api";
import { getDeviceId } from "@/lib/storage";

export type PushPlatform = "android" | "ios";

const ANDROID_CHANNEL_ID = "default";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function isPushSupported(): boolean {
  if (Platform.OS === "web") return false;
  if (!Device.isDevice) return false;
  if (Constants.appOwnership === "expo") return false;
  return true;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "General",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220, 180, 220],
    lightColor: "#246962",
  });
}

async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requested.granted;
}

export async function getPushToken(): Promise<string | null> {
  if (!isPushSupported()) return null;

  const permitted = await ensurePermission();
  if (!permitted) return null;

  await ensureAndroidChannel();

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) return null;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data || null;
}

export async function registerPushTokenWithBackend(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const token = await getPushToken();
    if (!token) return;

    const deviceId = await getDeviceId();
    const platform: PushPlatform =
      Platform.OS === "ios" ? "ios" : "android";

    await api.registerPushToken({
      token,
      platform,
      device_id: deviceId,
      provider: "expo",
    });
  } catch {
    // Push should never block login/bootstrap.
  }
}

export async function unregisterPushTokenFromBackend(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const deviceId = await getDeviceId();
    let token: string | null = null;

    try {
      token = await getPushToken();
    } catch {
      token = null;
    }

    await api.unregisterPushToken({
      device_id: deviceId,
      token: token ?? undefined,
    });
  } catch {
    // Best-effort cleanup on logout.
  }
}
