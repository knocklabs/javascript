import { GenericData, PageInfo } from "@knocklabs/types";
import { Channel } from "phoenix";

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
 *
 * TODO: Rename to InAppMessagesClient to singular?
 */
export class InAppMessagesClient {
  private knock: Knock;

  private channel: Channel | undefined;

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
    console.log("fetch")

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
    this.channelClient.store.setState((state) => {
      // console.log("setState 1")
      return {
        ...state,
        queries: {
          ...state.queries,
          [this.queryKey]: {
            ...queryState,
            networkStatus: options.__loadingType ?? NetworkStatus.loading,
            loading: true,
          },
        },
      }
    });

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
      // console.log("setState 2")
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

  subscribe() {
    console.log("subscribe")
    const { socket } = this.knock.client();

    // In server environments we might not have a socket connection.
    if (!socket) return;

    // Connect the socket only if no active connection yet.
    if (!socket.isConnected()) {
      socket.connect();
    }

    // Init a channel if none set up yet.
    if (!this.channel) {
      this.channel = socket.channel(this.buildSocketTopic(), {
        ...this.defaultOptions,
        message_type: this.messageType,
      });

      this.channel.on("message.created", (resp) => this.handleMessageCreated(resp));

      // TODO: Check if we need an auto socket manager.
    }

    // Join the channel if we're not already in a joining or leaving state.
    if (["closed", "errored"].includes(this.channel.state)) {
      this.channel.join();
    }
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.leave();
      this.channel.off("message.created");
    }
  }

  // TODO: Type the response correctly.
  private async handleMessageCreated(_: any) {
    console.log("handleMessageCreated")

    // Re-fetch the latest messages using the default params.
    await this.fetch();
  }

  private buildSocketTopic() {
    return `in_app:${this.channelClient.channelId}:${this.knock.userId}`;
  }

  private buildQueryKey(params: GenericData) {
    // TODO: Update query key format to match GET request url (w/ query params)
    return `${this.messageType}-${JSON.stringify(params)}`;
  }
}
