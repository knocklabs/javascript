import { Socket } from "phoenix";

import { exponentialBackoffFullJitter } from "./helpers";
import { PageVisibilityManager } from "./pageVisibility";

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
          return exponentialBackoffFullJitter(tries, {
            baseDelayMs: 1000,
            maxDelayMs: 30_000,
          });
        },
        rejoinAfterMs: (tries: number) => {
          return exponentialBackoffFullJitter(tries, {
            baseDelayMs: 1000,
            maxDelayMs: 60_000,
          });
        },
      });

      if (options.disconnectOnPageHidden !== false) {
        this.pageVisibility = new PageVisibilityManager(this.socket);
      }
    }
  }

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
      try {
        const response = await this.fetchClient(
          this.buildUrl(req.url, req.params),
          this.buildRequestInit(req),
        );

        if (!response.ok && this.canRetryRequest({ response })) {
          lastError = new ApiRequestError(
            response,
            await this.parseResponseBody(response.clone()),
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
        await this.delay(this.getRetryDelay(attempt + 1));
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

  private getRetryDelay(retryCount: number) {
    return Math.min(100 * 2 ** retryCount, 30_000);
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

    if (this.socket?.isConnected()) {
      this.socket.disconnect();
    }
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
