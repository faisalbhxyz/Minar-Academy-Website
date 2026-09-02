import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { registerPushTokenWithBackend } from "@/lib/pushNotifications";
import { navigateFromNotificationData } from "@/navigation/notificationRouting";
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

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      // Foreground display handled by setNotificationHandler.
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        navigateFromNotificationData(readNotificationData(response));
      }
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        navigateFromNotificationData(readNotificationData(response));
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [token]);

  return null;
}
