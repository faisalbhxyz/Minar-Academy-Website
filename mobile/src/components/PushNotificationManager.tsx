import { useEffect } from "react";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";

import {
  displayForegroundNotification,
  registerPushTokenWithBackend,
} from "@/lib/pushNotifications";
import {
  navigateFromNotificationData,
  navigateFromRemoteMessage,
} from "@/navigation/notificationRouting";
import { useAuthStore } from "@/store/authStore";

function readNotificationData(
  response: Notifications.NotificationResponse
): Record<string, string | undefined> | undefined {
  const raw = response.notification.request.content.data;
  if (!raw || typeof raw !== "object") return undefined;

  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export function PushNotificationManager() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    if (token) {
      void registerPushTokenWithBackend();
    }

    const tokenRefreshUnsub = messaging().onTokenRefresh(() => {
      if (useAuthStore.getState().token) {
        void registerPushTokenWithBackend();
      }
    });

    const foregroundUnsub = messaging().onMessage(async (remoteMessage) => {
      await displayForegroundNotification(remoteMessage);
    });

    const openedUnsub = messaging().onNotificationOpenedApp((remoteMessage) => {
      navigateFromRemoteMessage(remoteMessage);
    });

    void messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) navigateFromRemoteMessage(remoteMessage);
      });

    const tapUnsub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        navigateFromNotificationData(readNotificationData(response));
      }
    );

    return () => {
      tokenRefreshUnsub();
      foregroundUnsub();
      openedUnsub();
      tapUnsub.remove();
    };
  }, [token]);

  return null;
}
