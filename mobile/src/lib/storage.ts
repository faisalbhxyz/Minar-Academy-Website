import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "lurnic_device_id";
const TOKEN_KEY = "minar_access_token";
const USER_KEY = "minar_user_json";

function randomId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = randomId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  const brand = Device.brand || Device.manufacturer || "Device";
  const model = Device.modelName || "Android";
  return `Minar Academy on ${brand} ${model}`.slice(0, 128);
}

/** Token stays on-device; not included in cloud backup / other devices' keychain. */
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveToken(token: string): Promise<void> {
  await setSecureItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return getSecureItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await deleteSecureItem(TOKEN_KEY);
}

export async function saveUserJson(json: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, json);
}

export async function getUserJson(): Promise<string | null> {
  return AsyncStorage.getItem(USER_KEY);
}

export async function clearUserJson(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([clearToken(), clearUserJson()]);
}

export const isAndroid = Platform.OS === "android";
