import { beforeEach, describe, expect, test, vi } from "vitest";

const mockNotifications = {
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: vi.fn().mockResolvedValue({ data: "test-token" }),
  setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
  AndroidImportance: { MAX: 5 },
};

let mockGetNotificationsModule: () => typeof mockNotifications | null = () =>
  mockNotifications;

vi.mock("../../../src/modules/push/getNotificationsModule", () => ({
  getNotificationsModule: () => mockGetNotificationsModule(),
}));

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: "test-project-id",
        },
      },
    },
  },
}));

vi.mock("expo-device", () => ({
  isDevice: true,
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

describe("utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNotificationsModule = () => mockNotifications;
  });

  describe("requestPushPermission", () => {
    test("returns 'unavailable' when notifications module is null", async () => {
      mockGetNotificationsModule = () => null;

      const { requestPushPermission } = await import(
        "../../../src/modules/push/utils"
      );
      const status = await requestPushPermission();

      expect(status).toBe("unavailable");
    });

    test("returns 'granted' when already granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "granted",
      });

      const { requestPushPermission } = await import(
        "../../../src/modules/push/utils"
      );
      const status = await requestPushPermission();

      expect(status).toBe("granted");
    });

    test("requests permission when not yet granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "undetermined",
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({
        status: "denied",
      });

      const { requestPushPermission } = await import(
        "../../../src/modules/push/utils"
      );
      const status = await requestPushPermission();

      expect(status).toBe("denied");
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe("getExpoPushToken", () => {
    test("returns null when notifications module is null", async () => {
      mockGetNotificationsModule = () => null;

      const { getExpoPushToken } = await import(
        "../../../src/modules/push/utils"
      );
      const token = await getExpoPushToken();

      expect(token).toBeNull();
    });
  });

  describe("setupDefaultAndroidChannel", () => {
    test("returns early when notifications module is null", async () => {
      mockGetNotificationsModule = () => null;

      const { setupDefaultAndroidChannel } = await import(
        "../../../src/modules/push/utils"
      );
      await setupDefaultAndroidChannel();

      expect(
        mockNotifications.setNotificationChannelAsync,
      ).not.toHaveBeenCalled();
    });
  });

  describe("registerForPushNotifications", () => {
    test("returns null silently when permission status is 'unavailable'", async () => {
      // Make getNotificationsModule return null so requestPushPermission returns "unavailable"
      mockGetNotificationsModule = () => null;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { registerForPushNotifications } = await import(
        "../../../src/modules/push/utils"
      );
      const token = await registerForPushNotifications();

      expect(token).toBeNull();
      // Should NOT log the "User may have denied" warning
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("User may have denied"),
      );

      warnSpy.mockRestore();
    });

    test("logs warning when permission is denied", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "undetermined",
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({
        status: "denied",
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { registerForPushNotifications } = await import(
        "../../../src/modules/push/utils"
      );
      const token = await registerForPushNotifications();

      expect(token).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("User may have denied"),
      );

      warnSpy.mockRestore();
    });
  });
});
