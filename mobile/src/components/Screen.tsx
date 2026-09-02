import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";

type Props = {
  children?: React.ReactNode;
  header?: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function Screen({
  children,
  header,
  scroll,
  loading,
  style,
  contentContainerStyle,
  edges = ["top", "left", "right"],
}: Props) {
  if (loading) {
    return (
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {header}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safe, style]}>
      {header}
      <View style={[styles.body, contentContainerStyle as ViewStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
