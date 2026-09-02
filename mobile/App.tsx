import React, { useEffect } from "react";
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
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/store/authStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useLearningStore } from "@/store/learningStore";
import { useLocaleStore } from "@/store/localeStore";
import { useOnboardingStore } from "@/store/onboardingStore";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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

  useEffect(() => {
    void bootstrap();
    void hydrateLocale();
    void hydrateDownloads();
    void hydrateLearning();
  }, [bootstrap, hydrateLocale, hydrateDownloads, hydrateLearning]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (user?.id) {
      void hydrateOnboarding(user.id);
      return;
    }
    resetOnboarding();
  }, [bootstrapped, user?.id, hydrateOnboarding, resetOnboarding]);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const waitingOnboarding = Boolean(user?.id && !onboardingHydrated);

  if (!fontsLoaded || !bootstrapped || !localeHydrated || waitingOnboarding) {
    return (
      <SafeAreaProvider>
        <AppLoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <PushNotificationManager />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
