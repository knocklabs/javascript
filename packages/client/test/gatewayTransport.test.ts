import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import type ApiClient from "../src/api";
import {
  GatewayConnectResult,
  SOCKET_STATES,
  TransportConstructor,
  WebSocketLike,
  createGatewayTransport,
  fetchSocketConnectUrl,
} from "../src/gatewayTransport";

class MockTransport implements WebSocketLike {
  static instance: MockTransport | null = null;

  // GatewayTransport should only construct a single instance of the base transport, so use a static
  // integer to keep track of how many times MockTransport's constructor was called
  static constructionCount = 0;

  readyState: number = SOCKET_STATES.connecting;
  bufferedAmount = 0;
  binaryType: BinaryType = "blob";

  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send = vi.fn<WebSocketLike["send"]>();

  close = vi.fn<WebSocketLike["close"]>((code, reason) => {
    this.readyState = SOCKET_STATES.closed;
    this.onclose?.({
      code: code ?? 1000,
      reason: reason ?? "",
      wasClean: true,
    } as CloseEvent);
  });

  constructor(
    public url: string,
    public protocols?: string | string[],
  ) {
    MockTransport.constructionCount++;
    if (MockTransport.instance) {
      assert.fail("MockTransport: constructed more than once");
    }
    MockTransport.instance = this;
  }

  open() {
    this.readyState = SOCKET_STATES.open;
    this.onopen?.({} as Event);
  }

  serverClose(code: number, wasClean: boolean) {
    this.readyState = SOCKET_STATES.closed;
    this.onclose?.({ code, reason: "", wasClean } as CloseEvent);
  }
}

// GatewayTransport's start function is called inside a setTimeout within the constructor. This
// function advances timers so that start is invoked.
const flushStart = () => vi.advanceTimersByTimeAsync(0);

const PHOENIX_URL =
  "wss://api.knock.app/ws/v1/websocket?user_token=ut&api_key=pk&branch_slug=null&vsn=2.0.0";
const SIGNED_URL = "wss://ws1.knock-dev.app/ws/v1/websocket?auth_token=jwt";
const MERGED_URL = `${SIGNED_URL}&user_token=ut&api_key=pk&branch_slug=null&vsn=2.0.0`;
const PROTOCOLS = ["soap", "wamp"];

describe("fetchSocketConnectUrl", () => {
  const makeRequest = vi.fn();
  const apiClient = { makeRequest } as unknown as ApiClient;
  const abortController = new AbortController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns valid signed URL and expiration", async () => {
    const expiresAt = "2024-01-01T00:00:00.000Z";

    makeRequest.mockResolvedValueOnce({
      statusCode: "ok",
      status: 200,
      body: { url: SIGNED_URL, expires_at: expiresAt },
    });

    const result = await fetchSocketConnectUrl(
      apiClient,
      abortController.signal,
    );

    expect(makeRequest).toHaveBeenCalledWith({
      method: "POST",
      url: "/v1/sockets/connect",
      signal: abortController.signal,
    });
    expect(result).toEqual({
      signedUrl: SIGNED_URL,
      expiresAt: Date.parse(expiresAt),
    });
  });

  test("throws an error when the request fails", async () => {
    const error = new Error("network down");

    makeRequest.mockResolvedValueOnce({
      statusCode: "error",
      status: 0,
      error,
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toBe(error);
  });

  test("throws an error when response status is not ok", async () => {
    makeRequest.mockResolvedValueOnce({
      statusCode: "error",
      status: 500,
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toThrow("Socket connect request failed with status 500");
  });

  test("throws an error when expiration is not a string", async () => {
    makeRequest.mockResolvedValueOnce({
      statusCode: "ok",
      status: 200,
      body: { url: SIGNED_URL, expires_at: 12345 },
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toThrow("Invalid socket connect response");
  });

  test("throws an error when expiration is not a valid date", async () => {
    makeRequest.mockResolvedValueOnce({
      statusCode: "ok",
      status: 200,
      body: { url: SIGNED_URL, expires_at: "not-a-date" },
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toThrow("Invalid socket connect response");
  });

  test("throws an error when URL is missing from response", async () => {
    makeRequest.mockResolvedValueOnce({
      statusCode: "ok",
      status: 200,
      body: { expires_at: "2024-01-01T00:00:00.000Z" },
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toThrow("Invalid socket connect response");
  });

  test("throws an error when URL is not a string", async () => {
    makeRequest.mockResolvedValueOnce({
      statusCode: "ok",
      status: 200,
      body: { url: 12345, expires_at: "2024-01-01T00:00:00.000Z" },
    });

    await expect(
      fetchSocketConnectUrl(apiClient, abortController.signal),
    ).rejects.toThrow("Invalid socket connect response");
  });
});

describe("createGatewayTransport", () => {
  const fetchConnectUrl = vi.fn<
    (signal: AbortSignal) => Promise<GatewayConnectResult>
  >(async () => ({
    signedUrl: SIGNED_URL,
    expiresAt: Date.now() + 60_000,
  }));
  const onConnectUrlInvalid = vi.fn<() => void>();
  let GatewayTransport: TransportConstructor;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    MockTransport.instance = null;
    MockTransport.constructionCount = 0;

    GatewayTransport = createGatewayTransport(MockTransport, {
      fetchConnectUrl,
      onConnectUrlInvalid,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("fetches the connect URL, then constructs the base transport with merged URL and protocols", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);

    expect(fetchConnectUrl).not.toHaveBeenCalled();
    expect(MockTransport.constructionCount).toBe(0);
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.connecting);
    expect(gatewayTransport.bufferedAmount).toBe(0);

    await flushStart();

    expect(fetchConnectUrl).toHaveBeenCalledWith(expect.any(AbortSignal));
    const inner = getMockTransportInstance();
    expect(inner.url).toBe(MERGED_URL);
    expect(inner.protocols).toBe(PROTOCOLS);
    expect(gatewayTransport.readyState).toBe(inner.readyState);
    expect(gatewayTransport.bufferedAmount).toBe(0);
  });

  test("applies a binaryType assigned after construction to the inner transport", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);

    expect(gatewayTransport.binaryType).toBe("blob");
    expect(MockTransport.constructionCount).toBe(0);

    gatewayTransport.binaryType = "arraybuffer";

    await flushStart();

    expect(getMockTransportInstance().binaryType).toBe("arraybuffer");
  });

  test("forwards events from the inner transport and delegates readyState/bufferedAmount", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    const onopen = vi.fn();
    const onmessage = vi.fn();
    const onerror = vi.fn();
    const onclose = vi.fn();
    gatewayTransport.onopen = onopen;
    gatewayTransport.onmessage = onmessage;
    gatewayTransport.onerror = onerror;
    gatewayTransport.onclose = onclose;

    inner.open();
    expect(onopen).toHaveBeenCalledTimes(1);

    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.open);

    const messageEvent = { data: "x" } as MessageEvent;
    inner.onmessage?.(messageEvent);
    expect(onmessage).toHaveBeenCalledWith(messageEvent);

    const error = new Error("boom");
    inner.onerror?.(error as unknown as Event);
    expect(onerror).toHaveBeenCalledWith(error);

    const bufferedAmount = 128;
    inner.bufferedAmount = bufferedAmount;
    expect(gatewayTransport.bufferedAmount).toBe(bufferedAmount);

    const closeEvent = { code: 1000, reason: "", wasClean: true } as CloseEvent;
    inner.onclose?.(closeEvent);
    expect(onclose).toHaveBeenCalledWith(closeEvent);
  });

  test("send throws before the inner transport exists and delegates once connected", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);

    expect(() => gatewayTransport.send("hi")).toThrow(
      "GatewayTransport: cannot send before the connection is open",
    );

    await flushStart();

    const inner = getMockTransportInstance();
    gatewayTransport.send("hi");

    expect(inner.send).toHaveBeenCalledWith("hi");
  });

  test("close() while the fetch is pending aborts it and emits a single clean close", async () => {
    fetchConnectUrl.mockImplementationOnce(
      () =>
        new Promise<GatewayConnectResult>((resolve) => {
          setTimeout(
            () =>
              resolve({
                signedUrl: SIGNED_URL,
                expiresAt: Date.now() + 60_000,
              }),
            1000,
          );
        }),
    );

    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();

    const onclose = vi.fn();
    gatewayTransport.onclose = onclose;

    gatewayTransport.close();

    const capturedSignal = fetchConnectUrl.mock.lastCall?.[0];

    expect(capturedSignal?.aborted).toBe(true);
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);
    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 1000, reason: "", wasClean: true }),
    );

    // Advance test timer so that fetchConnectUrl resolves
    await vi.advanceTimersByTimeAsync(1000);

    // No inner transport was instantiated, as the fetch never completed
    expect(MockTransport.constructionCount).toBe(0);
    expect(onclose).toHaveBeenCalledTimes(1);

    // Closing the gateway transport manually does not trigger another onclose event
    gatewayTransport.close();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test("close() while the fetch is pending ignores a rejection caused by the abort", async () => {
    fetchConnectUrl.mockImplementationOnce(
      (signal) =>
        new Promise<GatewayConnectResult>((_resolve, reject) => {
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    const onerror = vi.fn();
    const onclose = vi.fn();
    gatewayTransport.onerror = onerror;
    gatewayTransport.onclose = onclose;

    await flushStart();

    gatewayTransport.close();

    // Run timers to trigger the rejection
    await vi.runAllTimersAsync();

    expect(onerror).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 1000, reason: "", wasClean: true }),
    );
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);

    // No inner transport was instantiated, as the fetch was aborted
    expect(MockTransport.constructionCount).toBe(0);
  });

  test("close() called immediately after construction emits a clean close without fetching", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);

    const onclose = vi.fn();
    gatewayTransport.onclose = onclose;

    gatewayTransport.close();

    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);
    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 1000, reason: "", wasClean: true }),
    );

    await flushStart();

    expect(fetchConnectUrl).not.toHaveBeenCalled();

    // No inner transport was instantiated, as the fetch never occurred
    expect(MockTransport.constructionCount).toBe(0);
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test("close(code, reason) after connecting delegates the same arguments to the inner transport", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();
    inner.open();

    gatewayTransport.close(1000, "bye");

    expect(inner.close).toHaveBeenCalledWith(1000, "bye");
  });

  test("close() called again before the inner transport's close event fires is a no-op", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();
    inner.open();

    const onclose = vi.fn();
    gatewayTransport.onclose = onclose;

    // Like a native WebSocket, emit the close event asynchronously after close() is called
    inner.close.mockImplementation((code, reason) => {
      inner.readyState = SOCKET_STATES.closing;
      setTimeout(() => {
        inner.readyState = SOCKET_STATES.closed;
        inner.onclose?.({
          code: code ?? 1000,
          reason: reason ?? "",
          wasClean: true,
        } as CloseEvent);
      }, 0);
    });

    gatewayTransport.close(1000, "bye");
    gatewayTransport.close(1000, "bye again");

    expect(inner.close).toHaveBeenCalledExactlyOnceWith(1000, "bye");
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closing);
    expect(onclose).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 1000, reason: "bye", wasClean: true }),
    );
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);
  });

  test("fetchConnectUrl rejecting fails the connection without creating an inner transport", async () => {
    const error = new Error("network down");
    fetchConnectUrl.mockRejectedValueOnce(error);

    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    const onerror = vi.fn();
    const onclose = vi.fn();
    gatewayTransport.onerror = onerror;
    gatewayTransport.onclose = onclose;

    await flushStart();

    expect(onerror).toHaveBeenCalledWith(error);
    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: 1006,
        reason: "gateway_connect_failed",
        wasClean: false,
      }),
    );
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);

    // No inner transport was instantiated, as the fetch failed
    expect(MockTransport.constructionCount).toBe(0);

    // Closing the failed gateway transport does not trigger another onclose event
    gatewayTransport.close();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test("close() called from onerror during a failed fetch emits a single clean close", async () => {
    const error = new Error("network down");
    fetchConnectUrl.mockRejectedValueOnce(error);

    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    const onerror = vi.fn(() => gatewayTransport.close());
    const onclose = vi.fn();
    gatewayTransport.onerror = onerror;
    gatewayTransport.onclose = onclose;

    await flushStart();

    expect(onerror).toHaveBeenCalledWith(error);

    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 1000, reason: "", wasClean: true }),
    );
    expect(gatewayTransport.readyState).toBe(SOCKET_STATES.closed);

    // No inner transport was instantiated, as the fetch failed
    expect(MockTransport.constructionCount).toBe(0);
  });

  test("connection fails when the base transport cannot be instantiated", async () => {
    const error = new Error("Failed to instantiate base transport");
    class ThrowingTransport {
      constructor() {
        throw error;
      }
    }
    const ThrowingGatewayTransport = createGatewayTransport(
      ThrowingTransport as unknown as TransportConstructor,
      { fetchConnectUrl, onConnectUrlInvalid },
    );

    const transport = new ThrowingGatewayTransport(PHOENIX_URL, PROTOCOLS);
    const onerror = vi.fn();
    const onclose = vi.fn();
    transport.onerror = onerror;
    transport.onclose = onclose;

    await flushStart();

    expect(onerror).toHaveBeenCalledWith(error);
    expect(onclose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: 1006,
        reason: "gateway_connect_failed",
        wasClean: false,
      }),
    );
    expect(transport.readyState).toBe(SOCKET_STATES.closed);

    // Closing the failed gateway transport does not trigger another onclose event
    transport.close();
    expect(onclose).toHaveBeenCalledTimes(1);

    expect(onConnectUrlInvalid).toHaveBeenCalledTimes(1);
  });

  test("close() after the inner transport has closed on its own is a no-op", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    const onclose = vi.fn();
    gatewayTransport.onclose = onclose;

    inner.open();
    inner.serverClose(1006, false);

    expect(onclose).toHaveBeenCalledTimes(1);

    gatewayTransport.close();

    expect(inner.close).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test("onclose is called with plain object event when CloseEvent is unsupported", () => {
    vi.stubGlobal("CloseEvent", undefined);

    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    const onclose = vi.fn();
    gatewayTransport.onclose = onclose;

    gatewayTransport.close();

    expect(onclose).toHaveBeenCalledTimes(1);
    const event = onclose.mock.calls[0]?.[0];
    expect(Object.getPrototypeOf(event)).toBe(Object.prototype);
    expect(event).toEqual({ code: 1000, reason: "", wasClean: true });
  });

  test("onConnectUrlInvalid fires when the inner transport closes before ever opening", async () => {
    new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    inner.serverClose(1006, false);

    expect(onConnectUrlInvalid).toHaveBeenCalledTimes(1);
  });

  test("onConnectUrlInvalid does not fire once the inner transport has opened", async () => {
    new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    inner.open();
    inner.serverClose(1006, false);

    expect(onConnectUrlInvalid).not.toHaveBeenCalled();
  });

  test("onConnectUrlInvalid does not fire for a close that Phoenix itself requested", async () => {
    const gatewayTransport = new GatewayTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    // Simulate Phoenix closing the socket while the inner transport is still
    // connecting: the inner's own close() fires an unclean close event.
    inner.close.mockImplementation((code, reason) => {
      inner.readyState = SOCKET_STATES.closed;
      inner.onclose?.({
        code: code ?? 1006,
        reason: reason ?? "",
        wasClean: false,
      } as CloseEvent);
    });

    gatewayTransport.close();

    expect(onConnectUrlInvalid).not.toHaveBeenCalled();
  });

  test("omitting onConnectUrlInvalid does not throw when the url is invalid", async () => {
    const NoCallbackTransport = createGatewayTransport(MockTransport, {
      fetchConnectUrl,
    });
    new NoCallbackTransport(PHOENIX_URL, PROTOCOLS);
    await flushStart();
    const inner = getMockTransportInstance();

    expect(() => inner.serverClose(1006, false)).not.toThrow();
  });

  test("the returned class is named GatewayTransport", () => {
    expect(GatewayTransport.name).toBe("GatewayTransport");
  });

  function getMockTransportInstance(): MockTransport {
    expect(MockTransport.constructionCount).toBe(1);
    expect(MockTransport.instance).not.toBeNull();
    return MockTransport.instance!;
  }
});
