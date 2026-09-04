// src/utils/deviceSecurity.ts
import { Platform } from "react-native";
import JailMonkey from "jail-monkey";
import DeviceInfo from "react-native-device-info";

export type SecurityFailMode = "safe" | "secure";

export type DeviceSecurityStatus = {
  isRooted: boolean;
  isDebugged: boolean;
  canMockLocation: boolean;
  isEmulator: boolean;
  isExternalStorage: boolean;
};

const SECURE_STATUS: DeviceSecurityStatus = {
  isRooted: false,
  isDebugged: false,
  canMockLocation: false,
  isEmulator: false,
  isExternalStorage: false,
};

const INSECURE_STATUS: DeviceSecurityStatus = {
  isRooted: true,
  isDebugged: true,
  canMockLocation: true,
  isEmulator: true,
  isExternalStorage: true,
};

function isDevBuild(): boolean {
  return Boolean(
    (globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__
  );
}

/**
 * fail-safe (`safe`): check errors → assume secure (dev-friendly)
 * fail-secure (`secure`): check errors → assume insecure (production-safer)
 *
 * Override with EXPO_PUBLIC_SECURITY_FAIL_MODE=safe|secure
 */
export function getSecurityFailMode(): SecurityFailMode {
  const raw = (process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE ?? "")
    .trim()
    .toLowerCase();
  if (raw === "safe" || raw === "secure") {
    return raw;
  }
  return isDevBuild() ? "safe" : "secure";
}

function fallbackStatus(mode: SecurityFailMode): DeviceSecurityStatus {
  return mode === "secure" ? { ...INSECURE_STATUS } : { ...SECURE_STATUS };
}

function warnDev(message: string, error?: unknown): void {
  if (!isDevBuild()) return;
  if (error !== undefined) {
    console.warn(message, error);
    return;
  }
  console.warn(message);
}

function readBool(fn: () => boolean, label: string): boolean {
  try {
    return Boolean(fn());
  } catch (error) {
    warnDev(`[deviceSecurity] ${label} failed`, error);
    throw error;
  }
}

async function readAsyncBool(
  fn: () => Promise<boolean>,
  label: string
): Promise<boolean> {
  try {
    return Boolean(await fn());
  } catch (error) {
    warnDev(`[deviceSecurity] ${label} failed`, error);
    throw error;
  }
}

export function isSuspiciousDevice(status: DeviceSecurityStatus): boolean {
  return (
    status.isRooted ||
    status.canMockLocation ||
    status.isDebugged ||
    status.isEmulator
  );
}

export function shouldBlockProtectedPlayback(
  status: DeviceSecurityStatus
): boolean {
  return status.isRooted || status.canMockLocation;
}

export async function checkDeviceSecurity(): Promise<DeviceSecurityStatus> {
  const mode = getSecurityFailMode();

  if (Platform.OS === "web") {
    return { ...SECURE_STATUS };
  }

  try {
    const [isDebugged, isEmulator] = await Promise.all([
      readAsyncBool(() => JailMonkey.isDebuggedMode(), "isDebuggedMode"),
      readAsyncBool(() => DeviceInfo.isEmulator(), "isEmulator"),
    ]);

    return {
      isRooted: readBool(() => JailMonkey.isJailBroken(), "isJailBroken"),
      isDebugged,
      canMockLocation: readBool(
        () => JailMonkey.canMockLocation(),
        "canMockLocation"
      ),
      isEmulator,
      isExternalStorage: readBool(
        () => JailMonkey.isOnExternalStorage(),
        "isOnExternalStorage"
      ),
    };
  } catch (error) {
    warnDev(`[deviceSecurity] check failed; applying fail-${mode}`, error);
    return fallbackStatus(mode);
  }
}
