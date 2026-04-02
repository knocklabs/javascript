import { beforeEach, describe, expect, test, vi } from "vitest";

// This file tests the successful-load and require-failure paths of
// getNotificationsModule. It uses _resetForTesting to clear the module
// cache and inject a custom require function, avoiding Vitest's limitation
// with intercepting require() calls after vi.resetModules().

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

vi.mock("expo-constants", () => ({
  default: { executionEnvironment: "bare" },
  ExecutionEnvironment: {
    Bare: "bare",
    Standalone: "standalone",
    StoreClient: "storeClient",
  },
}));

vi.mock("expo-notifications", () => ({}));

const mockNotificationsModule = {
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn(),
  AndroidImportance: { MAX: 5 },
};

describe("getNotificationsModule", () => {
  let getNotificationsModule: typeof import("../../../src/modules/push/getNotificationsModule").getNotificationsModule;
  let _resetForTesting: typeof import("../../../src/modules/push/getNotificationsModule")._resetForTesting;

  beforeEach(async () => {
    const mod = await import(
      "../../../src/modules/push/getNotificationsModule"
    );
    getNotificationsModule = mod.getNotificationsModule;
    _resetForTesting = mod._resetForTesting;

    // Reset cache and inject a successful require for each test
    _resetForTesting(() => mockNotificationsModule as never);
  });

  test("returns the module when require succeeds", () => {
    const result = getNotificationsModule();

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("setNotificationHandler");
    expect(result).toHaveProperty("AndroidImportance");
  });

  test("caches the result on subsequent calls", () => {
    const first = getNotificationsModule();
    const second = getNotificationsModule();

    expect(first).toBe(second);
  });

  test("returns null and warns when require throws", () => {
    _resetForTesting(() => {
      throw new Error("Module not found");
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = getNotificationsModule();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("expo-notifications could not be loaded"),
    );

    warnSpy.mockRestore();
  });

  test("caches null after require failure", () => {
    _resetForTesting(() => {
      throw new Error("Module not found");
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    getNotificationsModule();
    const warnCountAfterFirst = warnSpy.mock.calls.length;

    getNotificationsModule();
    const warnCountAfterSecond = warnSpy.mock.calls.length;

    // Warning only fires on the first call; second returns cached null
    expect(warnCountAfterSecond).toBe(warnCountAfterFirst);

    warnSpy.mockRestore();
  });
});
