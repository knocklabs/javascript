import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { Socket } from "phoenix";

type ApiClientOptions = {
  host: string;
  apiKey: string;
  userToken: string | undefined;
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
  private axiosClient: AxiosInstance;

  public socket: Socket | undefined;

  constructor(options: ApiClientOptions) {
    this.host = options.host;
    this.apiKey = options.apiKey;
    this.userToken = options.userToken || null;

    // Create a retryable axios client, but account for issues where the axios export is not
    // the default in certain bundlers (Webpack).
    //
    // NOTE: This is a temporary fix that exists because of this issue:
    // https://github.com/axios/axios/issues/6591
    const axiosInstance = // @ts-expect-error Fixing the issue described above
      (axios.default ? axios.default : axios) as AxiosStatic;

    this.axiosClient = axiosInstance.create({
      baseURL: this.host,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Knock-User-Token": this.userToken,
      },
    });

    if (typeof window !== "undefined") {
      this.socket = new Socket(`${this.host.replace("http", "ws")}/ws/v1`, {
        params: {
          user_token: this.userToken,
          api_key: this.apiKey,
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
}

export default ApiClient;
