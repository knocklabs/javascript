import { Socket } from "phoenix";

import { exponentialBackoffFullJitter } from "./helpers";
import { PageVisibilityManager } from "./pageVisibility";

// Ceiling for socket reconnect backoff. This is intentionally much larger than
// the channel rejoin cap: a client that can never reconnect (e.g. a rotated
// API key that now returns 403 on every upgrade) should settle into a slow
// retry cadence rather than hammering the API indefinitely.
const SOCKET_RECONNECT_MAX_DELAY_MS = 600_000;

// A connection that stays open at least this long is treated as healthy, which
// resets the reconnect backoff escalation so a later transient drop reconnects
// quickly.
const STABLE_CONNECTION_THRESHOLD_MS = 30_000;

// Upper bound for the escalation counter. Past this the reconnect delay is
// already pinned to SOCKET_RECONNECT_MAX_DELAY_MS, so there's no need to keep
// counting.
const MAX_UNSTABLE_CONNECTION_COUNT = 15;

type ApiClientOptions = {
  host: string;
  apiKey: string;
  userToken: string | undefined;
  branch?: string;
  /** Automatically disconnect the socket when the page is hidden and reconnect when visible. Defaults to `true`. */
  disconnectOnPageHidden?: boolean;
};

export type ApiResponse = {
  // eslint-disable-next-line
  error?: any;
  // eslint-disable-next-line
  body?: any;
  statusCode: "ok" | "error";
  status: number;
};

export type ApiRequestConfig = {
  method?: string;
  url?: string;
  params?: unknown;
  data?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type FetchClient = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type ErrorWithResponse = Error & {
  response?: {
    status: number;
    data?: unknown;
  };
};

class ApiRequestError extends Error {
  response: {
    status: number;
    data?: unknown;
  };

  constructor(response: Response, data: unknown) {
    super(`Request failed with status code ${response.status}`);
    this.name = "ApiRequestError";
    this.response = {
      status: response.status,
      data,
    };
  }
}

class ApiClient {
  private host: string;
  private apiKey: string;
  private userToken: string | null;
  private branch: string | null;
  private fetchClient: FetchClient;
  private defaultHeaders: Record<string, string>;

  public socket: Socket | undefined;
  private pageVisibility: PageVisibilityManager | undefined;

  // Count of consecutive connection attempts that failed or dropped before
  // stabilizing. Drives reconnect backoff escalation and, unlike Phoenix's own
  // attempt counter, is not reset each time a short-lived connection opens.
  private unstableConnectionCount = 0;

  // Timestamp (ms) of the current connection's open, or null when not open.
  private socketOpenedAt: number | null = null;

  // Whether the socket wants to reconnect but isn't connected — i.e. it dropped
  // uncleanly or a connection attempt failed, as opposed to being cleanly and
  // deliberately disconnected or never started. Gates the `online` handler so
  // it only shortcuts the backoff and never revives a socket the app chose to
  // close.
  private awaitingReconnect = false;

  constructor(options: ApiClientOptions) {
    this.host = options.host;
    this.apiKey = options.apiKey;
    this.userToken = options.userToken || null;
    this.branch = options.branch || null;

    this.fetchClient = this.getFetchClient();
    this.defaultHeaders = this.compactHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-Knock-User-Token": this.userToken,
      "X-Knock-Client": this.getKnockClientHeader(),
      "X-Knock-Branch": this.branch,
    });

    if (typeof window !== "undefined") {
      this.socket = new Socket(`${this.host.replace("http", "ws")}/ws/v1`, {
        params: {
          user_token: this.userToken,
          api_key: this.apiKey,
          branch_slug: this.branch,
        },
        reconnectAfterMs: (tries: number) => {
          // Escalate using whichever is larger: Phoenix's own attempt counter
          // (which it resets on every successful open) or our count of
          // consecutive unstable connections (which survives brief opens). The
          // latter keeps the delay growing through "accept then immediately
          // drop" cycles that would otherwise reset Phoenix's counter each time.
          return exponentialBackoffFullJitter(
            Math.max(tries, this.unstableConnectionCount),
            {
              baseDelayMs: 1000,
              maxDelayMs: SOCKET_RECONNECT_MAX_DELAY_MS,
            },
          );
        },
        rejoinAfterMs: (tries: number) => {
          return exponentialBackoffFullJitter(tries, {
            baseDelayMs: 1000,
            maxDelayMs: 60_000,
          });
        },
      });

      this.trackConnectionStability(this.socket);

      // Recover promptly when connectivity returns instead of waiting out a
      // potentially long reconnect backoff window.
      if (typeof window.addEventListener === "function") {
        window.addEventListener("online", this.handleOnline);
      }

      if (options.disconnectOnPageHidden !== false) {
        this.pageVisibility = new PageVisibilityManager(this.socket);
      }
    }
  }

  // Observes socket open/close events to drive reconnect backoff escalation.
  // The escalation is what turns a permanent failure (e.g. a rejected upgrade
  // after a key rotation) from a tight retry loop into a slow one.
  private trackConnectionStability(socket: Socket) {
    socket.onOpen(() => {
      this.awaitingReconnect = false;
      this.socketOpenedAt = Date.now();
    });

    socket.onClose((event) => {
      const openedAt = this.socketOpenedAt;
      this.socketOpenedAt = null;

      // An unclean close means Phoenix will keep trying to reconnect; a clean
      // close (our own disconnect() or a graceful server close) means it won't,
      // so the `online` handler shouldn't revive it.
      this.awaitingReconnect = !event?.wasClean;

      const stayedConnected =
        openedAt !== null &&
        Date.now() - openedAt >= STABLE_CONNECTION_THRESHOLD_MS;

      if (stayedConnected) {
        // A connection that stayed up long enough is considered healthy, so
        // allow fast reconnects again after a transient drop.
        this.unstableConnectionCount = 0;
      } else if (!event?.wasClean) {
        // A rejected upgrade (never opened) or a connection dropped shortly
        // after opening keeps escalating the backoff. Clean closes — our own
        // disconnect() or a graceful server close — are intentional, won't be
        // retried by Phoenix, and so don't count.
        this.unstableConnectionCount = Math.min(
          this.unstableConnectionCount + 1,
          MAX_UNSTABLE_CONNECTION_COUNT,
        );
      }
    });
  }

  private handleOnline = () => {
    const socket = this.socket;
    if (!socket) {
      return;
    }

    // Only shortcut the backoff for a socket that is actually trying to
    // reconnect. A cleanly/deliberately disconnected socket — or one that was
    // never started — is left alone so we don't revive realtime the app chose
    // to stop. When the page is hidden, PageVisibilityManager owns the
    // connection lifecycle, so leave it be.
    if (!this.awaitingReconnect || socket.isConnected()) {
      return;
    }

    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    // Cancel any pending backoff and make a single immediate attempt. If it
    // fails, the escalated schedule resumes (unstableConnectionCount persists).
    socket.disconnect(() => socket.connect());
  };

  async makeRequest(req: ApiRequestConfig): Promise<ApiResponse> {
    try {
      const result = await this.requestWithRetries(req);
      const body = await this.parseResponseBody(result);

      return {
        statusCode: result.ok ? "ok" : "error",
        body,
        error: result.ok ? undefined : new ApiRequestError(result, body),
        status: result.status,
      };
    } catch (e: unknown) {
      console.error(e);
      const response = (e as ErrorWithResponse)?.response;

      return {
        statusCode: "error",
        status: response?.status ?? 500,
        body: response?.data,
        error: e,
      };
    }
  }

  private async requestWithRetries(req: ApiRequestConfig) {
    let lastError: unknown;

    // Sequential retry loop: each attempt awaits in order and returns early on
    // success or a non-retryable error, so it doesn't reduce to an array method.
    for (let attempt = 0; attempt <= 3; attempt++) {
      let retryAfterMs = 0;

      try {
        const response = await this.fetchClient(
          this.buildUrl(req.url, req.params),
          this.buildRequestInit(req),
        );

        if (!response.ok && this.canRetryRequest({ response })) {
          retryAfterMs = this.getRetryAfterMs(response);
          // This response is discarded before the next attempt, so read its
          // body directly (no clone) to drain it and release the connection.
          lastError = new ApiRequestError(
            response,
            await this.parseResponseBody(response),
          );
        } else {
          return response;
        }
      } catch (error) {
        lastError = error;

        if (!this.canRetryRequest(error)) {
          throw error;
        }
      }

      if (attempt < 3) {
        await this.delay(this.getRetryDelay(attempt + 1, retryAfterMs));
      }
    }

    throw lastError;
  }

  private buildRequestInit(req: ApiRequestConfig): RequestInit {
    return {
      method: req.method,
      headers: {
        ...this.defaultHeaders,
        ...this.compactHeaders(req.headers),
      },
      body: req.data === undefined ? undefined : JSON.stringify(req.data),
      signal: req.signal,
    };
  }

  private buildUrl(path = "", params?: ApiRequestConfig["params"]) {
    const url = new URL(path, this.host);

    if (params) {
      if (params instanceof URLSearchParams) {
        params.forEach((value, key) => {
          url.searchParams.append(key, value);
        });
      } else if (typeof params === "object") {
        Object.entries(params).forEach(([key, value]) => {
          this.appendSearchParam(url.searchParams, key, value);
        });
      }
    }

    return url.toString();
  }

  private appendSearchParam(
    searchParams: URLSearchParams,
    key: string,
    value: unknown,
  ) {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        this.appendSearchParam(searchParams, `${key}[]`, item);
      });
      return;
    }

    if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        this.appendSearchParam(
          searchParams,
          `${key}[${nestedKey}]`,
          nestedValue,
        );
      });
      return;
    }

    searchParams.append(key, String(value));
  }

  private async parseResponseBody(response: Response) {
    if (response.status === 204) {
      return undefined;
    }

    const text = await response.text();

    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRetryDelay(retryCount: number, retryAfterMs = 0) {
    const backoff = Math.min(100 * 2 ** retryCount, 30_000);
    const delay = Math.max(backoff, retryAfterMs);
    // Add up to 20% jitter so retries from many clients don't synchronize.
    return delay + delay * 0.2 * Math.random();
  }

  private getRetryAfterMs(response: Response) {
    const header = response.headers.get("retry-after");
    if (!header) {
      return 0;
    }

    // `Retry-After` is either a number of seconds or an HTTP date.
    const seconds = Number(header);
    if (!Number.isNaN(seconds)) {
      return Math.max(0, seconds * 1000);
    }

    const dateMs = new Date(header).valueOf();
    if (Number.isNaN(dateMs)) {
      return 0;
    }

    return Math.max(0, dateMs - Date.now());
  }

  private getFetchClient(): FetchClient {
    if (typeof globalThis.fetch === "function") {
      return globalThis.fetch.bind(globalThis);
    }

    return () =>
      Promise.reject(
        new Error(
          "Fetch is not available in this environment. Please provide a native fetch implementation.",
        ),
      );
  }

  teardown() {
    this.pageVisibility?.teardown();

    if (
      typeof window !== "undefined" &&
      typeof window.removeEventListener === "function"
    ) {
      window.removeEventListener("online", this.handleOnline);
    }

    // Always disconnect, even when not currently connected: a socket that is
    // mid-reconnect still holds a pending retry timer, and disconnect() is the
    // only thing that cancels it. Otherwise a reauth that replaces this client
    // would leak a socket that retries forever with stale credentials.
    this.socket?.disconnect();
  }

  private canRetryRequest(error: unknown) {
    if (this.isFetchNetworkError(error)) {
      return true;
    }

    const response = (error as ErrorWithResponse)?.response;

    if (!response) {
      // Cannot determine if the request can be retried
      return false;
    }

    // Retry Server Errors (5xx).
    if (response.status >= 500 && response.status <= 599) {
      return true;
    }

    // Retry if rate limited.
    if (response.status === 429) {
      return true;
    }

    return false;
  }

  private isFetchNetworkError(error: unknown) {
    if (error instanceof TypeError) {
      return true;
    }

    if (
      typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "NetworkError"
    ) {
      return true;
    }

    return false;
  }

  private compactHeaders(headers?: Record<string, unknown> | HeadersInit) {
    const output: Record<string, string> = {};

    if (!headers) {
      return output;
    }

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        output[key] = value;
      });
      return output;
    }

    if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        output[key] = value;
      });
      return output;
    }

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        output[key] = String(value);
      }
    });

    return output;
  }

  private getKnockClientHeader() {
    // Note: we're following format used in our Stainless SDKs:
    // https://github.com/knocklabs/knock-node/blob/main/src/client.ts#L335
    // If we add the env var to turbo.json, it caches it so the version
    // never actually updates.
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    return `Knock/ClientJS ${process.env.CLIENT_PACKAGE_VERSION}`;
  }
}

export default ApiClient;
