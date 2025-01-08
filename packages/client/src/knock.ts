import { jwtDecode } from "jwt-decode";

import ApiClient from "./api";
import FeedClient from "./clients/feed";
import MessageClient from "./clients/messages";
import MsTeamsClient from "./clients/ms-teams";
import ObjectClient from "./clients/objects";
import Preferences from "./clients/preferences";
import SlackClient from "./clients/slack";
import UserClient from "./clients/users";
import {
  AuthenticateOptions,
  KnockOptions,
  LogLevel,
  UserTokenExpiringCallback,
} from "./interfaces";

const DEFAULT_HOST = "https://api.knock.app";

class Knock {
  public host: string;
  private apiClient: ApiClient | null = null;
  public userId: string | undefined;
  public userToken?: string;
  public logLevel?: LogLevel;
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;
  readonly feeds = new FeedClient(this);
  readonly objects = new ObjectClient(this);
  readonly preferences = new Preferences(this);
  readonly slack = new SlackClient(this);
  readonly msTeams = new MsTeamsClient(this);
  readonly user = new UserClient(this);
  readonly messages = new MessageClient(this);

  constructor(
    readonly apiKey: string,
    options: KnockOptions = {},
  ) {
    this.host = options.host || DEFAULT_HOST;
    this.logLevel = options.logLevel;

    this.log("Initialized Knock instance");

    // Fail loudly if we're using the wrong API key
    if (this.apiKey && this.apiKey.startsWith("sk_")) {
      throw new Error(
        "[Knock] You are using your secret API key on the client. Please use the public key.",
      );
    }
  }

  client() {
    // Initiate a new API client if we don't have one yet
    if (!this.apiClient) {
      this.apiClient = this.createApiClient();
    }

    return this.apiClient;
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
    let reinitializeApi = false;
    const currentApiClient = this.apiClient;

    // If we've previously been initialized and the values have now changed, then we
    // need to reinitialize any stateful connections we have
    if (
      currentApiClient &&
      (this.userId !== userId || this.userToken !== userToken)
    ) {
      this.log("userId or userToken changed; reinitializing connections");
      this.feeds.teardownInstances();
      this.teardown();
      reinitializeApi = true;
    }

    this.userId = userId;
    this.userToken = userToken;

    this.log(`Authenticated with userId ${userId}`);

    if (this.userToken && options?.onUserTokenExpiring instanceof Function) {
      this.maybeScheduleUserTokenExpiration(
        options.onUserTokenExpiring,
        options.timeBeforeExpirationInMs,
      );
    }

    // If we get the signal to reinitialize the api client, then we want to create a new client
    // and the reinitialize any existing feed real-time connections we have so everything continues
    // to work with the new credentials we've been given
    if (reinitializeApi) {
      this.apiClient = this.createApiClient();
      this.feeds.reinitializeInstances();
      this.log("Reinitialized real-time connections");
    }

    return;
  }

  /*
    Returns whether or this Knock instance is authenticated. Passing `true` will check the presence
    of the userToken as well.
  */
  isAuthenticated(checkUserToken = false) {
    return checkUserToken ? !!(this.userId && this.userToken) : !!this.userId;
  }

  // Used to teardown any connected instances
  teardown() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    if (this.apiClient?.socket && this.apiClient.socket.isConnected()) {
      this.apiClient.socket.disconnect();
    }
  }

  log(message: string) {
    if (this.logLevel === "debug") {
      console.log(`[Knock] ${message}`);
    }
  }

  /**
   * Initiates an API client
   */
  private createApiClient() {
    return new ApiClient({
      apiKey: this.apiKey,
      host: this.host,
      userToken: this.userToken,
    });
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

        // Reauthenticate which will handle reinitializing sockets
        if (typeof newToken === "string") {
          this.authenticate(this.userId!, newToken, {
            onUserTokenExpiring: callbackFn,
            timeBeforeExpirationInMs: timeBeforeExpirationInMs,
          });
        }
      }, msInFuture);
    }
  }
}

export default Knock;
