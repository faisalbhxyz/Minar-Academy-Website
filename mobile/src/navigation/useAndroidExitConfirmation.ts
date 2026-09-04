import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import type { NavigationState } from "@react-navigation/native";

import { navigationRef } from "@/navigation/navigationRef";

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

/**
 * Must not use `useNavigationState` here: AndroidExitGuard wraps the navigator
 * (parent of the stack), so that hook throws and kills the release app on launch.
 * `navigationRef` is safe from outside the navigator tree.
 */
export function useAndroidExitConfirmation() {
  const [visible, setVisible] = useState(false);
  const [isAtRoot, setIsAtRoot] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const syncRootState = () => {
      if (!navigationRef.isReady()) {
        setIsAtRoot(true);
        return;
      }
      setIsAtRoot(isAtNavigatorRoot(navigationRef.getRootState()));
    };

    syncRootState();
    return navigationRef.addListener("state", syncRootState);
  }, []);

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
