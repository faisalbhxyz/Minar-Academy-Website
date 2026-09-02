const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Resolves Android manifest merge conflicts between expo-notifications
 * and @react-native-firebase/messaging for default_notification_color.
 */
function withFirebaseNotificationManifestFix(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) return modConfig;

    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    const metaName =
      "com.google.firebase.messaging.default_notification_color";
    const existing = application["meta-data"].find(
      (item) => item.$?.["android:name"] === metaName
    );

    if (existing) {
      existing.$["tools:replace"] = "android:resource";
      return modConfig;
    }

    application["meta-data"].push({
      $: {
        "android:name": metaName,
        "android:resource": "@color/notification_icon_color",
        "tools:replace": "android:resource",
      },
    });

    return modConfig;
  });
}

module.exports = withFirebaseNotificationManifestFix;
