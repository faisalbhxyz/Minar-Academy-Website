import React, { useEffect, useState } from "react";
import { AppState, InteractionManager, type AppStateStatus } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";

import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { SecurityProvider } from "@/context/SecurityContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/store/authStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useLearningStore } from "@/store/learningStore";
import { useLocaleStore } from "@/store/localeStore";
import { useOnboardingStore } from "@/store/onboardingStore";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const RESUME_LOADING_MS = 450;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      structuralSharing: true,
    },
  },
});

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const onboardingHydrated = useOnboardingStore((s) => s.hydrated);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);
  const localeHydrated = useLocaleStore((s) => s.hydrated);
  const hydrateDownloads = useDownloadsStore((s) => s.hydrate);
  const hydrateLearning = useLearningStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const [pushReady, setPushReady] = useState(false);
  const [navEpoch, setNavEpoch] = useState(0);
  const [coldResume, setColdResume] = useState(false);

  useEffect(() => {
    let fromBackground = false;

    const onChange = (next: AppStateStatus) => {
      if (next === "background") {
        fromBackground = true;
        return;
      }
      if (next !== "active" || !fromBackground) return;

      fromBackground = false;
      setColdResume(true);
      setNavEpoch((n) => n + 1);
      void queryClient.invalidateQueries();
      void useAuthStore.getState().refreshStudentDetails();
      void useOnboardingStore.getState().syncPendingToServer();
      void import("@/lib/watchTime").then(({ flushPendingWatchQueue }) =>
        flushPendingWatchQueue().catch(() => undefined)
      );
    };

    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!coldResume) return;

    const timer = setTimeout(() => setColdResume(false), RESUME_LOADING_MS);
    return () => clearTimeout(timer);
  }, [coldResume, navEpoch]);

  useEffect(() => {
    void bootstrap();
    void hydrateLocale();
    void hydrateLearning();
  }, [bootstrap, hydrateLocale, hydrateLearning]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void hydrateDownloads();
    });
    return () => task.cancel();
  }, [hydrateDownloads]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (user?.id) {
      void hydrateOnboarding(user.id);
      return;
    }
    resetOnboarding();
  }, [bootstrapped, user?.id, hydrateOnboarding, resetOnboarding]);

  const ready =
    fontsLoaded && bootstrapped && localeHydrated && !(user?.id && !onboardingHydrated);

  const hideNativeSplash = () => {
    void SplashScreen.hideAsync();
  };

  useEffect(() => {
    if (ready) hideNativeSplash();
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      setPushReady(false);
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setPushReady(true);
    });
    return () => task.cancel();
  }, [ready]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <AppLoadingScreen onReady={hideNativeSplash} />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SecurityProvider>
            <StatusBar style="dark" />
            {pushReady ? <PushNotificationManager /> : null}
            {coldResume ? (
              <AppLoadingScreen />
            ) : (
              <RootNavigator key={navEpoch} />
            )}
          </SecurityProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
