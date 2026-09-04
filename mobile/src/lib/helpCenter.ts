import { Linking } from "react-native";

import {
  HELP_CENTER_MESSENGER_URL,
  HELP_CENTER_PHONE,
  HELP_CENTER_WHATSAPP_URL,
} from "@/lib/config";

export type HelpCenterChannel = "call" | "whatsapp" | "messenger";

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // ignore unsupported links
  }
}

export function openHelpCenterChannel(channel: HelpCenterChannel) {
  switch (channel) {
    case "call":
      return openUrl(`tel:${HELP_CENTER_PHONE}`);
    case "whatsapp":
      return openUrl(HELP_CENTER_WHATSAPP_URL);
    case "messenger":
      return openUrl(HELP_CENTER_MESSENGER_URL);
  }
}
