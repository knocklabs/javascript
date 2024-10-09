import { GenericData } from "@knocklabs/types";

import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";
import { MessageEngagementStatus } from "../messages/interfaces";

import { InAppChannelClient } from "./channel-client";
import {
  FetchInAppMessagesOptions,
  InAppMessage,
  InAppMessageResponse,
  InAppMessageStoreState,
  InAppMessagesClientOptions,
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
    this.queryKey = this.buildQueryKey(this.defaultOptions);

    this.knock.log(`[IAM] Initialized a client for message ${messageType}`);
  }

  // ----------------------------------------------
  // Data fetching
  // ----------------------------------------------
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
    this.channelClient.setQueryStatus(this.queryKey, {
      networkStatus: options.__loadingType ?? NetworkStatus.loading,
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

    // const queryInfo = this.channelClient.store.state.queries[this.queryKey];

    // Optimistically update the message status.
    this.channelClient.setMessageAttrs(itemIds, {
      archived_at: new Date().toISOString(),
    });

    // If set to exclude, also remove the message id from the list of messages for the given query
    // TODO: Figure out optimistic updates
    // const shouldOptimisticallyRemoveItems =
    //   this.defaultOptions.archived === "exclude";
    // if (shouldOptimisticallyRemoveItems && queryInfo?.data) {
    //   this.channelClient.setQueryState(this.queryKey, {
    //     ...queryInfo,
    //     data: {
    //       ...queryInfo.data,
    //       messageIds: queryInfo.data.messageIds?.filter(
    //         (id) => !itemIds.includes(id),
    //       ),
    //     },
    //   });
    // }

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
    // TODO: Update query key format to match GET request url (w/ query params)
    return `${this.messageType}-${JSON.stringify(params)}`;
  }

  private getItemIds(itemOrItems: InAppMessage | InAppMessage[]): string[] {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    return items.map((item) => item.id);
  }
}
