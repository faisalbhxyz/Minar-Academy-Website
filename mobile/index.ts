import "react-native-gesture-handler";
import { Platform } from "react-native";
import { registerRootComponent } from "expo";

import App from "./App";

if (Platform.OS !== "web") {
  const messaging =
    require("@react-native-firebase/messaging").default as typeof import("@react-native-firebase/messaging").default;

  messaging().setBackgroundMessageHandler(async () => {
    // Notification payload shows OS UI; data-only messages can be handled here.
  });
}

registerRootComponent(App);
