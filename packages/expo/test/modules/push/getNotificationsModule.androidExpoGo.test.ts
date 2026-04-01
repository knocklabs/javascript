import { describe, expect, test, vi } from "vitest";

// This test file exercises the Android Expo Go code path of getNotificationsModule.
// It uses a separate file because getNotificationsModule has module-level caching
// that can only be tested in a fresh module context (one per test file).

vi.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

vi.mock("expo-constants", () => ({
  default: { executionEnvironment: "storeClient" },
  ExecutionEnvironment: {
    Bare: "bare",
    Standalone: "standalone",
    StoreClient: "storeClient",
  },
}));

vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
}));

describe("getNotificationsModule (Android Expo Go)", () => {
  test("returns null and warns on Android Expo Go", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getNotificationsModule } = await import(
      "../../../src/modules/push/getNotificationsModule"
    );
    const result = getNotificationsModule();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Push notifications (remote notifications) are not available in Expo Go",
      ),
    );

    warnSpy.mockRestore();
  });

  test("caches null and only warns once", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getNotificationsModule } = await import(
      "../../../src/modules/push/getNotificationsModule"
    );

    // First call already happened in previous test (module cached),
    // but since vitest runs each test() sequentially in the same module
    // context, the cache from the first test persists here.
    // Call again to verify caching — warn should not fire again.
    const callCountBefore = warnSpy.mock.calls.length;
    getNotificationsModule();
    const callCountAfter = warnSpy.mock.calls.length;

    expect(callCountAfter).toBe(callCountBefore);

    warnSpy.mockRestore();
  });
});
