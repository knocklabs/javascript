import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../src/api";

import { createAxiosMock, mockAxios } from "./test-utils/mocks";

// Type for accessing global properties
type GlobalWithWindow = Record<string, unknown>;

// Use vi.hoisted to ensure proper mock setup
const { mockIsNetworkError, mockExponentialDelay, mockAxiosRetry } = vi.hoisted(
  () => {
    const mockIsNetworkError = vi.fn();
    const mockExponentialDelay = vi.fn().mockReturnValue(1000);
    const mockAxiosRetry = Object.assign(vi.fn(), {
      isNetworkError: mockIsNetworkError,
      exponentialDelay: mockExponentialDelay,
    });

    return { mockIsNetworkError, mockExponentialDelay, mockAxiosRetry };
  },
);

// Mock axios-retry using the hoisted mocks
vi.mock("axios-retry", () => ({
  default: mockAxiosRetry,
  isNetworkError: mockIsNetworkError,
  exponentialDelay: mockExponentialDelay,
}));

// Mock Phoenix Socket directly in this file - vi.mock() calls are hoisted
vi.mock("phoenix", () => ({
  Socket: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    channel: vi.fn().mockReturnValue({
      join: vi.fn(),
      leave: vi.fn(),
      push: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }),
  })),
}));

// Apply module-level mocks
mockAxios();

/**
 * Modern API Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - Realistic network simulation
 * - Environment-specific testing (browser vs server)
 * - Comprehensive error handling scenarios
 * - Network resilience testing
 * - Performance characteristics testing
 */
describe("API Client", () => {
  beforeEach(() => {
    // Clean slate for each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Client Initialization", () => {
    test("creates API client with proper configuration", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient).toBeInstanceOf(ApiClient);
      // Don't test private properties directly - just verify it was created
    });

    test("handles user token in configuration", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
      });

      expect(apiClient).toBeInstanceOf(ApiClient);
      // Don't test private properties directly - just verify it was created
    });

    test("initializes WebSocket in browser environment", () => {
      // Store original window value
      const originalWindow = (global as GlobalWithWindow).window;

      // Mock window to simulate browser environment
      (global as GlobalWithWindow).window = {} as Window;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      // With mocked Phoenix Socket, socket should be defined in browser environment
      expect(apiClient.socket).toBeDefined();

      // Restore original window value
      (global as GlobalWithWindow).window = originalWindow;
    });

    test("skips WebSocket in server environment", () => {
      // Ensure window is undefined (server environment)
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = undefined;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeUndefined();

      // Restore original window value
      (global as GlobalWithWindow).window = originalWindow;
    });
  });

  describe("Request Handling", () => {
    test("makes successful API requests", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      // Mock the internal axios client
      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      mockHttp.mockSuccess({ data: "test response" });

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(response.body.data).toBe("test response");
    });

    test("handles request with parameters", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      mockHttp.mockSuccess({ received: true });

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
        params: { filter: "active" },
      });

      expect(response.statusCode).toBe("ok");
      expect(mockHttp.axios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { filter: "active" },
        }),
      );
    });

    test("handles POST requests with data", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      const testData = { name: "Test", value: 42 };
      mockHttp.mockSuccess({ created: true });

      const response = await apiClient.makeRequest({
        method: "POST",
        url: "/test",
        data: testData,
      });

      expect(response.statusCode).toBe("ok");
      expect(mockHttp.axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: testData,
        }),
      );
    });
  });

  describe("Error Handling", () => {
    test("handles network errors gracefully", async () => {
      // Suppress console.error for this expected error test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const mockHttp = createAxiosMock();
        const apiClient = new ApiClient({
          host: "https://api.knock.app",
          apiKey: "pk_test_12345",
          userToken: undefined,
        });

        (apiClient as unknown as Record<string, unknown>).axiosClient =
          mockHttp.axios;

        // Mock network failure - this should not create unhandled rejections
        const networkError = new Error("Network Error");
        (
          networkError as unknown as { code?: string; isAxiosError?: boolean }
        ).code = "ECONNABORTED";
        (networkError as unknown as { isAxiosError?: boolean }).isAxiosError =
          true;
        mockHttp.axios.mockRejectedValue(networkError);

        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        expect(response.statusCode).toBe("error");
        expect(response.error).toBe(networkError);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles different error types appropriately", async () => {
      // Suppress console.error for this expected error test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const mockHttp = createAxiosMock();
        const apiClient = new ApiClient({
          host: "https://api.knock.app",
          apiKey: "pk_test_12345",
          userToken: undefined,
        });

        (apiClient as unknown as Record<string, unknown>).axiosClient =
          mockHttp.axios;

        const errorScenarios = [
          {
            name: "timeout",
            error: {
              message: "timeout of 5000ms exceeded",
              code: "ECONNABORTED",
            },
          },
          {
            name: "server error",
            error: {
              message: "Server Error",
              response: { status: 500, data: { error: "Internal Error" } },
            },
          },
          {
            name: "not found",
            error: {
              message: "Not Found",
              response: { status: 404, data: { error: "Resource not found" } },
            },
          },
        ];

        for (const scenario of errorScenarios) {
          mockHttp.axios.mockRejectedValueOnce(scenario.error);

          const response = await apiClient.makeRequest({
            method: "GET",
            url: "/test",
          });

          expect(response.statusCode).toBe("error");
          expect(response.error).toBe(scenario.error);
        }
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles API error responses", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      mockHttp.mockError(500, "Internal Server Error");

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("error");
      expect(response.status).toBe(500);
    });
  });

  describe("Retry and Resilience", () => {
    test("implements error handling for transient failures", async () => {
      // Suppress console.error for this expected error test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const mockHttp = createAxiosMock();
        const apiClient = new ApiClient({
          host: "https://api.knock.app",
          apiKey: "pk_test_12345",
          userToken: undefined,
        });

        (apiClient as unknown as Record<string, unknown>).axiosClient =
          mockHttp.axios;

        // Mock network timeout - should not create unhandled rejections
        mockHttp.axios.mockRejectedValueOnce(new Error("Network timeout"));

        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        // Should handle the error gracefully
        expect(response.statusCode).toBe("error");
        expect(response.error).toBeInstanceOf(Error);
        expect(response.error.message).toBe("Network timeout");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("retries on network errors", async () => {
      // Configure the mock to return true for network errors
      mockIsNetworkError.mockReturnValue(true);

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      // Mock network error
      const networkError = new Error("Network Error");
      (
        networkError as unknown as { code?: string; isAxiosError?: boolean }
      ).code = "ECONNABORTED";
      (networkError as unknown as { isAxiosError?: boolean }).isAxiosError =
        true;

      const canRetry = (apiClient as unknown as Record<string, unknown>)
        .canRetryRequest as (error: unknown) => boolean;
      expect(canRetry(networkError)).toBe(true);
      expect(mockIsNetworkError).toHaveBeenCalledWith(networkError);
    });

    test("retries on 5xx server errors", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      const serverErrors = [500, 501, 502, 503, 504, 599];

      serverErrors.forEach((status) => {
        const serverError = {
          response: { status },
          isAxiosError: true,
        };

        // Mock axiosRetry.isNetworkError to return false for server errors
        mockIsNetworkError.mockReturnValue(false);

        const canRetry = (apiClient as unknown as Record<string, unknown>)
          .canRetryRequest as (error: unknown) => boolean;
        expect(canRetry(serverError)).toBe(true);
      });
    });

    test("retries on rate limit errors (429)", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      const rateLimitError = {
        response: { status: 429 },
        isAxiosError: true,
      };

      mockIsNetworkError.mockReturnValue(false);

      const canRetry = (apiClient as unknown as Record<string, unknown>)
        .canRetryRequest as (error: unknown) => boolean;
      expect(canRetry(rateLimitError)).toBe(true);
    });

    test("does not retry on client errors (4xx except 429)", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      const clientErrors = [400, 401, 403, 404, 422];

      clientErrors.forEach((status) => {
        const clientError = {
          response: { status },
          isAxiosError: true,
        };

        // Mock axiosRetry.isNetworkError to return false
        mockIsNetworkError.mockReturnValue(false);

        const canRetry = (apiClient as unknown as Record<string, unknown>)
          .canRetryRequest as (error: unknown) => boolean;
        expect(canRetry(clientError)).toBe(false);
      });
    });

    test("does not retry when response is undefined", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      const errorWithoutResponse = {
        isAxiosError: true,
        response: undefined,
      };

      mockIsNetworkError.mockReturnValue(false);

      const canRetry = (apiClient as unknown as Record<string, unknown>)
        .canRetryRequest as (error: unknown) => boolean;
      expect(canRetry(errorWithoutResponse)).toBe(false);
    });

    test("does not retry on successful 2xx responses", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      const successResponses = [200, 201, 204];

      successResponses.forEach((status) => {
        const successError = {
          response: { status },
          isAxiosError: true,
        };

        // Mock axiosRetry.isNetworkError to return false
        mockIsNetworkError.mockReturnValue(false);

        const canRetry = (apiClient as unknown as Record<string, unknown>)
          .canRetryRequest as (error: unknown) => boolean;
        expect(canRetry(successError)).toBe(false);
      });
    });
  });

  describe("Request Configuration", () => {
    test("supports various HTTP methods", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        mockHttp.mockSuccess({ method });

        const response = await apiClient.makeRequest({
          method: method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
          url: "/test",
        });

        expect(response.statusCode).toBe("ok");
        expect(response.body.method).toBe(method);
      }
    });

    test("handles request parameters correctly", async () => {
      const mockHttp = createAxiosMock();
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      (apiClient as unknown as Record<string, unknown>).axiosClient =
        mockHttp.axios;

      mockHttp.axios.mockImplementation((config: unknown) => {
        return Promise.resolve({
          status: 200,
          data: { receivedConfig: config },
        });
      });

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
        params: { filter: "active", limit: 10 },
      });

      expect(response.statusCode).toBe("ok");
      expect(response.body.receivedConfig).toBeDefined();
    });
  });

  describe("Socket Connection Management", () => {
    test("provides socket interface in browser environment", () => {
      // Store original window value
      const originalWindow = (global as GlobalWithWindow).window;

      // Mock window to simulate browser environment
      (global as GlobalWithWindow).window = {};

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeDefined();

      // Restore original window value
      (global as GlobalWithWindow).window = originalWindow;
    });

    test("gracefully handles missing WebSocket in server environment", () => {
      // Store original window value
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = undefined;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      // In server environment, socket should be undefined
      expect(apiClient.socket).toBeUndefined();

      // Restore original window value
      (global as GlobalWithWindow).window = originalWindow;
    });
  });
});
