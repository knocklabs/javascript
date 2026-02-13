import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { Socket } from "phoenix";

type ApiClientOptions = {
  host: string;
  apiKey: string;
  userToken: string | undefined;
  branch?: string;
};

export interface ApiResponse {
  // eslint-disable-next-line
  error?: any;
  // eslint-disable-next-line
  body?: any;
  statusCode: "ok" | "error";
  status: number;
}

class ApiClient {
  private host: string;
  private apiKey: string;
  private userToken: string | null;
  private branch: string | null;
  private axiosClient: AxiosInstance;

  public socket: Socket | undefined;

  constructor(options: ApiClientOptions) {
    this.host = options.host;
    this.apiKey = options.apiKey;
    this.userToken = options.userToken || null;
    this.branch = options.branch || null;

    // Create a retryable axios client
    this.axiosClient = axios.create({
      baseURL: this.host,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Knock-User-Token": this.userToken,
        "X-Knock-Client": this.getKnockClientHeader(),
        "X-Knock-Branch": this.branch,
      },
    });

    if (typeof window !== "undefined") {
      this.socket = new Socket(`${this.host.replace("http", "ws")}/ws/v1`, {
        params: {
          user_token: this.userToken,
          api_key: this.apiKey,
          branch_slug: this.branch,
        },
        // Use exponential backoff with jitter to try to prevent thundering herd
        // when many clients attempt to reconnect simultaneously after an outage or deployment.
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
    }

    axiosRetry(this.axiosClient, {
      retries: 3,
      retryCondition: this.canRetryRequest,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  async makeRequest(req: AxiosRequestConfig): Promise<ApiResponse> {
    try {
      const result = await this.axiosClient(req);

      return {
        statusCode: result.status < 300 ? "ok" : "error",
        body: result.data,
        error: undefined,
        status: result.status,
      };

      // eslint:disable-next-line
    } catch (e: unknown) {
      console.error(e);

      return {
        statusCode: "error",
        status: 500,
        body: undefined,
        error: e,
      };
    }
  }

  private canRetryRequest(error: AxiosError) {
    // Retry Network Errors.
    if (axiosRetry.isNetworkError(error)) {
      return true;
    }

    if (!error.response) {
      // Cannot determine if the request can be retried
      return false;
    }

    // Retry Server Errors (5xx).
    if (error.response.status >= 500 && error.response.status <= 599) {
      return true;
    }

    // Retry if rate limited.
    if (error.response.status === 429) {
      return true;
    }

    return false;
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

/**
 * Exponential backoff with full jitter and a minimum delay floor.
 *
 * - Uses exponential growth capped at maxDelayMs
 * - Applies full jitter to spread retries uniformly across the window
 * - Enforces a minimum delay to avoid tight retry loops
 *
 * Example (baseDelayMs = 1000):
 *   Try 1:   250ms – 1,000ms
 *   Try 2:   250ms – 2,000ms
 *   Try 3:   250ms – 4,000ms
 *   Try 4:   250ms – 8,000ms
 *   Try 5+:  250ms – maxDelayMs
 */
export function exponentialBackoffFullJitter(
  tries: number,
  {
    baseDelayMs,
    maxDelayMs,
    minDelayMs = 250,
  }: {
    baseDelayMs: number;
    maxDelayMs: number;
    minDelayMs?: number;
  },
): number {
  const exponentialDelay = Math.min(
    maxDelayMs,
    baseDelayMs * Math.pow(2, Math.max(0, tries - 1)),
  );

  if (exponentialDelay <= minDelayMs) {
    return minDelayMs;
  }

  const jitterRange = exponentialDelay - minDelayMs;
  return minDelayMs + Math.floor(Math.random() * jitterRange);
}

export default ApiClient;
