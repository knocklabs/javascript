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
    const socket = this.instance.client().socket;
    if (socket) {
      this.socketManager = new FeedSocketManager(socket);
    }
  }

  initialize(feedChannelId: string, options: FeedClientOptions = {}) {
    const feedInstance = new Feed(this.instance, feedChannelId, options);
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
      feed.reinitialize();
    }
  }
}

export { Feed };
export default FeedClient;
