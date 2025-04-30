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

    const feedInstance = new Feed(this.instance, feedChannelId, options);
    this.feedInstances.push(feedInstance);

    if (this.socketManager) {
      feedInstance.subscribeToSocketEvents(this.socketManager);
    }

    return feedInstance;
  }

  removeInstance(feed: Feed) {
    if (this.socketManager) {
      feed.unsubscribeFromSocketEvents(this.socketManager);
    }
    this.feedInstances = this.feedInstances.filter((f) => f !== feed);
  }

  teardownInstances() {
    this.unsubscribeAllFeedsFromSocketEvents();

    for (const feed of this.feedInstances) {
      feed.teardown();
    }
  }

  reinitializeInstances() {
    this.unsubscribeAllFeedsFromSocketEvents();

    // When the API client is reinitialized, a new socket is created,
    // so we need to set up a new FeedSocketManager
    this.socketManager = undefined;
    this.initSocketManager();

    for (const feed of this.feedInstances) {
      feed.reinitialize();

      if (this.socketManager) {
        feed.subscribeToSocketEvents(this.socketManager);
      }
    }
  }

  private initSocketManager() {
    const socket = this.instance.client().socket;
    if (socket && !this.socketManager) {
      this.socketManager = new FeedSocketManager(socket);
    }
  }

  private unsubscribeAllFeedsFromSocketEvents() {
    if (!this.socketManager) {
      return;
    }

    for (const feed of this.feedInstances) {
      feed.unsubscribeFromSocketEvents(this.socketManager);
    }
  }
}

export { Feed };
export default FeedClient;
