import { useEffect } from "react";
import { InteractionManager, Platform } from "react-native";
import * as Notifications from "expo-notifications";

import {
  ensurePushNotificationHandler,
  registerPushTokenWithBackend,
} from "@/lib/pushNotifications";
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

    const task = InteractionManager.runAfterInteractions(() => {
      try {
        ensurePushNotificationHandler();

        if (token) {
          void registerPushTokenWithBackend();
        }

        void Notifications.getLastNotificationResponseAsync().then((response) => {
          if (response) {
            navigateFromNotificationData(readNotificationData(response));
          }
        });
      } catch {
        // Notifications must never crash the app shell.
      }
    });

    let receivedSub: Notifications.Subscription | undefined;
    let responseSub: Notifications.Subscription | undefined;

    try {
      ensurePushNotificationHandler();
      receivedSub = Notifications.addNotificationReceivedListener(() => {
        // Foreground display handled by setNotificationHandler.
      });
      responseSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          navigateFromNotificationData(readNotificationData(response));
        }
      );
    } catch {
      // Ignore listener setup failures on devices with broken push stacks.
    }

    return () => {
      task.cancel();
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, [token]);

  return null;
}
