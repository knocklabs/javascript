// @vitest-environment node
import { jwtDecode } from "jwt-decode";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../src/api";
import Knock from "../src/knock";

import { mockJwtDecode } from "./test-utils/mocks";
import { authenticateKnock, createMockKnock } from "./test-utils/mocks";

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
  vi.clearAllMocks();
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
    test("creates a Knock client with API key", () => {
      const knock = new Knock("pk_test_12345");

      expect(knock).toBeInstanceOf(Knock);
      expect(knock.apiKey).toBe("pk_test_12345");
    });

    test("throws error when using secret key", () => {
      expect(() => new Knock("sk_test_12345")).toThrowError(
        "[Knock] You are using your secret API key on the client. Please use the public key.",
      );
    });

    test("initializes with custom configuration options", () => {
      // Suppress console.log for debug mode
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        const knock = new Knock("pk_test_12345", {
          logLevel: "debug",
          host: "https://custom.knock.app",
        });

        expect(knock).toBeInstanceOf(Knock);
        expect(knock.apiKey).toBe("pk_test_12345");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles different log levels", () => {
      // Suppress console.log for debug mode
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        // Only test the debug log level that actually exists
        const knock = new Knock("pk_test_12345", { logLevel: "debug" });
        expect(knock).toBeInstanceOf(Knock);

        // Test without log level (default)
        const knockDefault = new Knock("pk_test_12345");
        expect(knockDefault).toBeInstanceOf(Knock);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles custom host configuration", () => {
      const knock = new Knock("pk_test_12345", {
        host: "https://custom.knock.app",
      });

      expect(knock).toBeInstanceOf(Knock);
    });
  });

  describe("Authentication", () => {
    test("authenticates user with credentials", () => {
      const knock = new Knock("pk_test_12345");

      knock.authenticate("user_123", "token_456");

      expect(knock.userId).toBe("user_123");
      expect(knock.userToken).toBe("token_456");
      expect(knock.isAuthenticated()).toBe(true);
    });

    test("validates authentication state", () => {
      const knock = new Knock("pk_test_12345");

      expect(knock.isAuthenticated()).toBe(false);

      knock.authenticate("user_123", "token_456");
      expect(knock.isAuthenticated()).toBe(true);
    });

    test("throws error when operations require authentication", () => {
      const knock = new Knock("pk_test_12345");

      expect(() => knock.failIfNotAuthenticated()).toThrowError(
        "Not authenticated. Please call `authenticate` first.",
      );
    });

    test("allows operations after authentication", () => {
      const knock = new Knock("pk_test_12345");

      knock.authenticate("user_123", "token_456");

      expect(() => knock.failIfNotAuthenticated()).not.toThrow();
    });

    test("handles authentication with options", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      knock.authenticate("user_123", "token_456", {
        onUserTokenExpiring,
      });

      expect(knock.isAuthenticated()).toBe(true);
    });
  });

  describe("Client Management", () => {
    test("provides API client after setup", () => {
      const { knock, mockApiClient } = createMockKnock();

      const client = knock.client();

      expect(client).toBe(mockApiClient);
    });

    test("creates new client instances", () => {
      const knock = new Knock("pk_test_12345");
      const client1 = knock.client();
      const client2 = knock.client();

      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
    });

    test("handles client creation with authentication", () => {
      const { knock, mockApiClient } = createMockKnock();

      authenticateKnock(knock);
      const client = knock.client();

      expect(client).toBe(mockApiClient);
      expect(knock.isAuthenticated()).toBe(true);
    });
  });

  describe("Client Collections", () => {
    test("provides user client", () => {
      const { knock } = createMockKnock();

      const user = knock.user;

      expect(user).toBeDefined();
      expect(typeof user.identify).toBe("function");
    });

    test("provides messages client", () => {
      const { knock } = createMockKnock();

      const messages = knock.messages;

      expect(messages).toBeDefined();
      expect(typeof messages.get).toBe("function");
    });

    test("provides objects client", () => {
      const { knock } = createMockKnock();

      const objects = knock.objects;

      expect(objects).toBeDefined();
    });
  });

  describe("Logging", () => {
    test("supports different log levels", () => {
      // Suppress console.log for debug mode
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        const knock = new Knock("pk_test_12345", { logLevel: "debug" });
        const logSpy = vi.spyOn(knock, "log");

        knock.log("Test message");

        expect(logSpy).toHaveBeenCalledWith("Test message");

        logSpy.mockRestore();
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles log messages", () => {
      const knock = new Knock("pk_test_12345");
      const logSpy = vi.spyOn(knock, "log");

      knock.log("Debug message");

      expect(logSpy).toHaveBeenCalled();

      logSpy.mockRestore();
    });

    test("force logs messages regardless of log level", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        const knock = new Knock("pk_test_12345"); // No debug log level

        knock.log("Forced message", true);

        expect(consoleSpy).toHaveBeenCalledWith("[Knock] Forced message");
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe("JWT Token Expiration", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("schedules token expiration callback when token expires in future", async () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn().mockResolvedValue("new_token");

      // Create a proper JWT token that expires in 1 minute (60000ms)
      const futureExp = Math.floor((Date.now() + 60000) / 1000);

      // Mock jwtDecode to return the future expiration
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ exp: futureExp });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDk1ODEwNDJ9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
        timeBeforeExpirationInMs: 10000, // Call 10 seconds before expiration
      });

      // Fast-forward to when the callback should be triggered (50 seconds from now)
      vi.advanceTimersByTime(50000);

      expect(onUserTokenExpiring).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({ exp: futureExp }),
      );
    });

    test("handles token expiration with new token returned", async () => {
      const knock = new Knock("pk_test_12345");
      const authenticateSpy = vi.spyOn(knock, "authenticate");
      const onUserTokenExpiring = vi.fn().mockResolvedValue("new_token_456");

      // Create a JWT token that expires in 1 minute
      const futureExp = Math.floor((Date.now() + 60000) / 1000);

      // Mock jwtDecode to return the future expiration
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ exp: futureExp });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDk1ODEwNDJ9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
        timeBeforeExpirationInMs: 10000,
      });

      // Fast-forward to trigger the callback
      await vi.advanceTimersByTimeAsync(50000);

      expect(onUserTokenExpiring).toHaveBeenCalled();

      // Wait for the promise to resolve
      await vi.waitFor(() => {
        expect(authenticateSpy).toHaveBeenCalledWith(
          "user_123",
          "new_token_456",
          {
            onUserTokenExpiring,
            timeBeforeExpirationInMs: 10000,
          },
        );
      });

      authenticateSpy.mockRestore();
    });

    test("handles token expiration with non-string callback result", async () => {
      const knock = new Knock("pk_test_12345");
      const authenticateSpy = vi.spyOn(knock, "authenticate");
      const onUserTokenExpiring = vi.fn().mockResolvedValue(null); // Return non-string

      // Create a JWT token that expires in 1 minute
      const futureExp = Math.floor((Date.now() + 60000) / 1000);

      // Mock jwtDecode to return the future expiration
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ exp: futureExp });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDk1ODEwNDJ9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
      });

      // Fast-forward to trigger the callback
      await vi.advanceTimersByTimeAsync(30000);

      expect(onUserTokenExpiring).toHaveBeenCalled();

      // Should not call authenticate again since callback didn't return a string
      expect(authenticateSpy).toHaveBeenCalledTimes(1); // Only the initial call

      authenticateSpy.mockRestore();
    });

    test("does not schedule expiration for token without expiration", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      // Mock jwtDecode to return a token without exp claim
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ sub: "user_123" });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
      });

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      expect(onUserTokenExpiring).not.toHaveBeenCalled();
    });

    test("does not schedule expiration for already expired token", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      // Create a JWT token that already expired
      const pastExp = Math.floor((Date.now() - 60000) / 1000);

      // Mock jwtDecode to return the past expiration
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ exp: pastExp });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDk1ODA5MjF9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
      });

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      expect(onUserTokenExpiring).not.toHaveBeenCalled();
    });

    test("does not schedule expiration when no userToken provided", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      knock.authenticate("user_123", undefined, {
        onUserTokenExpiring,
      });

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      expect(onUserTokenExpiring).not.toHaveBeenCalled();
    });

    test("handles token with exp value of 0", () => {
      const knock = new Knock("pk_test_12345");
      const onUserTokenExpiring = vi.fn();

      // Mock jwtDecode to return a token with exp: 0
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValueOnce({ exp: 0 });

      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.signature";

      knock.authenticate("user_123", mockToken, {
        onUserTokenExpiring,
      });

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      expect(onUserTokenExpiring).not.toHaveBeenCalled();
    });
  });

  describe("Authentication with reinitialize", () => {
    test("reinitializes connections when userId changes", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        const knock = new Knock("pk_test_12345", { logLevel: "debug" });

        // Mock the required methods
        const teardownSpy = vi.spyOn(knock.feeds, "teardownInstances");
        const reinitializeSpy = vi.spyOn(knock.feeds, "reinitializeInstances");
        const teardownKnockSpy = vi.spyOn(knock, "teardown");

        // First authentication
        knock.authenticate("user_123", "token_456");

        // Get the api client so it's initialized
        knock.client();

        // Second authentication with different userId
        knock.authenticate("user_789", "token_456");

        expect(teardownSpy).toHaveBeenCalled();
        expect(teardownKnockSpy).toHaveBeenCalled();
        expect(reinitializeSpy).toHaveBeenCalled();

        teardownSpy.mockRestore();
        reinitializeSpy.mockRestore();
        teardownKnockSpy.mockRestore();
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("reinitializes connections when userToken changes", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      try {
        const knock = new Knock("pk_test_12345", { logLevel: "debug" });

        // Mock the required methods
        const teardownSpy = vi.spyOn(knock.feeds, "teardownInstances");
        const reinitializeSpy = vi.spyOn(knock.feeds, "reinitializeInstances");
        const teardownKnockSpy = vi.spyOn(knock, "teardown");

        // First authentication
        knock.authenticate("user_123", "token_456");

        // Get the api client so it's initialized
        knock.client();

        // Second authentication with different userToken
        knock.authenticate("user_123", "token_789");

        expect(teardownSpy).toHaveBeenCalled();
        expect(teardownKnockSpy).toHaveBeenCalled();
        expect(reinitializeSpy).toHaveBeenCalled();

        teardownSpy.mockRestore();
        reinitializeSpy.mockRestore();
        teardownKnockSpy.mockRestore();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe("Teardown", () => {
    test("clears token expiration timer on teardown", () => {
      const knock = new Knock("pk_test_12345");

      // Mock the clearTimeout
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      knock["tokenExpirationTimer"] = setTimeout(() => {}, 1000);

      knock.teardown();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    test("disconnects socket on teardown when connected", () => {
      const knock = new Knock("pk_test_12345");

      // Mock the socket with correct interface
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(true),
        disconnect: vi.fn(),
      };

      const mockApiClient = {
        socket: mockSocket, // Direct property, not a function
      };

      knock["apiClient"] = mockApiClient as any;

      knock.teardown();

      expect(mockSocket.isConnected).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    test("handles teardown when socket is not connected", () => {
      const knock = new Knock("pk_test_12345");

      // Mock the socket as not connected
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(false),
        disconnect: vi.fn(),
      };

      const mockApiClient = {
        socket: mockSocket,
      };

      knock["apiClient"] = mockApiClient as any;

      // Should not throw an error
      expect(() => knock.teardown()).not.toThrow();
      expect(mockSocket.isConnected).toHaveBeenCalled();
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });
  });

  describe("isAuthenticated with userToken check", () => {
    test("returns false when checkUserToken is true but no userToken", () => {
      const knock = new Knock("pk_test_12345");

      knock.authenticate("user_123"); // No userToken provided

      expect(knock.isAuthenticated(false)).toBe(true);
      expect(knock.isAuthenticated(true)).toBe(false);
    });

    test("returns true when checkUserToken is true and userToken exists", () => {
      const knock = new Knock("pk_test_12345");

      knock.authenticate("user_123", "token_456");

      expect(knock.isAuthenticated(true)).toBe(true);
    });
  });
});
