import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import {
  useNavigationState,
  type NavigationState,
} from "@react-navigation/native";

function isAtNavigatorRoot(state: NavigationState | undefined): boolean {
  if (!state) return true;

  let current: NavigationState | undefined = state;
  while (current) {
    if (current.index > 0) return false;
    const activeRoute = current.routes[current.index];
    current = activeRoute.state as NavigationState | undefined;
  }

  return true;
}

export function useAndroidExitConfirmation() {
  const [visible, setVisible] = useState(false);
  const isAtRoot = useNavigationState(isAtNavigatorRoot);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      if (!isAtRoot) return false;
      setVisible(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [isAtRoot]);

  const dismiss = useCallback(() => setVisible(false), []);

  const confirmExit = useCallback(() => {
    setVisible(false);
    BackHandler.exitApp();
  }, []);

  return { visible, dismiss, confirmExit };
}
