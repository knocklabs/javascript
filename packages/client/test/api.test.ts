import { Socket } from "phoenix";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import packageJson from "../package.json";
import ApiClient from "../src/api";

const TEST_BRANCH_SLUG = "lorem-ipsum-dolor-branch";

type GlobalWithWindow = Record<string, unknown>;

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getDefaultHeaders = (apiClient: ApiClient) =>
  (apiClient as unknown as Record<string, unknown>).defaultHeaders as Record<
    string,
    string
  >;

const setFetchMock = (
  apiClient: ApiClient,
  fetchMock: ReturnType<typeof vi.fn>,
) => {
  (apiClient as unknown as Record<string, unknown>).fetchClient = fetchMock;
};

const skipRetryDelays = (apiClient: ApiClient) => {
  (apiClient as unknown as Record<string, unknown>).delay = vi
    .fn()
    .mockResolvedValue(undefined);
};

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

describe("API Client", () => {
  beforeEach(() => {
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
        branch: TEST_BRANCH_SLUG,
      });

      expect(apiClient).toBeInstanceOf(ApiClient);
    });

    test("handles user token in configuration", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
      });

      expect(getDefaultHeaders(apiClient)["X-Knock-User-Token"]).toBe(
        "user_token_456",
      );
    });

    test("initializes WebSocket in browser environment", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {} as Window;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeDefined();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("skips WebSocket in server environment", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = undefined;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeUndefined();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("creates PageVisibilityManager by default in browser environment", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {} as Window;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(
        (apiClient as unknown as Record<string, unknown>)["pageVisibility"],
      ).toBeDefined();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("skips PageVisibilityManager when disconnectOnPageHidden is false", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {} as Window;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      expect(
        (apiClient as unknown as Record<string, unknown>)["pageVisibility"],
      ).toBeUndefined();

      (global as GlobalWithWindow).window = originalWindow;
    });
  });

  describe("Request Handling", () => {
    test("makes successful API requests with fetch", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi.fn().mockResolvedValue(
        createJsonResponse({
          data: "test response",
        }),
      );
      setFetchMock(apiClient, fetchMock);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(response.body.data).toBe("test response");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.knock.app/test",
        expect.objectContaining({ method: "GET" }),
      );
    });

    test("serializes request parameters with axios-compatible brackets", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValue(createJsonResponse({ ok: true }));
      setFetchMock(apiClient, fetchMock);

      await apiClient.makeRequest({
        method: "GET",
        url: "/test",
        params: {
          filter: "active",
          workflow_categories: ["billing", "security"],
          nested: { enabled: true },
          ignored: undefined,
        },
      });

      const requestUrl = new URL(fetchMock.mock.calls[0]![0] as string);
      expect(requestUrl.searchParams.get("filter")).toBe("active");
      expect(requestUrl.searchParams.getAll("workflow_categories[]")).toEqual([
        "billing",
        "security",
      ]);
      expect(requestUrl.searchParams.get("nested[enabled]")).toBe("true");
      expect(requestUrl.searchParams.has("ignored")).toBe(false);
    });

    test("sends POST requests with JSON data", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValue(createJsonResponse({ created: true }));
      setFetchMock(apiClient, fetchMock);

      const testData = { name: "Test", value: 42 };
      const response = await apiClient.makeRequest({
        method: "POST",
        url: "/test",
        data: testData,
      });

      expect(response.statusCode).toBe("ok");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.knock.app/test",
        expect.objectContaining({
          body: JSON.stringify(testData),
        }),
      );
    });

    test("parses empty and text responses", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 204 }))
        .mockResolvedValueOnce(new Response("accepted", { status: 202 }));
      setFetchMock(apiClient, fetchMock);

      await expect(
        apiClient.makeRequest({ url: "/empty" }),
      ).resolves.toMatchObject({
        body: undefined,
        status: 204,
        statusCode: "ok",
      });
      await expect(
        apiClient.makeRequest({ url: "/text" }),
      ).resolves.toMatchObject({
        body: "accepted",
        status: 202,
        statusCode: "ok",
      });
    });
  });

  describe("Error Handling", () => {
    test("returns a helpful error when fetch is unavailable", async () => {
      const originalFetch = globalThis.fetch;
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: undefined,
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        const apiClient = new ApiClient({
          host: "https://api.knock.app",
          apiKey: "pk_test_12345",
          userToken: undefined,
        });

        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        expect(response.statusCode).toBe("error");
        expect(response.error).toBeInstanceOf(Error);
        expect(response.error.message).toBe(
          "Fetch is not available in this environment. Please provide a native fetch implementation.",
        );
      } finally {
        Object.defineProperty(globalThis, "fetch", {
          configurable: true,
          value: originalFetch,
        });
        consoleSpy.mockRestore();
      }
    });

    test("handles network errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        const networkError = new TypeError("Failed to fetch");
        const apiClient = new ApiClient({
          host: "https://api.knock.app",
          apiKey: "pk_test_12345",
          userToken: undefined,
        });
        setFetchMock(apiClient, vi.fn().mockRejectedValue(networkError));
        skipRetryDelays(apiClient);

        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        expect(response.statusCode).toBe("error");
        expect(response.status).toBe(500);
        expect(response.error).toBe(networkError);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("handles API error responses with response metadata", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      setFetchMock(
        apiClient,
        vi
          .fn()
          .mockResolvedValue(createJsonResponse({ error: "Not found" }, 404)),
      );

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("error");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Not found" });
      expect(response.error.response.status).toBe(404);
      expect(response.error.response.data).toEqual({ error: "Not found" });
    });
  });

  describe("Retry and Resilience", () => {
    test("retries on network errors", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValue(createJsonResponse({ success: true }));
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("does not retry aborted requests", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const abortError = new DOMException(
        "The operation was aborted.",
        "AbortError",
      );
      const fetchMock = vi.fn().mockRejectedValue(abortError);
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        expect(response.statusCode).toBe("error");
        expect(response.error).toBe(abortError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("retries on 5xx server errors", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({ error: "Server Error" }, 500),
        )
        .mockResolvedValue(createJsonResponse({ success: true }));
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("returns the final retryable response after retries are exhausted", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValue(createJsonResponse({ error: "Server Error" }, 500));
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        const response = await apiClient.makeRequest({
          method: "GET",
          url: "/test",
        });

        expect(response.statusCode).toBe("error");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Server Error" });
        expect(response.error.response.status).toBe(500);
        expect(fetchMock).toHaveBeenCalledTimes(4);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    test("retries on rate limit errors (429)", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({ error: "Rate limited" }, 429),
        )
        .mockResolvedValue(createJsonResponse({ success: true }));
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("does not retry on client errors (4xx except 429)", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          createJsonResponse({ error: "Resource not found" }, 404),
        );
      setFetchMock(apiClient, fetchMock);
      skipRetryDelays(apiClient);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("error");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Request Configuration", () => {
    test("sets correct x-knock-client header", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(getDefaultHeaders(apiClient)["X-Knock-Client"]).toBe(
        `Knock/ClientJS ${packageJson.version}`,
      );
    });

    test("sets correct x-knock-branch header", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        branch: TEST_BRANCH_SLUG,
      });

      expect(getDefaultHeaders(apiClient)["X-Knock-Branch"]).toBe(
        TEST_BRANCH_SLUG,
      );
    });

    test("omits optional headers when values are not configured", () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(
        getDefaultHeaders(apiClient)["X-Knock-User-Token"],
      ).toBeUndefined();
      expect(getDefaultHeaders(apiClient)["X-Knock-Branch"]).toBeUndefined();
    });

    test("supports various HTTP methods", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi.fn((_, init?: RequestInit) =>
        Promise.resolve(createJsonResponse({ method: init?.method })),
      );
      setFetchMock(apiClient, fetchMock);

      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        const response = await apiClient.makeRequest({
          method,
          url: "/test",
        });

        expect(response.statusCode).toBe("ok");
        expect(response.body.method).toBe(method);
      }
    });
  });

  describe("Socket Connection Management", () => {
    test("provides socket interface in browser environment", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeDefined();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("configures socket with reconnectAfterMs and rejoinAfterMs", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      vi.mocked(Socket).mockClear();

      new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      expect(typeof socketOpts.reconnectAfterMs).toBe("function");
      expect(typeof socketOpts.rejoinAfterMs).toBe("function");

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("reconnectAfterMs returns values within expected bounds", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      vi.mocked(Socket).mockClear();

      new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      const reconnectAfterMs = socketOpts.reconnectAfterMs as (
        tries: number,
      ) => number;

      for (let i = 0; i < 50; i++) {
        const delay = reconnectAfterMs(1);
        expect(delay).toBeGreaterThanOrEqual(250);
        expect(delay).toBeLessThanOrEqual(1000);
      }

      for (let i = 0; i < 50; i++) {
        const delay = reconnectAfterMs(100);
        expect(delay).toBeGreaterThanOrEqual(250);
        expect(delay).toBeLessThanOrEqual(30_000);
      }

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("rejoinAfterMs returns values within expected bounds", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      vi.mocked(Socket).mockClear();

      new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      const rejoinAfterMs = socketOpts.rejoinAfterMs as (
        tries: number,
      ) => number;

      for (let i = 0; i < 50; i++) {
        const delay = rejoinAfterMs(1);
        expect(delay).toBeGreaterThanOrEqual(250);
        expect(delay).toBeLessThanOrEqual(1000);
      }

      for (let i = 0; i < 50; i++) {
        const delay = rejoinAfterMs(100);
        expect(delay).toBeGreaterThanOrEqual(250);
        expect(delay).toBeLessThanOrEqual(60_000);
      }

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("gracefully handles missing WebSocket in server environment", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = undefined;

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });

      expect(apiClient.socket).toBeUndefined();

      (global as GlobalWithWindow).window = originalWindow;
    });
  });
});
