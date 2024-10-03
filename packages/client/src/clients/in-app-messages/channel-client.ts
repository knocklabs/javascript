import Knock from "../../knock";
import { NetworkStatus } from "../../networkStatus";

import { InAppStore, createStore } from "./store";
import {
  InAppMessage,
  InAppMessageResponse,
  InAppMessagesClientOptions,
  InAppMessagesQueryInfo,
} from "./types";

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

  // ----------------------------------------------
  // Store helpers
  // ----------------------------------------------
  setMessageAttrs(messageIds: string[], attrs: Partial<InAppMessage>) {
    this.store.setState((state) => ({
      ...state,
      messages: {
        ...state.messages,
        ...messageIds.reduce<Record<string, InAppMessage>>((messages, id) => {
          if (state.messages[id]) {
            messages[id] = {
              ...state.messages[id],
              ...attrs,
            };
          }
          return messages;
        }, {}),
      },
    }));
  }

  setQueryResponse(queryKey: string, response: InAppMessageResponse) {
    const queryInfo: InAppMessagesQueryInfo = {
      loading: false,
      networkStatus: NetworkStatus.ready,
      data: {
        messageIds: response.entries.map((iam) => iam.id),
        pageInfo: response.pageInfo,
      },
    };

    this.store.setState((state) => {
      return {
        ...state,
        // Store new messages in store
        messages: response.entries.reduce((messages, message) => {
          messages[message.id] = message;
          return messages;
        }, state.messages),
        // Store query results
        queries: {
          ...state.queries,
          [queryKey]: queryInfo,
        },
      };
    });
  }

  setQueryStatus(
    queryKey: string,
    status: Pick<InAppMessagesQueryInfo, "loading" | "networkStatus">,
  ) {
    this.store.setState((state) => ({
      ...state,
      queries: {
        ...state.queries,
        [queryKey]: {
          ...state.queries[queryKey],
          ...status,
        },
      },
    }));
  }
}
