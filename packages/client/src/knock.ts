import ApiClient from "./api";
import FeedClient from "./clients/feed";
import Preferences from "./clients/preferences";
import UserClient from "./clients/users";
import { KnockOptions } from "./interfaces";

const DEFAULT_HOST = "https://api.knock.app";

class Knock {
  private host: string;
  private apiClient: ApiClient | null = null;
  public userId: string | undefined;
  public userToken: string | undefined;

  readonly feeds = new FeedClient(this);
  readonly preferences = new Preferences(this);
  readonly user = new UserClient(this);

  constructor(readonly apiKey: string, options: KnockOptions = {}) {
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

  /*
    Authenticates the current user. In non-sandbox environments
    the userToken must be specified.
  */
  authenticate(userId: string, userToken?: string) {
    this.userId = userId;
    this.userToken = userToken;

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
    if (!this.apiClient) return;
    if (this.apiClient.socket) {
      this.apiClient.socket.disconnect();
    }
  }
}

export default Knock;
