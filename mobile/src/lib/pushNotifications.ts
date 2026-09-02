import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import messaging, {
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";

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
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return false;
  }

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

export async function getFcmToken(): Promise<string | null> {
  if (!isPushSupported()) return null;

  const permitted = await ensurePermission();
  if (!permitted) return null;

  await ensureAndroidChannel();

  const token = await messaging().getToken();
  return token || null;
}

export async function registerPushTokenWithBackend(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const token = await getFcmToken();
    if (!token) return;

    const deviceId = await getDeviceId();
    const platform: PushPlatform =
      Platform.OS === "ios" ? "ios" : "android";

    await api.registerPushToken({
      token,
      platform,
      device_id: deviceId,
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
      token = await messaging().getToken();
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

export async function displayForegroundNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  const title =
    remoteMessage.notification?.title ??
    remoteMessage.data?.title ??
    "Minar Academy";
  const body =
    remoteMessage.notification?.body ?? remoteMessage.data?.body ?? "";

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: remoteMessage.data ?? {},
      sound: true,
    },
    trigger: null,
  });
}
