import { GenericData } from "@knocklabs/types";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";

import { InAppChannelClient } from "./channel-client";
import {
  FetchInAppMessagesOptions,
  InAppMessage,
  InAppMessageResponse,
  InAppMessageStoreState,
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
    this.defaultOptions = {
      ...channelClient.defaultOptions,
      ...defaultOptions,
    };
    this.knock = channelClient.knock;
    this.queryKey = this.buildQueryKey(defaultOptions);
  }

  async fetch<
    TContent extends GenericData = GenericData,
    TData extends GenericData = GenericData,
  >(
    options: FetchInAppMessagesOptions = {},
  ): Promise<
    | {
        status: "ok";
        data: InAppMessageResponse<TContent, TData>;
      }
    | {
        status: "error";
        error: Error;
      }
    | undefined
  > {
    const params = {
      ...this.defaultOptions,
      ...options,
      // Unset options that should not be sent to the API
      __loadingType: undefined,
      __fetchSource: undefined,
    };

    this.queryKey = this.buildQueryKey(params);

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
    this.channelClient.setQueryState(this.queryKey, {
      ...queryState,
      networkStatus: options.__loadingType ?? NetworkStatus.loading,
      loading: true,
    });

    try {
      const response = await this.knock.user.getInAppMessages<TContent, TData>({
        channelId: this.channelClient.channelId,
        messageType: this.messageType,
        params,
      });

      const queryInfo: InAppMessagesQueryInfo = {
        loading: false,
        networkStatus: NetworkStatus.ready,
        data: {
          messageIds: response.entries.map((iam) => iam.id),
          pageInfo: response.pageInfo,
        },
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

      return { data: response, status: "ok" };
    } catch (error) {
      this.channelClient.setQueryState(this.queryKey, {
        ...queryState,
        networkStatus: NetworkStatus.error,
        loading: false,
      });

      return {
        status: "error",
        error: error as Error,
      };
    }
  }

  getQueryInfoSelector<
    TContent extends GenericData = GenericData,
    TData extends GenericData = GenericData,
  >(
    state: InAppMessageStoreState,
  ): {
    messages: InAppMessage<TContent, TData>[];
    loading: boolean;
    networkStatus: NetworkStatus;
  } {
    const queryInfo = state.queries[this.queryKey];
    const messageIds = queryInfo?.data?.messageIds ?? [];

    const messages = messageIds.reduce<InAppMessage<TContent, TData>[]>(
      (messages, messageId) => {
        const message = state.messages[messageId];
        if (message) {
          messages.push(message as InAppMessage<TContent, TData>);
        }
        return messages;
      },
      [],
    );

    return {
      messages,
      networkStatus: queryInfo?.networkStatus ?? NetworkStatus.ready,
      loading: queryInfo?.loading ?? false,
    };
  }

  // ----------------------------------------------
  // Helpers
  // ----------------------------------------------
  private buildQueryKey(params: GenericData) {
    // TODO: Update query key format to match GET request url (w/ query params)
    return `${this.messageType}-${JSON.stringify(params)}`;
  }
}
