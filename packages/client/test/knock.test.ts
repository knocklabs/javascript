// @vitest-environment node
import { jwtDecode } from "jwt-decode";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../src/api";
import Knock from "../src/knock";

// const apiClientMock = vi.fn();

// vi.mock("../src/api", () => ({
//   default: apiClientMock,
// }));

// ✅ Mock the named export `jwtDecode` from the "jwt-decode" module.
// It will always return a decoded token with an `exp` 61 seconds in the future.
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({
    exp: Math.floor(Date.now() / 1000) + 61,
  })),
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("knock", () => {
  test("can create a Knock client", () => {
    const knock = new Knock("pk_test_12345");
    expect(knock.apiKey).toBe("pk_test_12345");
  });

  test("throw error given secret key", () => {
    expect(() => new Knock("sk_test_12345")).toThrowError(
      "[Knock] You are using your secret API key on the client. Please use the public key.",
    );
  });

  test("returns null if no api client is created", () => {
    const knock = new Knock("pk_test_12345");
    // Spy on the instance method and force it to return null
    vi.spyOn(knock as any, "createApiClient").mockReturnValue(null);
    const client = knock.client();
    expect(client).toBeNull();
  });

  test("contains api client", () => {
    const knock = new Knock("pk_test_12345");
    expect(knock.client()).toBeInstanceOf(ApiClient);
  });

  test("authenticate stores user id and token", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("user_123", "user_token");
    expect(knock.userId).toBe("user_123");
    expect(knock.userToken).toBe("user_token");
  });

  test("authenticate reinitializes api client", () => {
    const knock = new Knock("pk_test_12345");
    const logSpy = vi.spyOn(knock, "log");
    knock.authenticate("user_123", "user_token_1");
    expect(logSpy).toHaveBeenCalledWith("Authenticated with userId user_123");
    knock.client();
    knock.authenticate("user_456", "user_token_2");
    expect(logSpy).toHaveBeenCalledWith("Authenticated with userId user_456");
    expect(logSpy).toHaveBeenCalledWith(
      "userId or userToken changed; reinitializing connections",
    );
    expect(logSpy).toHaveBeenCalledWith("Reinitialized real-time connections");
  });

  test("authenticate schedules user token expiration", () => {
    const knock = new Knock("pk_test_12345");
    const onUserTokenExpiring = vi.fn();

    //  Call authenticate with a mock user and token, passing our callback
    knock.authenticate("user_123", "user_token_1", {
      onUserTokenExpiring,
    });

    // Fast-forward time by 31 seconds.
    // The token expires in 61s, and Knock schedules the callback to run 30s *before* expiration.
    // So it should fire after 31s.
    vi.advanceTimersByTime(31000);

    // Assert that the callback was called with the original token and decoded payload
    expect(onUserTokenExpiring).toHaveBeenCalledWith(
      "user_token_1",
      expect.objectContaining({ exp: expect.any(Number) }),
    );

    // Also verify it was called exactly once
    expect(onUserTokenExpiring).toHaveBeenCalledTimes(1);
  });

  test("failIfNotAuthenticated throws error if not authenticated", () => {
    const knock = new Knock("pk_test_12345");
    expect(() => knock.failIfNotAuthenticated()).toThrowError(
      "Not authenticated. Please call `authenticate` first.",
    );

    // Authenticate and expect no error
    knock.authenticate("user_123", "user_token_1");
    expect(() => knock.failIfNotAuthenticated()).not.toThrow();
  });

  test("isAuthenticated returns true if authenticated", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("user_123", "user_token_1");
    expect(knock.isAuthenticated()).toBe(true);
    expect(knock.isAuthenticated(true)).toBe(true);
    expect(knock.isAuthenticated(false)).toBe(true);
  });

  test("isAuthenticated returns false if not authenticated", () => {
    const knock = new Knock("pk_test_12345");
    expect(knock.isAuthenticated()).toBe(false);
    expect(knock.isAuthenticated(true)).toBe(false);
    expect(knock.isAuthenticated(false)).toBe(false);
  });

  test("teardown clears token timer and disconnects socket if connected", () => {
    const knock = new Knock("pk_test_12345");

    // ✅ Simulate a timeout being scheduled
    const fakeTimerId = 123;
    knock["tokenExpirationTimer"] = fakeTimerId as unknown as ReturnType<
      typeof setTimeout
    >;

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    // ✅ Mock an API client with a connected socket
    const disconnectSpy = vi.fn();
    const isConnectedSpy = vi.fn().mockReturnValue(true);

    knock["apiClient"] = {
      socket: {
        isConnected: isConnectedSpy,
        disconnect: disconnectSpy,
      },
    } as any;

    knock.teardown();

    // ✅ Assert timer was cleared
    expect(clearTimeoutSpy).toHaveBeenCalledWith(fakeTimerId);

    // ✅ Assert disconnect logic was triggered
    expect(isConnectedSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("log only prints when logLevel is 'debug'", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const knock = new Knock("pk_test_12345", { logLevel: "debug" });
    knock.log("debug message");

    expect(consoleLogSpy).toHaveBeenCalledWith("[Knock] debug message");

    consoleLogSpy.mockRestore();
  });

  test("log prints when force is true, regardless of logLevel", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const knock = new Knock("pk_test_12345");
    knock.log("forced message", true);

    expect(consoleLogSpy).toHaveBeenCalledWith("[Knock] forced message");

    consoleLogSpy.mockRestore();
  });

  test("log does not print when logLevel is not 'debug' and force is false", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const knock = new Knock("pk_test_12345");
    knock.log("should not log");

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  test("maybeScheduleUserTokenExpiration does not reauthenticate when callback returns falsy", async () => {
    const knock = new Knock("pk_test_12345");
    const authenticateSpy = vi.spyOn(knock, "authenticate");
    const onUserTokenExpiring = vi.fn().mockResolvedValue(null);

    // Call authenticate initially
    knock.authenticate("user_123", "user_token_1", {
      onUserTokenExpiring,
    });

    const initialCallCount = authenticateSpy.mock.calls.length;

    // Fast-forward time to trigger the callback
    vi.advanceTimersByTime(31000);
    await vi.runAllTimersAsync();

    // Should not have called authenticate again since callback returned null (lines 154-157)
    expect(authenticateSpy).toHaveBeenCalledTimes(initialCallCount);
  });

  test("maybeScheduleUserTokenExpiration handles no userToken case", async () => {
    const knock = new Knock("pk_test_12345");
    const onUserTokenExpiring = vi.fn();

    // Authenticate without userToken
    knock.authenticate("user_123", undefined, {
      onUserTokenExpiring,
    });

    // Should not schedule any timeout since there's no userToken
    vi.advanceTimersByTime(31000);
    await vi.runAllTimersAsync();

    expect(onUserTokenExpiring).not.toHaveBeenCalled();
  });

  describe("with custom jwt token", () => {
    test("schedules token expiration callback with future expiration", async () => {
      const mockCallback = vi.fn().mockResolvedValue("new_token");
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const mockDecodedToken = { exp: futureExp };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedToken);

      const knock = new Knock("pk_test_123");

      // Mock authenticate to prevent infinite recursion
      const authenticateSpy = vi.spyOn(knock, "authenticate");

      // Call authenticate once to set up the initial timer
      knock.authenticate("user_123", "old_token", {
        onUserTokenExpiring: mockCallback,
        timeBeforeExpirationInMs: 30000,
      });

      // Now mock authenticate to prevent recursion when callback fires
      authenticateSpy.mockImplementation(() => {});

      // Fast forward to trigger the callback
      const timeToCallback = futureExp * 1000 - 30000 - Date.now();
      vi.advanceTimersByTime(timeToCallback + 100);

      // Wait for async operations to complete
      await vi.runAllTimersAsync();

      expect(mockCallback).toHaveBeenCalledWith("old_token", mockDecodedToken);
      expect(authenticateSpy).toHaveBeenCalledWith("user_123", "new_token", {
        onUserTokenExpiring: mockCallback,
        timeBeforeExpirationInMs: 30000,
      });
    });

    test("handles token expiration callback returning undefined", async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined);
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const mockDecodedToken = { exp: futureExp };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedToken);

      const knock = new Knock("pk_test_123");
      const authenticateSpy = vi.spyOn(knock, "authenticate");

      knock.authenticate("user_123", "old_token", {
        onUserTokenExpiring: mockCallback,
        timeBeforeExpirationInMs: 30000,
      });

      // Mock authenticate to prevent recursion
      authenticateSpy.mockImplementation(() => {});

      const timeToCallback = futureExp * 1000 - 30000 - Date.now();
      vi.advanceTimersByTime(timeToCallback + 100);
      await vi.runAllTimersAsync();

      expect(mockCallback).toHaveBeenCalledWith("old_token", mockDecodedToken);
      // Should not call authenticate again when callback returns undefined (lines 154-157)
      expect(authenticateSpy).toHaveBeenCalledTimes(1); // Only the initial call
    });

    test("does not schedule expiration when token is already expired", async () => {
      const mockCallback = vi.fn();
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago (expired)
      const mockDecodedToken = { exp: pastExp };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedToken);

      const knock = new Knock("pk_test_123");

      knock.authenticate("user_123", "expired_token", {
        onUserTokenExpiring: mockCallback,
      });

      // Fast forward time
      vi.advanceTimersByTime(60000);
      await vi.runAllTimersAsync();

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
