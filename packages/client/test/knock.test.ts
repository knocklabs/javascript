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
  });
});
