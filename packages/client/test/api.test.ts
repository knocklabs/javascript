// @vitest-environment node
import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { Socket } from "phoenix";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../src/api";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => vi.fn()),
  },
}));

// Mock phoenix Socket
vi.mock("phoenix", () => ({
  Socket: vi.fn(),
}));

// Mock axios-retry
vi.mock("axios-retry", () => {
  const mockRetry = vi.fn((axiosInstance) => axiosInstance);
  const mockIsNetworkError = vi.fn(() => false);
  Object.defineProperty(mockRetry, "isNetworkError", {
    value: mockIsNetworkError,
  });
  return {
    default: mockRetry,
  };
});

// Mock window for browser environment tests
const mockWindow = {
  WebSocket: {},
};

describe("ApiClient", () => {
  const defaultOptions = {
    host: "https://api.knock.app",
    apiKey: "pk_test_123",
    userToken: "user_token_123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window to undefined by default
    vi.stubGlobal("window", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("creates an instance with correct configuration", () => {
    const client = new ApiClient(defaultOptions);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: defaultOptions.host,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${defaultOptions.apiKey}`,
        "X-Knock-User-Token": defaultOptions.userToken,
      },
    });

    expect(axiosRetry).toHaveBeenCalled();
  });

  test("initializes socket in browser environment", () => {
    // Mock window to simulate browser environment
    vi.stubGlobal("window", mockWindow);

    const client = new ApiClient(defaultOptions);

    expect(Socket).toHaveBeenCalledWith("wss://api.knock.app/ws/v1", {
      params: {
        user_token: defaultOptions.userToken,
        api_key: defaultOptions.apiKey,
      },
    });

    expect(client.socket).toBeDefined();
  });

  test("does not initialize socket in non-browser environment", () => {
    // window is already undefined from beforeEach
    const client = new ApiClient(defaultOptions);
    expect(client.socket).toBeUndefined();
  });

  describe("makeRequest", () => {
    test("handles successful requests", async () => {
      const mockAxiosInstance = vi.fn().mockResolvedValue({
        status: 200,
        data: { message: "success" },
      });

      vi.mocked(axios.create).mockReturnValueOnce(mockAxiosInstance as any);

      const client = new ApiClient(defaultOptions);
      const response = await client.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response).toEqual({
        statusCode: "ok",
        body: { message: "success" },
        error: undefined,
        status: 200,
      });
    });

    test("handles failed requests and logs error", async () => {
      // Create a mock that simulates an axios error
      const mockAxiosInstance = vi.fn();

      vi.mocked(axios.create).mockReturnValueOnce(mockAxiosInstance as any);

      const client = new ApiClient(defaultOptions);

      // Simulate an axios error by rejecting with a structured error
      const axiosError = {
        message: "Request failed",
        response: {
          status: 500,
          data: null,
        },
      };

      mockAxiosInstance.mockRejectedValueOnce(axiosError);

      // Mock console.error to capture the call and suppress output during test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const response = await client.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response).toEqual({
        statusCode: "error",
        body: undefined,
        error: axiosError,
        status: 500,
      });

      // Verify console.error was called with the error (line 65)
      expect(consoleSpy).toHaveBeenCalledWith(axiosError);

      consoleSpy.mockRestore();
    });

    test("handles requests with status codes between 200-299 as ok", async () => {
      const mockAxiosInstance = vi.fn().mockResolvedValue({
        status: 201,
        data: { created: true },
      });

      vi.mocked(axios.create).mockReturnValueOnce(mockAxiosInstance as any);

      const client = new ApiClient(defaultOptions);
      const response = await client.makeRequest({
        method: "POST",
        url: "/test",
      });

      expect(response).toEqual({
        statusCode: "ok",
        body: { created: true },
        error: undefined,
        status: 201,
      });
    });

    test("handles requests with status codes 300+ as error", async () => {
      const mockAxiosInstance = vi.fn().mockResolvedValue({
        status: 302,
        data: { redirect: true },
      });

      vi.mocked(axios.create).mockReturnValueOnce(mockAxiosInstance as any);

      const client = new ApiClient(defaultOptions);
      const response = await client.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response).toEqual({
        statusCode: "error",
        body: { redirect: true },
        error: undefined,
        status: 302,
      });
    });
  });

  describe("canRetryRequest", () => {
    let client: ApiClient;

    beforeEach(() => {
      client = new ApiClient(defaultOptions);
      // Reset the isNetworkError mock to return false by default
      const mockedAxiosRetry = vi.mocked(axiosRetry) as any;
      mockedAxiosRetry.isNetworkError.mockReturnValue(false);
    });

    test("retries on network errors", () => {
      // Access the mocked isNetworkError function
      const mockedAxiosRetry = vi.mocked(axiosRetry) as any;
      mockedAxiosRetry.isNetworkError.mockReturnValue(true);

      const error = new Error("Network error") as AxiosError;
      // @ts-ignore - accessing private method for testing
      expect(client["canRetryRequest"](error)).toBe(true);
    });

    test("retries on 5xx errors", () => {
      const error = {
        response: { status: 503 },
      } as AxiosError;

      // @ts-ignore - accessing private method for testing
      expect(client["canRetryRequest"](error)).toBe(true);
    });

    test("retries on rate limit (429)", () => {
      const error = {
        response: { status: 429 },
      } as AxiosError;

      // @ts-ignore - accessing private method for testing
      expect(client["canRetryRequest"](error)).toBe(true);
    });

    test("does not retry on 4xx errors", () => {
      const error = {
        response: { status: 404 },
      } as AxiosError;

      // @ts-ignore - accessing private method for testing
      expect(client["canRetryRequest"](error)).toBe(false);
    });

    test("does not retry when response is missing", () => {
      const error = {} as AxiosError;

      // @ts-ignore - accessing private method for testing
      expect(client["canRetryRequest"](error)).toBe(false);
    });
  });
});
