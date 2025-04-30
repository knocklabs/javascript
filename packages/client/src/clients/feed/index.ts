import Knock from "../../knock";

import Feed from "./feed";
import { FeedClientOptions } from "./interfaces";
import { FeedSocketManager } from "./socket-manager";

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
