import Knock from "../../knock";

import Feed, { feedClientDefaults, fetchFeed } from "./feed";
import {
  FeedClientOptions,
  FeedResponse,
  FetchFeedOptions,
} from "./interfaces";
import { FeedSocketManager } from "./socket-manager";
import { mergeDateRangeParams } from "./utils";

class FeedClient {
  private instance: Knock;
  private feedInstances: Feed[] = [];
  private socketManager: FeedSocketManager | undefined;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  initialize(feedChannelId: string, options: FeedClientOptions = {}) {
    this.initSocketManager();

    const feedInstance = new Feed(
      this.instance,
      feedChannelId,
      options,
      this.socketManager,
    );
    this.feedInstances.push(feedInstance);
    return feedInstance;
  }

  /**
   * Fetches a user's feed once and returns the response, without creating a
   * feed instance, opening a socket, or touching any store. Intended for
   * server-side prefetching: pair the returned `FeedResponse` (or its promise)
   * with the `initialData` feed option to render the feed on first paint.
   *
   * Sends the same request as `Feed.fetch`, so the prefetched data matches what
   * the client would otherwise fetch on mount. Throws if the Knock instance is
   * not authenticated.
   */
  async prefetch(
    feedChannelId: string,
    options: FetchFeedOptions = {},
  ): Promise<FeedResponse> {
    this.instance.failIfNotAuthenticated();

    const defaultOptions: FeedClientOptions = {
      ...feedClientDefaults,
      ...mergeDateRangeParams(options),
    };

    return fetchFeed(this.instance, feedChannelId, defaultOptions, {});
  }

  removeInstance(feed: Feed) {
    this.feedInstances = this.feedInstances.filter((f) => f !== feed);
  }

  teardownInstances() {
    for (const feed of this.feedInstances) {
      feed.teardown();
    }
  }

  reinitializeInstances() {
    for (const feed of this.feedInstances) {
      this.socketManager?.leave(feed);
    }

    // The API client has a new socket once it's reinitialized,
    // so we need to set up a new socket manager
    this.socketManager = undefined;
    this.initSocketManager();

    for (const feed of this.feedInstances) {
      feed.reinitialize(this.socketManager);
    }
  }

  private initSocketManager() {
    const socket = this.instance.client().socket;
    if (socket && !this.socketManager) {
      this.socketManager = new FeedSocketManager(socket);
    }
  }
}

export { Feed };
export default FeedClient;
