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
    const socket = this.instance.client().socket;
    if (socket && !this.socketManager) {
      this.socketManager = new FeedSocketManager(socket);
    }

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
    for (const feed of this.feedInstances) {
      feed.teardown();
    }
  }

  reinitializeInstances() {
    for (const feed of this.feedInstances) {
      feed.reinitialize();
    }
  }
}

export { Feed };
export default FeedClient;
