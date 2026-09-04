// src/utils/__tests__/deviceSecurity.test.ts
import {
  checkDeviceSecurity,
  getSecurityFailMode,
  isSuspiciousDevice,
  shouldBlockProtectedPlayback,
  type DeviceSecurityStatus,
} from "@/utils/deviceSecurity";

const mockIsJailBroken = jest.fn();
const mockIsDebuggedMode = jest.fn();
const mockCanMockLocation = jest.fn();
const mockIsOnExternalStorage = jest.fn();
const mockIsEmulator = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

jest.mock("jail-monkey", () => ({
  __esModule: true,
  default: {
    isJailBroken: () => mockIsJailBroken(),
    isDebuggedMode: () => mockIsDebuggedMode(),
    canMockLocation: () => mockCanMockLocation(),
    isOnExternalStorage: () => mockIsOnExternalStorage(),
  },
}));

jest.mock("react-native-device-info", () => ({
  __esModule: true,
  default: {
    isEmulator: () => mockIsEmulator(),
  },
}));

function setHappyPath() {
  mockIsJailBroken.mockReturnValue(false);
  mockIsDebuggedMode.mockResolvedValue(false);
  mockCanMockLocation.mockReturnValue(false);
  mockIsOnExternalStorage.mockReturnValue(false);
  mockIsEmulator.mockResolvedValue(false);
}

describe("deviceSecurity", () => {
  const originalFailMode = process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE;

  beforeEach(() => {
    jest.clearAllMocks();
    setHappyPath();
    delete process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE;
  });

  afterAll(() => {
    if (originalFailMode === undefined) {
      delete process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE;
    } else {
      process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE = originalFailMode;
    }
  });

  describe("getSecurityFailMode", () => {
    it("reads EXPO_PUBLIC_SECURITY_FAIL_MODE when valid", () => {
      process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE = "secure";
      expect(getSecurityFailMode()).toBe("secure");
      process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE = "safe";
      expect(getSecurityFailMode()).toBe("safe");
    });
  });

  describe("checkDeviceSecurity", () => {
    it("returns combined jail-monkey + device-info flags", async () => {
      mockIsJailBroken.mockReturnValue(true);
      mockIsDebuggedMode.mockResolvedValue(true);
      mockCanMockLocation.mockReturnValue(true);
      mockIsOnExternalStorage.mockReturnValue(true);
      mockIsEmulator.mockResolvedValue(true);

      await expect(checkDeviceSecurity()).resolves.toEqual({
        isRooted: true,
        isDebugged: true,
        canMockLocation: true,
        isEmulator: true,
        isExternalStorage: true,
      });
    });

    it("fail-safe: assumes secure when a check throws", async () => {
      process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE = "safe";
      mockIsJailBroken.mockImplementation(() => {
        throw new Error("native bridge down");
      });

      await expect(checkDeviceSecurity()).resolves.toEqual({
        isRooted: false,
        isDebugged: false,
        canMockLocation: false,
        isEmulator: false,
        isExternalStorage: false,
      });
    });

    it("fail-secure: assumes insecure when a check throws", async () => {
      process.env.EXPO_PUBLIC_SECURITY_FAIL_MODE = "secure";
      mockIsEmulator.mockRejectedValue(new Error("device-info unavailable"));

      await expect(checkDeviceSecurity()).resolves.toEqual({
        isRooted: true,
        isDebugged: true,
        canMockLocation: true,
        isEmulator: true,
        isExternalStorage: true,
      });
    });
  });

  describe("helpers", () => {
    const base: DeviceSecurityStatus = {
      isRooted: false,
      isDebugged: false,
      canMockLocation: false,
      isEmulator: false,
      isExternalStorage: false,
    };

    it("shouldBlockProtectedPlayback only for root or mock location", () => {
      expect(shouldBlockProtectedPlayback(base)).toBe(false);
      expect(
        shouldBlockProtectedPlayback({ ...base, isDebugged: true })
      ).toBe(false);
      expect(shouldBlockProtectedPlayback({ ...base, isRooted: true })).toBe(
        true
      );
      expect(
        shouldBlockProtectedPlayback({ ...base, canMockLocation: true })
      ).toBe(true);
    });

    it("isSuspiciousDevice includes debug/emulator signals", () => {
      expect(isSuspiciousDevice(base)).toBe(false);
      expect(isSuspiciousDevice({ ...base, isEmulator: true })).toBe(true);
      expect(isSuspiciousDevice({ ...base, isDebugged: true })).toBe(true);
    });
  });
});
