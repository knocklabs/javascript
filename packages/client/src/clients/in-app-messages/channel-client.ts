import Knock from "../../knock";

import { InAppStore, createStore } from "./store";
import { InAppMessagesQueryInfo } from "./types";

/**
 * Manages the configuration for an in app channel.
 * Stores all fetched messages to support optimistic updates.
 */
export class InAppChannelClient {
  public store: InAppStore;

  // TODO: Allow passing in default options here which will get passed to message client (also update provider)

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
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
