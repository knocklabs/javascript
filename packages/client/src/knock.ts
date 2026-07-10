import { Store } from "@tanstack/store";

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
  KnockAuthState,
  KnockAuthStatus,
  KnockOptions,
  LogLevel,
  UserId,
  UserIdOrUserWithProperties,
  UserTokenExpiringCallback,
} from "./interfaces";
import { jwtDecode } from "./jwt";

const DEFAULT_HOST = "https://api.knock.app";

class Knock {
  public host: string;
  private apiClient: ApiClient | null = null;
  public userId: string | undefined | null;
  public userToken?: string;
  public logLevel?: LogLevel;
  public readonly branch?: string;
  private readonly disconnectOnPageHidden?: boolean;
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;
  readonly feeds = new FeedClient(this);
  readonly objects = new ObjectClient(this);
  readonly preferences = new Preferences(this);
  readonly slack = new SlackClient(this);
  readonly msTeams = new MsTeamsClient(this);
  readonly user = new UserClient(this);
  readonly messages = new MessageClient(this);

  /**
   * A subscribable store describing whether this instance is currently
   * authenticated. Fired on `authenticate()` and `logout()`. Subsystems (feed,
   * guides, Slack/Teams status, push registration) and React hooks can
   * subscribe to react to auth transitions without polling `isAuthenticated()`.
   */
  readonly authStore = new Store<KnockAuthState>({
    status: "unauthenticated",
    userId: undefined,
    userToken: undefined,
  });

  constructor(
    readonly apiKey: string,
    options: KnockOptions = {},
  ) {
    this.host = options.host || DEFAULT_HOST;
    this.logLevel = options.logLevel;
    this.branch = options.branch || undefined;
    this.disconnectOnPageHidden = options.disconnectOnPageHidden;

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
    const credentialsChanged =
      this.userId !== userId || this.userToken !== userToken;

    // If the credentials have changed and we have stateful connections to
    // rewire, then we need to reinitialize them. This covers both an in-place
    // user/token switch (live API client) and re-authenticating after a
    // `logout()` cleared the API client but left feed instances in place.
    if (credentialsChanged && (currentApiClient || this.feeds.hasInstances())) {
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

    // Notify subscribers of the (possibly changed) auth state. Done before the
    // inline identify below so subscribers observe the new credentials
    // regardless of identification strategy.
    this.syncAuthState();

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
      this.user.identify(properties).catch((err) => {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        this.log(
          `Error identifying user ${userIdOrUserWithProperties.id} inline:\n${errorMessage}`,
        );
      });
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

  /** The current authentication status of this instance. */
  get authStatus(): KnockAuthStatus {
    return this.authStore.state.status;
  }

  /**
   * Clears the current authentication and tears down all stateful connections
   * (real-time feed channels, the socket, the token-expiration timer, and the
   * page-visibility listener).
   *
   * After `logout()` the instance stays idle (no requests, no websocket) until
   * `authenticate()` is called again. The API client is dropped so a fresh one
   * is built on next use, rather than holding an open socket and document
   * listener while logged out.
   */
  logout() {
    this.log("Logging out and tearing down connections");

    // Leave any joined feed channels before we drop the socket.
    this.feeds.teardownInstances();

    // Disconnect the socket, clear the token-expiration timer, and remove the
    // page-visibility listener.
    this.teardown();

    // Clear credentials.
    this.userId = undefined;
    this.userToken = undefined;

    // Drop the API client so a fresh one (with no socket/listener) is lazily
    // constructed only if and when the instance is used again. Feed instances
    // are left in place and get rewired by a subsequent `authenticate()`.
    this.apiClient = null;

    // Notify subscribers that we are now unauthenticated.
    this.syncAuthState();
  }

  // Used to teardown any connected instances
  teardown() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      // Clear the reference so an in-flight refresh callback can detect that it
      // was torn down and skip re-authenticating (see maybeScheduleUserTokenExpiration).
      this.tokenExpirationTimer = null;
    }
    this.apiClient?.teardown();
  }

  /**
   * Recomputes the auth status from the current credentials and pushes it into
   * the subscribable auth store (no-op if nothing changed).
   */
  private syncAuthState() {
    const status: KnockAuthStatus = this.isAuthenticated()
      ? "authenticated"
      : "unauthenticated";

    this.authStore.setState((prev) => {
      if (
        prev.status === status &&
        prev.userId === this.userId &&
        prev.userToken === this.userToken
      ) {
        return prev;
      }

      return { status, userId: this.userId, userToken: this.userToken };
    });
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
      branch: this.branch,
      disconnectOnPageHidden: this.disconnectOnPageHidden,
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

      const timerId = setTimeout(async () => {
        const newToken = await callbackFn(this.userToken as string, decoded);

        // If we were torn down (logout/unmount) or re-authenticated while the
        // callback was awaiting, the timer reference will have changed (or been
        // cleared). Bail so we don't resurrect a logged-out instance by
        // re-authenticating and re-opening connections.
        if (this.tokenExpirationTimer !== timerId) {
          return;
        }

        // Reauthenticate which will handle reinitializing sockets
        if (typeof newToken === "string") {
          this.authenticate(this.userId!, newToken, {
            onUserTokenExpiring: callbackFn,
            timeBeforeExpirationInMs: timeBeforeExpirationInMs,
          });
        }
      }, msInFuture);
      this.tokenExpirationTimer = timerId;
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

    return undefined;
  }
}

export default Knock;
