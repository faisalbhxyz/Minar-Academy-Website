import { Alert, Linking } from "react-native";

import {
  HELP_CENTER_MESSENGER_URL,
  HELP_CENTER_PHONE,
  HELP_CENTER_WHATSAPP_URL,
} from "@/lib/config";

type TranslateFn = (key: string) => string;

async function openUrl(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
  } catch {
    // ignore invalid or unsupported links
  }
}

export function showHelpCenterOptions(t: TranslateFn) {
  Alert.alert(t("home.helpCenter.title"), t("home.helpCenter.message"), [
    {
      text: t("home.helpCenter.call"),
      onPress: () => void openUrl(`tel:${HELP_CENTER_PHONE}`),
    },
    {
      text: t("home.helpCenter.whatsapp"),
      onPress: () => void openUrl(HELP_CENTER_WHATSAPP_URL),
    },
    {
      text: t("home.helpCenter.messenger"),
      onPress: () => void openUrl(HELP_CENTER_MESSENGER_URL),
    },
    { text: t("common.cancel"), style: "cancel" },
  ]);
}
