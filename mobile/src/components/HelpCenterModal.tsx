import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import {
  openHelpCenterChannel,
  type HelpCenterChannel,
} from "@/lib/helpCenter";
import { colors, radii, spacing } from "@/theme";

const BRAND_GREEN = "#1f7a4d";
const MESSENGER_BLUE = "#0084ff";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HelpCenterModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const openChannel = (channel: HelpCenterChannel) => {
    onClose();
    void openHelpCenterChannel(channel);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headsetBadge}>
              <Iconify
                icon="solar:headphones-round-sound-bold"
                size={22}
                color={BRAND_GREEN}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t("home.helpCenter.title")}</Text>
              <Text style={styles.subtitle}>
                {t("home.helpCenter.message")}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <ChannelCard
              label={t("home.helpCenter.call")}
              labelColor={BRAND_GREEN}
              onPress={() => openChannel("call")}
            >
              <Iconify
                icon="solar:phone-calling-bold"
                size={30}
                color={BRAND_GREEN}
              />
            </ChannelCard>
            <ChannelCard
              label={t("home.helpCenter.whatsapp")}
              labelColor={BRAND_GREEN}
              uppercase
              onPress={() => openChannel("whatsapp")}
            >
              <Iconify icon="logos:whatsapp-icon" size={30} />
            </ChannelCard>
            <ChannelCard
              label={t("home.helpCenter.messenger")}
              labelColor={MESSENGER_BLUE}
              uppercase
              onPress={() => openChannel("messenger")}
            >
              <Iconify icon="logos:messenger" size={30} />
            </ChannelCard>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ChannelCard({
  label,
  labelColor,
  uppercase,
  onPress,
  children,
}: {
  label: string;
  labelColor: string;
  uppercase?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.channel, pressed ? styles.pressed : null]}
    >
      <View style={styles.channelIcon}>{children}</View>
      <Text
        style={[
          styles.channelLabel,
          { color: labelColor },
          uppercase ? styles.uppercase : null,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#f3faf7",
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headsetBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: BRAND_GREEN,
  },
  subtitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  channel: {
    flex: 1,
    minHeight: 92,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  channelIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  channelLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  uppercase: {
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.88,
  },
});
