import { GenericData } from "@knocklabs/types";
import { nanoid } from "nanoid";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";
import { MessageEngagementStatus } from "../messages/interfaces";

import { InAppMessagesChannelClient } from "./channel-client";
import { SocketEventPayload, SocketEventType } from "./socket-manager";
import {
  InAppMessage,
  InAppMessagesClientOptions,
  InAppMessagesResponse,
  InAppMessagesStoreState,
} from "./types";

/**
 * Manages realtime connection to in app messages service.
 */
export class InAppMessagesClient {
  private knock: Knock;

  public queryKey: string;
  public referenceId: string;
  public unsub?: () => void;

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
    this.referenceId = nanoid();

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
    const params = {
      ...this.defaultOptions,
      // Convert trigger_data to a string, which the API expects
      trigger_data: JSON.stringify(this.defaultOptions.trigger_data),
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
    this.unsub = this.channelClient.subscribe(this);
  }

  unsubscribe() {
    this.channelClient.unsubscribe(this);
  }

  // This is a callback function that will be invoked when a new socket event
  // relevant for this message client is received (and if subscribed).
  async handleSocketEvent(payload: SocketEventPayload) {
    switch (payload.event) {
      case SocketEventType.MessageCreated:
        // TODO(KNO-7169): Explore using an in-app message in the socket event
        // directly instead of re-fetching.
        return await this.fetch();

      default:
        throw new Error(`Unhandled socket event: ${payload.event}`);
    }
  }

  socketChannelTopic() {
    return `in_app:${this.messageType}:${this.channelClient.channelId}:${this.knock.userId}`;
  }

  private getItemIds(itemOrItems: InAppMessage | InAppMessage[]): string[] {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    return items.map((item) => item.id);
  }
}