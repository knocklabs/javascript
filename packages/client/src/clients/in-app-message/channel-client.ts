import Knock from "../../knock";

import { InAppStore, createStore } from "./store";

/**
 * Manages the configuration for an in app channel.
 * Stores all fetched messages to support optimistic updates.
 */
export class InAppChannelClient {
  public store: InAppStore;

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
  ) {
    this.store = createStore();
  }
}
