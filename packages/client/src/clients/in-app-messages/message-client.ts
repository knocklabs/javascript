import { GenericData } from "@knocklabs/types";
import { Channel } from "phoenix";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";
import { MessageEngagementStatus } from "../messages/interfaces";

import { InAppMessagesChannelClient } from "./channel-client";
import {
  InAppMessage,
  InAppMessagesClientOptions,
  InAppMessagesResponse,
  InAppMessagesStoreState,
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
    readonly channelClient: InAppMessagesChannelClient,
    readonly messageType: string,
    readonly defaultOptions: InAppMessagesClientOptions = {},
  ) {
    this.defaultOptions = {
      ...channelClient.defaultOptions,
      ...defaultOptions,
    };
    this.knock = channelClient.knock;
    this.queryKey = this.buildQueryKey(this.defaultOptions);

    this.knock.log(`[IAM] Initialized a client for message ${messageType}`);
  }

  // ----------------------------------------------
  // Data fetching
  // ----------------------------------------------
  async fetch<
    TContent extends GenericData = GenericData,
    TData extends GenericData = GenericData,
  >(): Promise<
    | {
        status: "ok";
        data: InAppMessagesResponse<TContent, TData>;
      }
    | {
        status: "error";
        error: Error;
      }
    | undefined
  > {
    const params = this.defaultOptions;

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
    this.channelClient.setQueryStatus(this.queryKey, {
      networkStatus: NetworkStatus.loading,
      loading: true,
    });

    try {
      const response = await this.knock.user.getInAppMessages<TContent, TData>({
        channelId: this.channelClient.channelId,
        messageType: this.messageType,
        params,
      });

      this.channelClient.setQueryResponse(this.queryKey, response);

      return { data: response, status: "ok" };
    } catch (error) {
      this.channelClient.setQueryStatus(this.queryKey, {
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
    state: InAppMessagesStoreState,
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
  // Message engagement
  // ----------------------------------------------
  async markAsSeen(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      seen_at: new Date().toISOString(),
    });

    return this.makeStatusUpdate(itemOrItems, "seen");
  }

  async markAsUnseen(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      seen_at: null,
    });

    return this.makeStatusUpdate(itemOrItems, "unseen");
  }

  async markAsRead(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      read_at: new Date().toISOString(),
    });

    return this.makeStatusUpdate(itemOrItems, "read");
  }

  async markAsUnread(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      read_at: null,
    });

    return this.makeStatusUpdate(itemOrItems, "unread");
  }

  async markAsInteracted(
    itemOrItems: InAppMessage | InAppMessage[],
    metadata?: Record<string, string>,
  ) {
    const now = new Date().toISOString();
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      read_at: now,
      interacted_at: now,
    });

    return this.makeStatusUpdate(itemOrItems, "interacted", metadata);
  }

  async markAsArchived(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      archived_at: new Date().toISOString(),
    });

    return this.makeStatusUpdate(itemOrItems, "archived");
  }

  async markAsUnarchived(itemOrItems: InAppMessage | InAppMessage[]) {
    const itemIds = this.getItemIds(itemOrItems);

    this.channelClient.setMessageAttrs(itemIds, {
      archived_at: null,
    });

    return this.makeStatusUpdate(itemOrItems, "unarchived");
  }

  private async makeStatusUpdate(
    itemOrItems: InAppMessage | InAppMessage[],
    type: MessageEngagementStatus | "unread" | "unseen" | "unarchived",
    metadata?: Record<string, string>,
  ) {
    // Always treat items as a batch to use the corresponding batch endpoint
    const itemIds = this.getItemIds(itemOrItems);

    const result = await this.knock.messages.batchUpdateStatuses(
      itemIds,
      type,
      { metadata },
    );

    return result;
  }

  // ----------------------------------------------
  // Helpers
  // ----------------------------------------------
  private buildQueryKey(params: GenericData): string {
    const baseKey = `/v1/users/${this.knock.userId}/in-app-messages/${this.channelClient.channelId}/${this.messageType}`;
    const paramsString = new URLSearchParams(params).toString();
    return paramsString ? `${baseKey}?${paramsString}` : baseKey;
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

  private getItemIds(itemOrItems: InAppMessage | InAppMessage[]): string[] {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    return items.map((item) => item.id);
  }
}
