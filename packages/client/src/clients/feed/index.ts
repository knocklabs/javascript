import Knock from "../../knock";
import Feed from "./feed";
import { FeedClientOptions } from "./interfaces";

class FeedClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  initialize(feedChannelId: string, options: FeedClientOptions = {}) {
    return new Feed(this.instance, feedChannelId, options);
  }
}

export { Feed };
export default FeedClient;
