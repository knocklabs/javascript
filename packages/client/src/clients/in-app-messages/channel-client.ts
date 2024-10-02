import Knock from "../../knock";

import { InAppStore, createStore } from "./store";
import { InAppMessagesClientOptions, InAppMessagesQueryInfo } from "./types";

/**
 * Manages the configuration for an in app channel.
 * Stores all fetched messages to support optimistic updates.
 */
export class InAppChannelClient {
  public store: InAppStore;

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
    readonly defaultOptions: InAppMessagesClientOptions = {},
  ) {
    this.store = createStore();
  }

  setQueryState(queryKey: string, queryInfo: InAppMessagesQueryInfo) {
    this.store.setState((state) => ({
      ...state,
      queries: {
        ...state.queries,
        [queryKey]: queryInfo,
      },
    }));
  }
}
