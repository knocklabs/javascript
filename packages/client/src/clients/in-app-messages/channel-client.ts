import Knock from "../../knock";
import { NetworkStatus } from "../../networkStatus";

import { InAppMessagesClient } from "./message-client";
import { InAppMessageSocketDriver } from "./socket-driver";
import { InAppMessagesStore, createStore } from "./store";
import {
  InAppMessage,
  InAppMessagesClientOptions,
  InAppMessagesQueryInfo,
  InAppMessagesResponse,
} from "./types";

/**
 * Manages the configuration for an in app channel.
 * Stores all fetched messages to support optimistic updates.
 */
export class InAppMessagesChannelClient {
  public store: InAppMessagesStore;

  private socketDriver: InAppMessageSocketDriver | undefined;

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
    readonly defaultOptions: InAppMessagesClientOptions = {},
  ) {
    this.store = createStore();

    // Initialize a socket driver for the in-app channel client, which there
    // should be one per in-app channel client but it's abstracted out as a
    // separate module for the organization/encapsulation purposes.
    const { socket } = this.knock.client();
    if (socket) {
      this.socketDriver = new InAppMessageSocketDriver(socket);
    }

    this.knock.log(`[IAM] Initialized a client on channel ${channelId}`);
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

  setQueryResponse(queryKey: string, response: InAppMessagesResponse) {
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

  /*
   * Socket
   */

  subscribe(client: InAppMessagesClient) {
    if (!this.socketDriver) return;

    // Pass the unsub func back to iam client so it can be used when
    // unsubscribing.
    return this.socketDriver.join(client);
  }

  unsubscribe(client: InAppMessagesClient) {
    if (!this.socketDriver) return;

    this.socketDriver.leave(client);
  }
}
