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

const { createSocketMock } = vi.hoisted(() => ({
  createSocketMock: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onError: vi.fn(),
    channel: vi.fn().mockReturnValue({
      join: vi.fn(),
      leave: vi.fn(),
      push: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }),
  }),
}));

vi.mock("phoenix", () => ({
  Socket: vi.fn(createSocketMock),
}));

type MockSocket = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  isConnected: ReturnType<typeof vi.fn>;
  onOpen: ReturnType<typeof vi.fn>;
  onClose: ReturnType<typeof vi.fn>;
};

// ApiClient registers its connection-stability handlers first (before
// PageVisibilityManager), so calls[0] is always the escalation handler. The new
// socket tests disable PageVisibilityManager anyway to isolate this behavior.
const getOnCloseHandler = (apiClient: ApiClient) => {
  const socket = apiClient.socket as unknown as MockSocket;
  return socket.onClose.mock.calls[0]![0] as (event: {
    wasClean: boolean;
  }) => void;
};

const getOnOpenHandler = (apiClient: ApiClient) => {
  const socket = apiClient.socket as unknown as MockSocket;
  return socket.onOpen.mock.calls[0]![0] as () => void;
};

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // afterEach's restoreAllMocks() strips the Socket mock's implementation, so
    // re-establish it before each test (the ApiClient constructor now calls
    // socket.onOpen/onClose).
    vi.mocked(Socket).mockImplementation(
      createSocketMock as unknown as () => Socket,
    );
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
      // Return a fresh Response per call, like a real fetch — a Response body
      // can only be consumed once, so each retry must get its own.
      const fetchMock = vi
        .fn()
        .mockImplementation(() =>
          createJsonResponse({ error: "Server Error" }, 500),
        );
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

    test("honors the Retry-After header before retrying", async () => {
      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
      });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Rate limited" }), {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "2",
            },
          }),
        )
        .mockResolvedValue(createJsonResponse({ success: true }));
      setFetchMock(apiClient, fetchMock);

      // Capture the backoff durations instead of skipping them.
      const delays: number[] = [];
      (apiClient as unknown as Record<string, unknown>).delay = vi.fn(
        (ms: number) => {
          delays.push(ms);
          return Promise.resolve();
        },
      );

      const response = await apiClient.makeRequest({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe("ok");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      // Retry-After: 2 seconds -> wait at least 2000ms before retrying.
      expect(delays[0]).toBeGreaterThanOrEqual(2000);
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
        expect(delay).toBeLessThanOrEqual(600_000);
      }

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("reconnectAfterMs escalates as connections keep failing", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      vi.mocked(Socket).mockClear();

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
        disconnectOnPageHidden: false,
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      const reconnectAfterMs = socketOpts.reconnectAfterMs as (
        tries: number,
      ) => number;
      const onClose = getOnCloseHandler(apiClient);

      // Before any failures, the delay for the first attempt stays within the
      // original ~1s window.
      const initialMax = Math.max(
        ...Array.from({ length: 200 }, () => reconnectAfterMs(1)),
      );
      expect(initialMax).toBeLessThanOrEqual(1000);

      // Simulate a run of connections that never open and close uncleanly, as
      // happens when every upgrade is rejected (e.g. a rotated API key).
      for (let i = 0; i < 20; i++) {
        onClose({ wasClean: false });
      }

      // Even for Phoenix's "first" attempt, the escalation counter now pushes
      // the ceiling well past the original 30s cap, up to the 10-minute cap.
      const escalatedMax = Math.max(
        ...Array.from({ length: 200 }, () => reconnectAfterMs(1)),
      );
      expect(escalatedMax).toBeGreaterThan(30_000);
      expect(escalatedMax).toBeLessThanOrEqual(600_000);

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("a connection that stays up long enough resets the escalation", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      const nowSpy = vi.spyOn(Date, "now").mockReturnValue(0);
      vi.mocked(Socket).mockClear();

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
        disconnectOnPageHidden: false,
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      const reconnectAfterMs = socketOpts.reconnectAfterMs as (
        tries: number,
      ) => number;
      const onOpen = getOnOpenHandler(apiClient);
      const onClose = getOnCloseHandler(apiClient);

      for (let i = 0; i < 20; i++) {
        onClose({ wasClean: false });
      }

      // A connection opens and stays up beyond the stability threshold.
      nowSpy.mockReturnValue(1_000);
      onOpen();
      nowSpy.mockReturnValue(1_000 + 30_000);
      onClose({ wasClean: false });

      // Escalation is reset, so the first attempt is back in the ~1s window.
      const resetMax = Math.max(
        ...Array.from({ length: 200 }, () => reconnectAfterMs(1)),
      );
      expect(resetMax).toBeLessThanOrEqual(1000);

      nowSpy.mockRestore();
      (global as GlobalWithWindow).window = originalWindow;
    });

    test("clean closes do not escalate the reconnect backoff", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      vi.mocked(Socket).mockClear();

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: "user_token_456",
        disconnectOnPageHidden: false,
      });

      const socketOpts = vi.mocked(Socket).mock.calls[0]![1] as Record<
        string,
        unknown
      >;
      const reconnectAfterMs = socketOpts.reconnectAfterMs as (
        tries: number,
      ) => number;
      const onClose = getOnCloseHandler(apiClient);

      // Intentional (clean) closes — our own disconnect or a graceful server
      // close — must not push the backoff up.
      for (let i = 0; i < 20; i++) {
        onClose({ wasClean: true });
      }

      const max = Math.max(
        ...Array.from({ length: 200 }, () => reconnectAfterMs(1)),
      );
      expect(max).toBeLessThanOrEqual(1000);

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

    test("teardown disconnects the socket even when it is not connected", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      (global as GlobalWithWindow).window = {};

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const socket = apiClient.socket as unknown as MockSocket;
      socket.isConnected.mockReturnValue(false);

      apiClient.teardown();

      // A socket mid-reconnect must still be disconnected so its pending retry
      // timer is cancelled and it doesn't keep looping after the client is torn
      // down.
      expect(socket.disconnect).toHaveBeenCalledOnce();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("reconnects a single time when connectivity returns via the online event", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      (global as GlobalWithWindow).window = {
        addEventListener,
        removeEventListener,
      };

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const onlineHandler = addEventListener.mock.calls.find(
        (call) => call[0] === "online",
      )![1] as () => void;

      const socket = apiClient.socket as unknown as MockSocket;
      socket.isConnected.mockReturnValue(false);

      // Before any connection attempt, the online event is a no-op: we never
      // force a connection the consumer didn't ask for.
      onlineHandler();
      expect(socket.disconnect).not.toHaveBeenCalled();

      // Simulate a prior failed attempt so the socket counts as "active".
      getOnCloseHandler(apiClient)({ wasClean: false });

      onlineHandler();
      expect(socket.disconnect).toHaveBeenCalledOnce();

      // The disconnect callback triggers a single fresh connect.
      const disconnectCallback = socket.disconnect.mock.calls[0]![0] as
        | (() => void)
        | undefined;
      disconnectCallback?.();
      expect(socket.connect).toHaveBeenCalledOnce();

      // Teardown unregisters the listener.
      apiClient.teardown();
      expect(removeEventListener).toHaveBeenCalledWith("online", onlineHandler);

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("does not revive a cleanly (deliberately) disconnected socket on the online event", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      const addEventListener = vi.fn();
      (global as GlobalWithWindow).window = {
        addEventListener,
        removeEventListener: vi.fn(),
      };

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const onlineHandler = addEventListener.mock.calls.find(
        (call) => call[0] === "online",
      )![1] as () => void;

      const socket = apiClient.socket as unknown as MockSocket;
      socket.isConnected.mockReturnValue(false);

      // A clean close is a deliberate disconnect (or graceful server close); the
      // online event must not resurrect a connection the app chose to stop.
      getOnCloseHandler(apiClient)({ wasClean: true });

      onlineHandler();
      expect(socket.disconnect).not.toHaveBeenCalled();
      expect(socket.connect).not.toHaveBeenCalled();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("online event is a no-op when there is no socket", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      const addEventListener = vi.fn();
      (global as GlobalWithWindow).window = {
        addEventListener,
        removeEventListener: vi.fn(),
      };

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const onlineHandler = addEventListener.mock.calls.find(
        (call) => call[0] === "online",
      )![1] as () => void;

      const socket = apiClient.socket as unknown as MockSocket;
      // Simulate a torn-down / missing socket.
      (apiClient as unknown as { socket: undefined }).socket = undefined;

      expect(() => onlineHandler()).not.toThrow();
      expect(socket.disconnect).not.toHaveBeenCalled();
      expect(socket.connect).not.toHaveBeenCalled();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("online event does not reconnect an already-connected socket", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      const addEventListener = vi.fn();
      (global as GlobalWithWindow).window = {
        addEventListener,
        removeEventListener: vi.fn(),
      };

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const onlineHandler = addEventListener.mock.calls.find(
        (call) => call[0] === "online",
      )![1] as () => void;

      const socket = apiClient.socket as unknown as MockSocket;
      socket.isConnected.mockReturnValue(true);
      // Awaiting a reconnect, but already connected — nothing to do.
      getOnCloseHandler(apiClient)({ wasClean: false });

      onlineHandler();
      expect(socket.disconnect).not.toHaveBeenCalled();

      (global as GlobalWithWindow).window = originalWindow;
    });

    test("online event does not reconnect while the page is hidden", () => {
      const originalWindow = (global as GlobalWithWindow).window;
      const originalDocument = (global as GlobalWithWindow).document;
      const addEventListener = vi.fn();
      (global as GlobalWithWindow).window = {
        addEventListener,
        removeEventListener: vi.fn(),
      };
      // A hidden page: PageVisibilityManager owns the reconnect lifecycle here.
      (global as GlobalWithWindow).document = { hidden: true };

      const apiClient = new ApiClient({
        host: "https://api.knock.app",
        apiKey: "pk_test_12345",
        userToken: undefined,
        disconnectOnPageHidden: false,
      });

      const onlineHandler = addEventListener.mock.calls.find(
        (call) => call[0] === "online",
      )![1] as () => void;

      const socket = apiClient.socket as unknown as MockSocket;
      socket.isConnected.mockReturnValue(false);
      getOnCloseHandler(apiClient)({ wasClean: false });

      onlineHandler();
      expect(socket.disconnect).not.toHaveBeenCalled();

      (global as GlobalWithWindow).window = originalWindow;
      (global as GlobalWithWindow).document = originalDocument;
    });
  });
});
