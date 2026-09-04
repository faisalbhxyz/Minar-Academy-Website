// src/context/SecurityContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as api from "@/api";
import { getDeviceId } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore";
import {
  checkDeviceSecurity,
  isSuspiciousDevice,
  shouldBlockProtectedPlayback,
  type DeviceSecurityStatus,
} from "@/utils/deviceSecurity";

type SecurityContextValue = {
  status: DeviceSecurityStatus | null;
  loading: boolean;
  checked: boolean;
  isPlaybackBlocked: boolean;
  refreshSecurityStatus: () => Promise<DeviceSecurityStatus>;
};

const SecurityContext = createContext<SecurityContextValue | null>(null);

async function reportIfSuspicious(
  status: DeviceSecurityStatus,
  userId: number | undefined,
  lastKeyRef: React.MutableRefObject<string | null>
): Promise<void> {
  if (!isSuspiciousDevice(status)) return;

  const deviceId = await getDeviceId();
  const key = [
    deviceId,
    userId ?? "anon",
    status.isRooted ? "1" : "0",
    status.canMockLocation ? "1" : "0",
    status.isDebugged ? "1" : "0",
    status.isEmulator ? "1" : "0",
  ].join(":");

  if (lastKeyRef.current === key) return;
  lastKeyRef.current = key;

  try {
    await api.reportDeviceFlag({
      device_id: deviceId,
      user_id: userId ?? null,
      timestamp: new Date().toISOString(),
      flags: {
        isRooted: status.isRooted,
        isDebugged: status.isDebugged,
        canMockLocation: status.canMockLocation,
        isEmulator: status.isEmulator,
        isExternalStorage: status.isExternalStorage,
      },
    });
  } catch (error) {
    lastKeyRef.current = null;
    if ((globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__) {
      console.warn("[SecurityContext] device-flag report failed", error);
    }
  }
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((s) => s.user?.id);
  const [status, setStatus] = useState<DeviceSecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const reportedKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<DeviceSecurityStatus> | null>(null);

  const refreshSecurityStatus = useCallback(async (): Promise<DeviceSecurityStatus> => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const run = (async () => {
      setLoading(true);
      try {
        const next = await checkDeviceSecurity();
        setStatus(next);
        setChecked(true);
        void reportIfSuspicious(next, userId, reportedKeyRef);
        return next;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    return run;
  }, [userId]);

  useEffect(() => {
    void refreshSecurityStatus();
  }, [refreshSecurityStatus]);

  const value = useMemo<SecurityContextValue>(
    () => ({
      status,
      loading,
      checked,
      isPlaybackBlocked: status ? shouldBlockProtectedPlayback(status) : false,
      refreshSecurityStatus,
    }),
    [status, loading, checked, refreshSecurityStatus]
  );

  return (
    <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>
  );
}

export function useSecurityStatus(): SecurityContextValue {
  const ctx = useContext(SecurityContext);
  if (!ctx) {
    throw new Error("useSecurityStatus must be used within SecurityProvider");
  }
  return ctx;
}
