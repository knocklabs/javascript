import { GenericData, PageInfo } from "@knocklabs/types";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";

import { InAppChannelClient } from "./channel-client";
import {
  FetchInAppMessagesOptions,
  InAppMessage,
  InAppMessageClientOptions,
  InAppMessageResponse,
  InAppMessagesQueryInfo,
} from "./types";

/**
 * Manages realtime connection to in app messages service.
 */
export class InAppMessageClient {
  private knock: Knock;

  public queryKey: string;

  constructor(
    readonly channelClient: InAppChannelClient,
    readonly messageType: string,
    readonly defaultOptions: InAppMessageClientOptions = {},
  ) {
    this.knock = channelClient.knock;
    this.queryKey = this.buildQueryKey(defaultOptions);
  }

  async fetch(options: FetchInAppMessagesOptions = {}): Promise<
    | {
        data: {
          items?: InAppMessage[];
          pageInfo?: PageInfo;
        };
        status: "ok";
      }
    | {
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

    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.knock.userId}/in-app-messages/${this.channelClient.channelId}/${this.messageType}`,
      params: queryParams,
    });
    // TODO: Maybe map to camel case props?

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
      items: result.body.entries,
      pageInfo: result.body.page_info,
    };

    const queryInfo: InAppMessagesQueryInfo = {
      loading: false,
      networkStatus: NetworkStatus.ready,
      data: response,
    };

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
