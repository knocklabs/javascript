import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";

import { InAppChannelClient } from "./channel-client";
import {
  FetchInAppMessagesOptions,
  InAppMessageClientOptions,
  InAppMessagesQueryInfo,
} from "./types";

/**
 * Manages realtime connection to in app messages service.
 */
export class InAppMessageClient {
  private knock: Knock;

  constructor(
    readonly channelClient: InAppChannelClient,
    readonly messageType: string,
    readonly defaultOptions: InAppMessageClientOptions = {},
  ) {
    this.knock = channelClient.knock;
  }

  async fetch(options: FetchInAppMessagesOptions = {}) {
    // TODO: Create better abstraction for reading from / writing to store
    const { networkStatus } = this.channelClient.store.state;

    // If there's an existing request in flight, then do nothing
    if (isRequestInFlight(networkStatus)) {
      return;
    }

    // Set the loading type based on the request type it is
    this.channelClient.store.setState((state) => ({
      ...state,
      networkStatus: options.__loadingType ?? NetworkStatus.loading,
    }));

    const queryParams = {
      ...this.defaultOptions,
      ...options,
      // Unset options that should not be sent to the API
      __loadingType: undefined,
      __fetchSource: undefined,
    };

    const queryKey = `${this.messageType}-${JSON.stringify(queryParams)}`;

    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.knock.userId}/in-app-messages/${this.channelClient.channelId}/${this.messageType}`,
      params: queryParams,
    });

    if (result.statusCode === "error" || !result.body) {
      this.channelClient.store.setState((state) => ({
        ...state,
        networkStatus: NetworkStatus.error,
      }));

      return {
        status: result.statusCode,
        data: result.error || result.body,
      };
    }

    const response: InAppMessagesQueryInfo = {
      items: result.body.entries,
      pageInfo: result.body.page_info,
    };

    // TODO: Update queries state page info based on before/after like in feed.ts
    this.channelClient.store.setState((state) => {
      return {
        ...state,
        // Store new messages in shared store
        messages: response.items.reduce((messages, message) => {
          messages[message.id] = message;
          return messages;
        }, state.messages),
        // Store query results
        queries: {
          ...state.queries,
          [queryKey]: response,
        },
      };
    });

    return { data: response, status: result.statusCode };
  }
}
