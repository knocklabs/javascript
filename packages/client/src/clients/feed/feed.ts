import { Channel } from "phoenix";
import { StoreApi } from "zustand";
import { EventEmitter2 as EventEmitter } from "eventemitter2";
import ApiClient from "../../api";
import createStore from "./store";
import {
  BindableFeedEvent,
  FeedMessagesReceivedPayload,
  FeedEventCallback,
  FeedEvent,
  FeedItemOrItems,
  FeedStoreState,
  FeedEventPayload,
  FeedRealTimeCallback,
} from "./types";
import {
  FeedItem,
  FeedClientOptions,
  FetchFeedOptions,
  FeedResponse,
  FeedMetadata,
} from "./interfaces";
import Knock from "../../knock";
import { isRequestInFlight, NetworkStatus } from "../../networkStatus";

export type Status =
  | "seen"
  | "read"
  | "interacted"
  | "archived"
  | "unseen"
  | "unread"
  | "unarchived";

// Default options to apply
const feedClientDefaults: Pick<FeedClientOptions, "archived"> = {
  archived: "exclude",
};

class Feed {
  private apiClient: ApiClient;
  private userFeedId: string;
  private channel: Channel | undefined;
  private broadcaster: EventEmitter;
  private defaultOptions: FeedClientOptions;
  private broadcastChannel: BroadcastChannel | null;

  // The raw store instance, used for binding in React and other environments
  public store: StoreApi<FeedStoreState>;

  constructor(
    readonly knock: Knock,
    readonly feedId: string,
    options: FeedClientOptions,
  ) {
    this.apiClient = knock.client();
    this.feedId = feedId;
    this.userFeedId = this.buildUserFeedId();
    this.store = createStore();
    this.broadcaster = new EventEmitter({ wildcard: true, delimiter: "." });
    this.defaultOptions = { ...feedClientDefaults, ...options };

    // In server environments we might not have a socket connection
    if (this.apiClient.socket) {
      this.channel = this.apiClient.socket.channel(
        `feeds:${this.userFeedId}`,
        this.defaultOptions,
      );

      this.channel.on("new-message", (resp) => this.onNewMessageReceived(resp));
    }

    // Attempt to bind to listen to other events from this feed in different tabs
    // Note: here we ensure `self` is available (it's not in server rendered envs)
    this.broadcastChannel =
      typeof self !== "undefined" && "BroadcastChannel" in self
        ? new BroadcastChannel(`knock:feed:${this.userFeedId}`)
        : null;
  }

  /**
   * Cleans up a feed instance by destroying the store and disconnecting
   * an open socket connection.
   */
  teardown() {
    if (this.channel) {
      this.channel.leave();
      this.channel.off("new-message");
    }

    this.broadcaster.removeAllListeners();
    this.store.destroy();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  /*
    Initializes a real-time connection to Knock, connecting the websocket for the
    current ApiClient instance if the socket is not already connected.
  */
  listenForUpdates() {
    // Connect the socket only if we don't already have a connection
    if (this.apiClient.socket && !this.apiClient.socket.isConnected()) {
      this.apiClient.socket.connect();
    }

    // Only join the channel if we're not already in a joining state
    if (this.channel && ["closed", "errored"].includes(this.channel.state)) {
      this.channel.join();
    }

    // Opt into receiving updates from _other tabs for the same user / feed_ via the broadcast
    // channel (iff it's enabled and exists)
    if (
      this.broadcastChannel &&
      this.defaultOptions.__experimentalCrossBrowserUpdates === true
    ) {
      this.broadcastChannel.onmessage = (e) => {
        switch (e.data.type) {
          case "items:archived":
          case "items:unarchived":
          case "items:seen":
          case "items:unseen":
          case "items:read":
          case "items:unread":
          case "items:all_read":
          case "items:all_seen":
          case "items:all_archived":
            // When items are updated in any other tab, simply refetch to get the latest state
            // to make sure that the state gets updated accordingly. In the future here we could
            // maybe do this optimistically without the fetch.
            return this.fetch();
            break;
          default:
            return null;
        }
      };
    }
  }

  /* Binds a handler to be invoked when event occurs */
  on(
    eventName: BindableFeedEvent,
    callback: FeedEventCallback | FeedRealTimeCallback,
  ) {
    this.broadcaster.on(eventName, callback);
  }

  off(
    eventName: BindableFeedEvent,
    callback: FeedEventCallback | FeedRealTimeCallback,
  ) {
    this.broadcaster.off(eventName, callback);
  }

  getState() {
    return this.store.getState();
  }

  async markAsSeen(itemOrItems: FeedItemOrItems) {
    const now = new Date().toISOString();
    this.optimisticallyPerformStatusUpdate(
      itemOrItems,
      "seen",
      { seen_at: now },
      "unseen_count",
    );

    return this.makeStatusUpdate(itemOrItems, "seen");
  }

  async markAllAsSeen() {
    // To mark all of the messages as seen we:
    // 1. Optimistically update *everything* we have in the store
    // 2. We decrement the `unseen_count` to zero optimistically
    // 3. We issue the API call to the endpoint
    //
    // Note: there is the potential for a race condition here because the bulk
    // update is an async method, so if a new message comes in during this window before
    // the update has been processed we'll effectively reset the `unseen_count` to be what it was.
    //
    // Note: here we optimistically handle the case whereby the feed is scoped to show only `unseen`
    // items by removing everything from view.
    const { getState, setState } = this.store;
    const { metadata, items } = getState();

    const isViewingOnlyUnseen = this.defaultOptions.status === "unseen";

    // If we're looking at the unseen view, then we want to remove all of the items optimistically
    // from the store given that nothing should be visible. We do this by resetting the store state
    // and setting the current metadata counts to 0
    if (isViewingOnlyUnseen) {
      setState((store) =>
        store.resetStore({
          ...metadata,
          total_count: 0,
          unseen_count: 0,
        }),
      );
    } else {
      // Otherwise we want to update the metadata and mark all of the items in the store as seen
      setState((store) => store.setMetadata({ ...metadata, unseen_count: 0 }));

      const attrs = { seen_at: new Date().toISOString() };
      const itemIds = items.map((item) => item.id);

      setState((store) => store.setItemAttrs(itemIds, attrs));
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("seen");

    this.broadcaster.emit(`items:all_seen`, { items });
    this.broadcastOverChannel(`items:all_seen`, { items });

    return result;
  }

  async markAsUnseen(itemOrItems: FeedItemOrItems) {
    this.optimisticallyPerformStatusUpdate(
      itemOrItems,
      "unseen",
      { seen_at: null },
      "unseen_count",
    );

    return this.makeStatusUpdate(itemOrItems, "unseen");
  }

  async markAsRead(itemOrItems: FeedItemOrItems) {
    const now = new Date().toISOString();
    this.optimisticallyPerformStatusUpdate(
      itemOrItems,
      "read",
      { read_at: now },
      "unread_count",
    );

    return this.makeStatusUpdate(itemOrItems, "read");
  }

  async markAllAsRead() {
    // To mark all of the messages as read we:
    // 1. Optimistically update *everything* we have in the store
    // 2. We decrement the `unread_count` to zero optimistically
    // 3. We issue the API call to the endpoint
    //
    // Note: there is the potential for a race condition here because the bulk
    // update is an async method, so if a new message comes in during this window before
    // the update has been processed we'll effectively reset the `unread_count` to be what it was.
    //
    // Note: here we optimistically handle the case whereby the feed is scoped to show only `unread`
    // items by removing everything from view.
    const { getState, setState } = this.store;
    const { metadata, items } = getState();

    const isViewingOnlyUnread = this.defaultOptions.status === "unread";

    // If we're looking at the unread view, then we want to remove all of the items optimistically
    // from the store given that nothing should be visible. We do this by resetting the store state
    // and setting the current metadata counts to 0
    if (isViewingOnlyUnread) {
      setState((store) =>
        store.resetStore({
          ...metadata,
          total_count: 0,
          unread_count: 0,
        }),
      );
    } else {
      // Otherwise we want to update the metadata and mark all of the items in the store as seen
      setState((store) => store.setMetadata({ ...metadata, unread_count: 0 }));

      const attrs = { read_at: new Date().toISOString() };
      const itemIds = items.map((item) => item.id);

      setState((store) => store.setItemAttrs(itemIds, attrs));
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("read");

    this.broadcaster.emit(`items:all_read`, { items });
    this.broadcastOverChannel(`items:all_read`, { items });

    return result;
  }

  async markAsUnread(itemOrItems: FeedItemOrItems) {
    this.optimisticallyPerformStatusUpdate(
      itemOrItems,
      "unread",
      { read_at: null },
      "unread_count",
    );

    return this.makeStatusUpdate(itemOrItems, "unread");
  }

  async markAsInteracted(itemOrItems: FeedItemOrItems) {
    const now = new Date().toISOString();
    this.optimisticallyPerformStatusUpdate(
      itemOrItems,
      "interacted",
      {
        read_at: now,
        interacted_at: now,
      },
      "unread_count",
    );

    return this.makeStatusUpdate(itemOrItems, "interacted");
  }

  /*
  Marking one or more items as archived should:

  - Decrement the badge count for any unread / unseen items
  - Remove the item from the feed list when the `archived` flag is "exclude" (default)

  TODO: how do we handle rollbacks?
  */
  async markAsArchived(itemOrItems: FeedItemOrItems) {
    const { getState, setState } = this.store;
    const state = getState();

    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "exclude";

    const normalizedItems = Array.isArray(itemOrItems)
      ? itemOrItems
      : [itemOrItems];

    const itemIds: string[] = normalizedItems.map((item) => item.id);

    /*
      In the code here we want to optimistically update counts and items
      that are persisted such that we can display updates immediately on the feed
      without needing to make a network request.

      Note: right now this does *not* take into account offline handling or any extensive retry
      logic, so rollbacks aren't considered. That probably needs to be a future consideration for
      this library.

      Scenarios to consider:

      ## Feed scope to archived *only*

      - Counts should not be decremented
      - Items should not be removed

      ## Feed scoped to exclude archived items (the default)

      - Counts should be decremented
      - Items should be removed

      ## Feed scoped to include archived items as well

      - Counts should not be decremented
      - Items should not be removed
    */

    if (shouldOptimisticallyRemoveItems) {
      // If any of the items are unseen or unread, then capture as we'll want to decrement
      // the counts for these in the metadata we have
      const unseenCount = normalizedItems.filter((i) => !i.seen_at).length;
      const unreadCount = normalizedItems.filter((i) => !i.read_at).length;

      // Build the new metadata
      const updatedMetadata = {
        ...state.metadata,
        total_count: state.metadata.total_count - normalizedItems.length,
        unseen_count: state.metadata.unseen_count - unseenCount,
        unread_count: state.metadata.unread_count - unreadCount,
      };

      // Remove the archiving entries
      const entriesToSet = state.items.filter(
        (item) => !itemIds.includes(item.id),
      );

      setState((state) =>
        state.setResult({
          entries: entriesToSet,
          meta: updatedMetadata,
          page_info: state.pageInfo,
        }),
      );
    } else {
      // Mark all the entries being updated as archived either way so the state is correct
      state.setItemAttrs(itemIds, { archived_at: new Date().toISOString() });
    }

    return this.makeStatusUpdate(itemOrItems, "archived");
  }

  async markAllAsArchived() {
    // Note: there is the potential for a race condition here because the bulk
    // update is an async method, so if a new message comes in during this window before
    // the update has been processed we'll effectively reset the `unseen_count` to be what it was.
    const { setState, getState } = this.store;
    const { items } = getState();

    // Here if we're looking at a feed that excludes all of the archived items by default then we
    // will want to optimistically remove all of the items from the feed as they are now all excluded
    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "exclude";

    if (shouldOptimisticallyRemoveItems) {
      // Reset the store to clear out all of items and reset the badge count
      setState((store) => store.resetStore());
    } else {
      // Mark all the entries being updated as archived either way so the state is correct
      setState((store) => {
        const itemIds = items.map((i) => i.id);
        store.setItemAttrs(itemIds, { archived_at: new Date().toISOString() });
      });
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("archive");

    this.broadcaster.emit(`items:all_archived`, { items });
    this.broadcastOverChannel(`items:all_archived`, { items });

    return result;
  }

  async markAsUnarchived(itemOrItems: FeedItemOrItems) {
    this.optimisticallyPerformStatusUpdate(itemOrItems, "unarchived", {
      archived_at: null,
    });

    return this.makeStatusUpdate(itemOrItems, "unarchived");
  }

  /* Fetches the feed content, appending it to the store */
  async fetch(options: FetchFeedOptions = {}) {
    const { setState, getState } = this.store;
    const { networkStatus } = getState();

    // If there's an existing request in flight, then do nothing
    if (isRequestInFlight(networkStatus)) {
      return;
    }

    // Set the loading type based on the request type it is
    setState((store) =>
      store.setNetworkStatus(options.__loadingType ?? NetworkStatus.loading),
    );

    // Always include the default params, if they have been set
    const queryParams = {
      ...this.defaultOptions,
      ...options,
      // Unset options that should not be sent to the API
      __loadingType: undefined,
      __fetchSource: undefined,
      __experimentalCrossBrowserUpdates: undefined,
    };

    const result = await this.apiClient.makeRequest({
      method: "GET",
      url: `/v1/users/${this.knock.userId}/feeds/${this.feedId}`,
      params: queryParams,
    });

    if (result.statusCode === "error" || !result.body) {
      setState((store) => store.setNetworkStatus(NetworkStatus.error));

      return {
        status: result.statusCode,
        data: result.error || result.body,
      };
    }

    const response = {
      entries: result.body.entries,
      meta: result.body.meta,
      page_info: result.body.page_info,
    };

    if (options.before) {
      const opts = { shouldSetPage: false, shouldAppend: true };
      setState((state) => state.setResult(response, opts));
    } else if (options.after) {
      const opts = { shouldSetPage: true, shouldAppend: true };
      setState((state) => state.setResult(response, opts));
    } else {
      setState((state) => state.setResult(response));
    }

    // Legacy `messages.new` event, should be removed in a future version
    this.broadcast("messages.new", response);

    // Broadcast the appropriate event type depending on the fetch source
    const feedEventType: FeedEvent =
      options.__fetchSource === "socket"
        ? "items.received.realtime"
        : "items.received.page";

    const eventPayload = {
      items: response.entries as FeedItem[],
      metadata: response.meta as FeedMetadata,
      event: feedEventType,
    };

    this.broadcast(eventPayload.event, eventPayload);

    return { data: response, status: result.statusCode };
  }

  async fetchNextPage() {
    // Attempts to fetch the next page of results (if we have any)
    const { getState } = this.store;
    const { pageInfo } = getState();

    if (!pageInfo.after) {
      // Nothing more to fetch
      return;
    }

    this.fetch({
      after: pageInfo.after,
      __loadingType: NetworkStatus.fetchMore,
    });
  }

  private broadcast(
    eventName: FeedEvent,
    data: FeedResponse | FeedEventPayload,
  ) {
    this.broadcaster.emit(eventName, data);
  }

  // Invoked when a new real-time message comes in from the socket
  private async onNewMessageReceived({
    metadata,
  }: FeedMessagesReceivedPayload) {
    // Handle the new message coming in
    const { getState, setState } = this.store;
    const { items } = getState();
    const currentHead: FeedItem | undefined = items[0];
    // Optimistically set the badge counts
    setState((state) => state.setMetadata(metadata));
    // Fetch the items before the current head (if it exists)
    this.fetch({ before: currentHead?.__cursor, __fetchSource: "socket" });
  }

  private buildUserFeedId() {
    return `${this.feedId}:${this.knock.userId}`;
  }

  private optimisticallyPerformStatusUpdate(
    itemOrItems: FeedItemOrItems,
    type: Status,
    attrs: object,
    badgeCountAttr?: "unread_count" | "unseen_count",
  ) {
    const { getState, setState } = this.store;
    const normalizedItems = Array.isArray(itemOrItems)
      ? itemOrItems
      : [itemOrItems];
    const itemIds = normalizedItems.map((item) => item.id);

    if (badgeCountAttr) {
      const { metadata } = getState();

      // We only want to update the counts of items that have not already been counted towards the
      // badge count total to avoid updating the badge count unnecessarily.
      const itemsToUpdate = normalizedItems.filter((item) => {
        switch (type) {
          case "seen":
            return item.seen_at === null;
          case "unseen":
            return item.seen_at !== null;
          case "read":
          case "interacted":
            return item.read_at === null;
          case "unread":
            return item.read_at !== null;
          default:
            return true;
        }
      });

      // Tnis is a hack to determine the direction of whether we're
      // adding or removing from the badge count
      const direction = type.startsWith("un")
        ? itemsToUpdate.length
        : -itemsToUpdate.length;

      setState((store) =>
        store.setMetadata({
          ...metadata,
          [badgeCountAttr]: Math.max(0, metadata[badgeCountAttr] + direction),
        }),
      );
    }

    // Update the items with the given attributes
    setState((store) => store.setItemAttrs(itemIds, attrs));
  }

  private async makeStatusUpdate(itemOrItems: FeedItemOrItems, type: Status) {
    // Always treat items as a batch to use the corresponding batch endpoint
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const itemIds = items.map((item) => item.id);

    const result = await this.apiClient.makeRequest({
      method: "POST",
      url: `/v1/messages/batch/${type}`,
      data: { message_ids: itemIds },
    });

    // Emit the event that these items had their statuses changed
    // Note: we do this after the update to ensure that the server event actually completed
    this.broadcaster.emit(`items:${type}`, { items });
    this.broadcastOverChannel(`items:${type}`, { items });

    return result;
  }

  private async makeBulkStatusUpdate(type: "seen" | "read" | "archive") {
    // The base scope for the call should take into account all of the options currently
    // set on the feed, as well as being scoped for the current user. We do this so that
    // we ONLY make changes to the messages that are currently in view on this feed, and not
    // all messages that exist.
    const options = {
      user_ids: [this.knock.userId],
      engagement_status:
        this.defaultOptions.status !== "all"
          ? this.defaultOptions.status
          : undefined,
      archived: this.defaultOptions.archived,
      has_tenant: this.defaultOptions.has_tenant,
      tenants: this.defaultOptions.tenant
        ? [this.defaultOptions.tenant]
        : undefined,
    };

    return await this.apiClient.makeRequest({
      method: "POST",
      url: `/v1/channels/${this.feedId}/messages/bulk/${type}`,
      data: options,
    });
  }

  private broadcastOverChannel(type: string, payload: any) {
    // The broadcastChannel may not be available in non-browser environments
    if (!this.broadcastChannel) {
      return;
    }

    // Here we stringify our payload and try and send as JSON such that we
    // don't get any `An object could not be cloned` errors when trying to broadcast
    try {
      const stringifiedPayload = JSON.parse(JSON.stringify(payload));

      this.broadcastChannel.postMessage({
        type,
        payload: stringifiedPayload,
      });
    } catch (e) {
      console.warn(`Could not broadcast ${type}, got error: ${e}`);
    }
  }
}

export default Feed;
