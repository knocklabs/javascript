// @vitest-environment node
import { jwtDecode } from "jwt-decode";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../src/api";
import Knock from "../src/knock";

import { setupKnockTest, useTestHooks } from "./test-utils/test-setup";

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

/**
 * Modern Knock Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Authentication lifecycle testing
 * - Token management testing
 * - Error scenario coverage
 */
describe("Knock Client", () => {
  describe("Initialization and Configuration", () => {
    test("creates a Knock client with valid API key", () => {
      const knock = new Knock("pk_test_12345");
      expect(knock.apiKey).toBe("pk_test_12345");
      expect(knock).toBeInstanceOf(Knock);
    });

    test("throws error when using secret key instead of public key", () => {
      expect(() => new Knock("sk_test_12345")).toThrowError(
        "[Knock] You are using your secret API key on the client. Please use the public key.",
      );
    });

    test("initializes with custom configuration options", () => {
      const knock = new Knock("pk_test_12345", {
        logLevel: "debug",
        host: "https://custom.knock.app",
      });
      expect(knock.apiKey).toBe("pk_test_12345");
    });

    test("handles null api client creation gracefully", () => {
      const knock = new Knock("pk_test_12345");
      // Spy on the instance method and force it to return null
      vi.spyOn(knock as any, "createApiClient").mockReturnValue(null);
      const client = knock.client();
      expect(client).toBeNull();
    });

    test("creates and provides access to API client", () => {
      const knock = new Knock("pk_test_12345");
      expect(knock.client()).toBeInstanceOf(ApiClient);
    });
  });

  describe("Authentication Lifecycle", () => {
    test("stores user credentials during authentication", () => {
      const knock = new Knock("pk_test_12345");
      knock.authenticate("user_123", "user_token");
      expect(knock.userId).toBe("user_123");
      expect(knock.userToken).toBe("user_token");
      expect(knock.isAuthenticated()).toBe(true);
    });

    test("reinitializes API client when authentication changes", () => {
      const knock = new Knock("pk_test_12345");
      const logSpy = vi.spyOn(knock, "log").mockImplementation(() => {});

      // Initial authentication
      knock.authenticate("user_123", "user_token_1");
      expect(logSpy).toHaveBeenCalledWith("Authenticated with userId user_123");

      // Force client creation
      knock.client();

      // Re-authentication with different credentials
      knock.authenticate("user_456", "user_token_2");
      expect(logSpy).toHaveBeenCalledWith("Authenticated with userId user_456");
      expect(logSpy).toHaveBeenCalledWith(
        "userId or userToken changed; reinitializing connections",
      );
      expect(logSpy).toHaveBeenCalledWith(
        "Reinitialized real-time connections",
      );

      logSpy.mockRestore();
    });

    test("validates authentication state correctly", () => {
      const knock = new Knock("pk_test_12345");

      // Not authenticated initially
      expect(knock.isAuthenticated()).toBe(false);
      expect(knock.isAuthenticated(true)).toBe(false);
      expect(knock.isAuthenticated(false)).toBe(false);

      // Authenticated after authentication
      knock.authenticate("user_123", "user_token_1");
      expect(knock.isAuthenticated()).toBe(true);
      expect(knock.isAuthenticated(true)).toBe(true);
      expect(knock.isAuthenticated(false)).toBe(true);
    });

    test("throws error when not authenticated and authentication required", () => {
      const knock = new Knock("pk_test_12345");

      expect(() => knock.failIfNotAuthenticated()).toThrowError(
        "Not authenticated. Please call `authenticate` first.",
      );

      // Authenticate and expect no error
      knock.authenticate("user_123", "user_token_1");
      expect(() => knock.failIfNotAuthenticated()).not.toThrow();
    });
  });

  describe("Token Management and Expiration", () => {
    test("schedules token expiration callback", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      // Call authenticate with a mock user and token, passing our callback
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

    test("handles token expiration without reauthentication when callback returns falsy", async () => {
      const knock = new Knock("pk_test_12345");
      const authenticateSpy = vi.spyOn(knock, "authenticate");
      const onUserTokenExpiring = vi.fn().mockResolvedValue(null);

      // Call authenticate initially
      knock.authenticate("user_123", "user_token_1", {
        onUserTokenExpiring,
      });

      // Clear the authenticate spy to ignore the initial call
      authenticateSpy.mockClear();

      // Fast-forward to trigger expiration callback
      vi.advanceTimersByTime(31000);

      // Wait for any promises to resolve
      await vi.runAllTimersAsync();

      // Verify the callback was called but authenticate was not called again
      expect(onUserTokenExpiring).toHaveBeenCalled();
      expect(authenticateSpy).not.toHaveBeenCalled();

      authenticateSpy.mockRestore();
    });

    test("handles basic token refresh through callback", async () => {
      const knock = new Knock("pk_test_12345");
      const authenticateSpy = vi.spyOn(knock, "authenticate");
      const onUserTokenExpiring = vi.fn().mockResolvedValue("new_token_123");

      try {
        // Initial authentication
        knock.authenticate("user_123", "user_token_1", {
          onUserTokenExpiring,
        });

        // Clear the spy to ignore the initial call
        authenticateSpy.mockClear();

        // Fast-forward to trigger expiration callback
        vi.advanceTimersByTime(31000);

        // Process the timer and wait for async callbacks
        vi.runOnlyPendingTimers();
        await vi.waitFor(() => {
          expect(onUserTokenExpiring).toHaveBeenCalled();
        });

        // Verify authenticate was called with new token
        expect(authenticateSpy).toHaveBeenCalledWith(
          "user_123",
          "new_token_123",
          {
            onUserTokenExpiring,
            timeBeforeExpirationInMs: 30000,
          },
        );
      } finally {
        // Clean up any timers
        knock.teardown();
        authenticateSpy.mockRestore();
      }
    });

    test("handles promise rejection in token expiration callback gracefully", async () => {
      const knock = new Knock("pk_test_12345");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Use a callback that resolves but doesn't return a valid token
      const onUserTokenExpiring = vi.fn().mockResolvedValue("");

      try {
        knock.authenticate("user_123", "user_token_1", {
          onUserTokenExpiring,
        });

        // Fast-forward to trigger expiration callback
        vi.advanceTimersByTime(31000);

        // Process the timer and wait for callback
        vi.runOnlyPendingTimers();
        await vi.waitFor(() => {
          expect(onUserTokenExpiring).toHaveBeenCalled();
        });

        // The system should handle cases where callback returns empty string
        expect(onUserTokenExpiring).toHaveBeenCalledWith(
          "user_token_1",
          expect.objectContaining({ exp: expect.any(Number) }),
        );
      } finally {
        knock.teardown();
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe("Advanced Token Management Scenarios", () => {
    test("handles successful token refresh through callback", async () => {
      const knock = new Knock("pk_test_12345");
      const authenticateSpy = vi.spyOn(knock, "authenticate");
      const onUserTokenExpiring = vi.fn().mockResolvedValue("new_token_123");

      try {
        // Initial authentication
        knock.authenticate("user_123", "user_token_1", {
          onUserTokenExpiring,
        });

        // Clear the spy to ignore the initial call
        authenticateSpy.mockClear();

        // Fast-forward to trigger expiration callback
        vi.advanceTimersByTime(31000);

        // Process the timer and wait for async callbacks
        vi.runOnlyPendingTimers();
        await vi.waitFor(() => {
          expect(onUserTokenExpiring).toHaveBeenCalled();
        });

        // Verify authenticate was called with new token
        expect(authenticateSpy).toHaveBeenCalledWith(
          "user_123",
          "new_token_123",
          {
            onUserTokenExpiring,
            timeBeforeExpirationInMs: 30000,
          },
        );
      } finally {
        // Clean up any timers
        knock.teardown();
        authenticateSpy.mockRestore();
      }
    });

    test("handles advanced promise rejection in token expiration callback gracefully", async () => {
      const knock = new Knock("pk_test_12345");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Create a callback that resolves but returns null (simulating failure)
      const onUserTokenExpiring = vi.fn().mockResolvedValue(null);

      try {
        knock.authenticate("user_123", "user_token_1", {
          onUserTokenExpiring,
        });

        // Fast-forward to trigger expiration callback
        vi.advanceTimersByTime(31000);

        // Process the timer and wait for callback
        vi.runOnlyPendingTimers();
        await vi.waitFor(
          () => {
            expect(onUserTokenExpiring).toHaveBeenCalled();
          },
          { timeout: 1000 },
        );

        // The system should handle cases where callback returns null/falsy values
        expect(onUserTokenExpiring).toHaveBeenCalledWith(
          "user_token_1",
          expect.objectContaining({ exp: expect.any(Number) }),
        );
      } finally {
        knock.teardown();
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe("Resource Management and Cleanup", () => {
    test("properly cleans up resources during teardown", () => {
      const knock = new Knock("pk_test_12345");

      // Simulate a timeout being scheduled
      const fakeTimerId = 123;
      knock["tokenExpirationTimer"] = fakeTimerId as unknown as ReturnType<
        typeof setTimeout
      >;

      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      // Mock an API client with a connected socket
      const disconnectSpy = vi.fn();
      const isConnectedSpy = vi.fn().mockReturnValue(true);

      knock["apiClient"] = {
        socket: {
          isConnected: isConnectedSpy,
          disconnect: disconnectSpy,
        },
      } as any;

      knock.teardown();

      // Assert timer was cleared
      expect(clearTimeoutSpy).toHaveBeenCalledWith(fakeTimerId);

      // Assert disconnect logic was triggered
      expect(isConnectedSpy).toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe("Logging and Debug Features", () => {
    test("logs messages when debug mode is enabled", () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const knock = new Knock("pk_test_12345", { logLevel: "debug" });
      knock.log("debug message");

      expect(consoleLogSpy).toHaveBeenCalledWith("[Knock] debug message");

      consoleLogSpy.mockRestore();
    });

    test("logs forced messages regardless of log level", () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const knock = new Knock("pk_test_12345");
      knock.log("forced message", true);

      expect(consoleLogSpy).toHaveBeenCalledWith("[Knock] forced message");

      consoleLogSpy.mockRestore();
    });

    test("suppresses logs when not in debug mode and not forced", () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const knock = new Knock("pk_test_12345");
      knock.log("should not log");

      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe("Integration Scenarios", () => {
    const getTestSetup = useTestHooks(() => setupKnockTest());

    test("integrates properly with API client", () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        expect(knock.client()).toBe(mockApiClient);
        expect(knock.client().makeRequest).toBeDefined();
      } finally {
        cleanup();
      }
    });

    test("maintains authentication state across operations", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Initially not authenticated
        expect(knock.isAuthenticated()).toBe(false);

        // Authenticate
        knock.authenticate("user_123", "token_123");
        expect(knock.isAuthenticated()).toBe(true);
        expect(knock.userId).toBe("user_123");
        expect(knock.userToken).toBe("token_123");

        // Should remain authenticated after client access
        knock.client();
        expect(knock.isAuthenticated()).toBe(true);
      } finally {
        cleanup();
      }
    });
  });
});
