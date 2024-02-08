import { jwtDecode } from "jwt-decode";

import ApiClient from "./api";
import FeedClient from "./clients/feed";
import Preferences from "./clients/preferences";
import UserClient from "./clients/users";
import {
  AuthenticateOptions,
  KnockOptions,
  UserTokenExpiringCallback,
} from "./interfaces";

const DEFAULT_HOST = "https://api.knock.app";

class Knock {
  private host: string;
  private apiClient: ApiClient | null = null;
  public userId: string | undefined;
  public userToken: string | undefined;
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;

  readonly feeds = new FeedClient(this);
  readonly preferences = new Preferences(this);
  readonly user = new UserClient(this);

  constructor(
    readonly apiKey: string,
    options: KnockOptions = {},
  ) {
    this.host = options.host || DEFAULT_HOST;

    // Fail loudly if we're using the wrong API key
    if (this.apiKey && this.apiKey.startsWith("sk_")) {
      throw new Error(
        "[Knock] You are using your secret API key on the client. Please use the public key.",
      );
    }
  }

  client() {
    if (!this.userId) {
      console.warn(
        `[Knock] You must call authenticate(userId, userToken) first before trying to make a request.
        Typically you'll see this message when you're creating a feed instance before having called
        authenticate with a user Id and token. That means we won't know who to issue the request
        to Knock on behalf of.
        `,
      );
    }

    // Initiate a new API client if we don't have one yet
    if (!this.apiClient) {
      this.apiClient = new ApiClient({
        apiKey: this.apiKey,
        host: this.host,
        userToken: this.userToken,
      });
    }

    return this.apiClient;
  }

  /**
   * Initiates an API client
   */
  createApiClient() {
    this.apiClient = new ApiClient({
      apiKey: this.apiKey,
      host: this.host,
      userToken: this.userToken,
    });
  }

  /*
    Authenticates the current user. In non-sandbox environments
    the userToken must be specified.
  */
  authenticate(
    userId: string,
    userToken?: string,
    options?: AuthenticateOptions,
  ) {
    this.userId = userId;
    this.userToken = userToken;

    if (this.userToken && options?.onUserTokenExpiring instanceof Function) {
      this.maybeScheduleUserTokenExpiration(
        options.onUserTokenExpiring,
        options.timeBeforeExpirationInMs,
      );
    }

    return;
  }

  /*
    Returns whether or this Knock instance is authenticated. Passing `true` will check the presence
    of the userToken as well.
  */
  isAuthenticated(checkUserToken = false) {
    return checkUserToken ? this.userId && this.userToken : this.userId;
  }

  // Used to teardown any connected instances
  teardown() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    if (!this.apiClient) return;
    if (this.apiClient.socket) {
      this.apiClient.socket.disconnect();
    }
  }

  private async maybeScheduleUserTokenExpiration(
    callbackFn: UserTokenExpiringCallback,
    timeBeforeExpirationInMs: number = 30_000,
  ) {
    if (!this.userToken) return;

    const decoded = jwtDecode(this.userToken);
    const expiresAtMs = (decoded.exp ?? 0) * 1000;
    const nowMs = Date.now();

    // Expiration is in the future
    if (expiresAtMs && expiresAtMs > nowMs) {
      // Check how long until the token should be regenerated
      // | ----------------- | ----------------------- |
      // ^ now               ^ expiration offset       ^ expires at
      const msInFuture = expiresAtMs - timeBeforeExpirationInMs - nowMs;

      this.tokenExpirationTimer = setTimeout(async () => {
        const newToken = await callbackFn(this.userToken as string, decoded);
        this.userToken = newToken;

        // Resync socket connection
        this.createApiClient();

        this.maybeScheduleUserTokenExpiration(
          callbackFn,
          timeBeforeExpirationInMs,
        );
      }, msInFuture);
    }
  }
}

export default Knock;
