import { GenericData, PageInfo } from "@knocklabs/types";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";

import { InAppChannelClient } from "./channel-client";
import {
  FetchInAppMessagesOptions,
  InAppMessage,
  InAppMessageResponse,
  InAppMessagesClientOptions,
  InAppMessagesQueryInfo,
} from "./types";

/**
 * Manages realtime connection to in app messages service.
 */
export class InAppMessagesClient {
  private knock: Knock;

  public queryKey: string;

  constructor(
    readonly channelClient: InAppChannelClient,
    readonly messageType: string,
    readonly defaultOptions: InAppMessagesClientOptions = {},
  ) {
    this.knock = channelClient.knock;
    this.queryKey = this.buildQueryKey(defaultOptions);
  }

  // TODO: Clean up return types
  async fetch(options: FetchInAppMessagesOptions = {}): Promise<
    | {
        data: {
          entries: InAppMessage[];
          pageInfo: PageInfo;
        };
        status: "ok";
      }
    | {
        // TODO: Better type
        data: GenericData;
        status: "error";
      }
    | undefined
  > {
    // TODO: Create better abstraction for reading from / writing to store
    const queryParams = {
      ...this.defaultOptions,
      ...options,
      // Unset options that should not be sent to the API
      __loadingType: undefined,
      __fetchSource: undefined,
    };

    this.queryKey = this.buildQueryKey(queryParams);

    const queryState = this.channelClient.store.state.queries[
      this.queryKey
    ] ?? {
      loading: false,
      networkStatus: NetworkStatus.ready,
    };
    const networkStatus = queryState.networkStatus;

    // If there's an existing request in flight, then do nothing
    if (networkStatus && isRequestInFlight(networkStatus)) {
      return;
    }

    // TODO: Move to method on channel client
    // Set the loading type based on the request type it is
    this.channelClient.store.setState((state) => ({
      ...state,
      queries: {
        ...state.queries,
        [this.queryKey]: {
          ...queryState,
          networkStatus: options.__loadingType ?? NetworkStatus.loading,
          loading: true,
        },
      },
    }));

    // TODO: Move to method on user.getInAppMessages
    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.knock.userId}/in-app-messages/${this.channelClient.channelId}/${this.messageType}`,
      params: queryParams,
    });

    if (result.statusCode === "error" || !result.body) {
      this.channelClient.store.setState((state) => ({
        ...state,
        queries: {
          ...state.queries,
          [this.queryKey]: {
            ...queryState,
            networkStatus: NetworkStatus.error,
            loading: false,
          },
        },
      }));

      return {
        status: result.statusCode,
        data: result.error || result.body,
      };
    }

    const response: InAppMessageResponse = {
      entries: result.body.entries,
      pageInfo: result.body.page_info,
    };

    const queryInfo: InAppMessagesQueryInfo = {
      loading: false,
      networkStatus: NetworkStatus.ready,
      // TODO: Only store message ids on query info
      data: response,
    };

    this.channelClient.store.setState((state) => {
      return {
        ...state,
        // Store new messages in shared store
        messages: response.entries.reduce((messages, message) => {
          messages[message.id] = message;
          return messages;
        }, state.messages),
        // Store query results
        queries: {
          ...state.queries,
          [this.queryKey]: queryInfo,
        },
      };
    });

    return { data: response, status: result.statusCode };
  }

  // ----------------------------------------------
  // Helpers
  // ----------------------------------------------
  private buildQueryKey(params: GenericData) {
    // TODO: Update query key format to match GET request url (w/ query params)
    return `${this.messageType}-${JSON.stringify(params)}`;
  }
}
