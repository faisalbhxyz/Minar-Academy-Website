import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OnboardingProfile } from "@/lib/onboarding";

const profileKey = (userId: number) => `minar_onboarding_${userId}`;
const pendingKey = (userId: number) => `minar_onboarding_pending_${userId}`;

export async function getOnboardingProfile(
  userId: number
): Promise<OnboardingProfile | null> {
  const raw = await AsyncStorage.getItem(profileKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export async function saveOnboardingProfile(
  userId: number,
  profile: OnboardingProfile
): Promise<void> {
  await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
  await AsyncStorage.removeItem(pendingKey(userId));
}

export async function isOnboardingPending(userId: number): Promise<boolean> {
  const value = await AsyncStorage.getItem(pendingKey(userId));
  return value === "1";
}

export async function setOnboardingPending(
  userId: number,
  pending: boolean
): Promise<void> {
  if (pending) {
    await AsyncStorage.setItem(pendingKey(userId), "1");
    return;
  }
  await AsyncStorage.removeItem(pendingKey(userId));
}

export async function clearOnboardingData(userId: number): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(profileKey(userId)),
    AsyncStorage.removeItem(pendingKey(userId)),
  ]);
}
