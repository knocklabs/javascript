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
  UserId,
  UserIdOrUserWithProperties,
  UserTokenExpiringCallback,
} from "./interfaces";

const DEFAULT_HOST = "https://api.knock.app";

class Knock {
  public host: string;
  private apiClient: ApiClient | null = null;
  public userId: string | undefined | null;
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

  /**
   * @deprecated Passing `userId` as a `string` is deprecated and will be removed in a future version.
   * Please pass a `user` object instead containing an `id` value.
   * example:
   * ```ts
   * knock.authenticate({ id: "user_123" });
   * ```
   */
  authenticate(
    userIdOrUserWithProperties: UserId,
    userToken?: Knock["userToken"],
    options?: AuthenticateOptions,
  ): never;
  authenticate(
    userIdOrUserWithProperties: UserIdOrUserWithProperties,
    userToken?: Knock["userToken"],
    options?: AuthenticateOptions,
  ): void;
  authenticate(
    userIdOrUserWithProperties: UserIdOrUserWithProperties,
    userToken?: Knock["userToken"],
    options?: AuthenticateOptions,
  ) {
    let reinitializeApi = false;
    const currentApiClient = this.apiClient;
    const userId = this.getUserId(userIdOrUserWithProperties);
    const identificationStrategy = options?.identificationStrategy || "inline";

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

    // We explicitly skip the inline identification if the strategy is set to "skip"
    if (identificationStrategy === "skip") {
      this.log("Skipping inline user identification");
      return;
    }

    // Inline identify the user if we've been given an object with an id
    // and the strategy is set to "inline".
    if (
      identificationStrategy === "inline" &&
      typeof userIdOrUserWithProperties === "object" &&
      userIdOrUserWithProperties?.id
    ) {
      this.log(`Identifying user ${userIdOrUserWithProperties.id} inline`);
      const { id, ...properties } = userIdOrUserWithProperties;
      this.user.identify(properties);
    }

    return;
  }

  failIfNotAuthenticated() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated. Please call `authenticate` first.");
    }
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

  log(message: string, force = false) {
    if (this.logLevel === "debug" || force) {
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

  /**
   * Returns the user id from the given userIdOrUserWithProperties
   * @param userIdOrUserWithProperties - The user id or user object
   * @returns The user id
   * @throws {Error} If the user object does not contain an `id` property
   */
  private getUserId(userIdOrUserWithProperties: UserIdOrUserWithProperties) {
    if (
      typeof userIdOrUserWithProperties === "string" ||
      !userIdOrUserWithProperties
    ) {
      return userIdOrUserWithProperties;
    }

    if (userIdOrUserWithProperties?.id) {
      return userIdOrUserWithProperties.id;
    }

    throw new Error("`user` object must contain an `id` property");
  }
}

export default Knock;
