import { GenericData } from "@knocklabs/types";
import EventEmitter from "eventemitter2";
import { nanoid } from "nanoid";

import { isValidUuid } from "../../helpers";
import Knock from "../../knock";
import { NetworkStatus, isRequestInFlight } from "../../networkStatus";
import {
  BulkUpdateMessagesInChannelProperties,
  MessageEngagementStatus,
} from "../messages/interfaces";

import {
  FeedClientOptions,
  FeedItem,
  FeedMetadata,
  FeedResponse,
  FetchFeedOptions,
  FetchFeedOptionsForRequest,
} from "./interfaces";
import {
  FeedSocketManager,
  SocketEventPayload,
  SocketEventType,
} from "./socket-manager";
import createStore, { FeedStore } from "./store";
import {
  BindableFeedEvent,
  FeedEvent,
  FeedEventCallback,
  FeedEventPayload,
  FeedItemOrItems,
  FeedMessagesReceivedPayload,
  FeedRealTimeCallback,
} from "./types";
import { getFormattedTriggerData, mergeDateRangeParams } from "./utils";

// Default options to apply
const feedClientDefaults: Pick<FeedClientOptions, "archived" | "mode"> = {
  archived: "exclude",
  mode: "compact",
};

const CLIENT_REF_ID_PREFIX = "client_";

class Feed {
  public readonly defaultOptions: FeedClientOptions;
  public readonly referenceId: string;
  public unsubscribeFromSocketEvents: (() => void) | undefined = undefined;
  private socketManager: FeedSocketManager | undefined;
  private userFeedId: string;
  private broadcaster: EventEmitter;
  private broadcastChannel!: BroadcastChannel | null;
  private hasSubscribedToRealTimeUpdates: boolean = false;

  // The raw store instance, used for binding in React and other environments
  public store: FeedStore;

  constructor(
    readonly knock: Knock,
    readonly feedId: string,
    options: FeedClientOptions,
    socketManager: FeedSocketManager | undefined,
  ) {
    if (!feedId || !isValidUuid(feedId)) {
      this.knock.log(
        "[Feed] Invalid or missing feedId provided to the Feed constructor. The feed should be a UUID of an in-app feed channel (`in_app_feed`) found in the Knock dashboard. Please provide a valid feedId to the Feed constructor.",
        true,
      );
    }

    this.feedId = feedId;
    this.userFeedId = this.buildUserFeedId();
    this.referenceId = CLIENT_REF_ID_PREFIX + nanoid();
    this.socketManager = socketManager;
    this.store = createStore();
    this.broadcaster = new EventEmitter({ wildcard: true, delimiter: "." });
    this.defaultOptions = {
      ...feedClientDefaults,
      ...mergeDateRangeParams(options),
    };
    this.knock.log(`[Feed] Initialized a feed on channel ${feedId}`);

    // Attempt to setup a realtime connection (does not join)
    this.initializeRealtimeConnection();

    this.setupBroadcastChannel();
  }

  /**
   * Used to reinitialize a current feed instance, which is useful when reauthenticating users
   */
  reinitialize(socketManager?: FeedSocketManager) {
    this.socketManager = socketManager;

    // Reinitialize the user feed id incase the userId changed
    this.userFeedId = this.buildUserFeedId();

    // Reinitialize the real-time connection
    this.initializeRealtimeConnection();

    // Reinitialize our broadcast channel
    this.setupBroadcastChannel();
  }

  /**
   * Cleans up a feed instance by destroying the store and disconnecting
   * an open socket connection.
   */
  teardown() {
    this.knock.log("[Feed] Tearing down feed instance");

    this.socketManager?.leave(this);

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  /** Tears down an instance and removes it entirely from the feed manager */
  dispose() {
    this.knock.log("[Feed] Disposing of feed instance");
    this.teardown();
    this.broadcaster.removeAllListeners();
    this.knock.feeds.removeInstance(this);
  }

  /*
    Initializes a real-time connection to Knock, connecting the websocket for the
    current ApiClient instance if the socket is not already connected.
  */
  listenForUpdates() {
    this.knock.log("[Feed] Connecting to real-time service");

    this.hasSubscribedToRealTimeUpdates = true;

    // If the user is not authenticated, then do nothing
    if (!this.knock.isAuthenticated()) {
      this.knock.log(
        "[Feed] User is not authenticated, skipping listening for updates",
      );
      return;
    }

    this.unsubscribeFromSocketEvents = this.socketManager?.join(this);
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
    const { metadata, items, ...state } = this.store.getState();

    const isViewingOnlyUnseen = this.defaultOptions.status === "unseen";

    // If we're looking at the unseen view, then we want to remove all of the items optimistically
    // from the store given that nothing should be visible. We do this by resetting the store state
    // and setting the current metadata counts to 0
    if (isViewingOnlyUnseen) {
      state.resetStore({
        ...metadata,
        total_count: 0,
        unseen_count: 0,
      });
    } else {
      // Otherwise we want to update the metadata and mark all of the items in the store as seen
      state.setMetadata({ ...metadata, unseen_count: 0 });

      const attrs = { seen_at: new Date().toISOString() };
      const itemIds = items.map((item) => item.id);

      state.setItemAttrs(itemIds, attrs);
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("seen");
    this.emitEvent("all_seen", items);

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
    const { metadata, items, ...state } = this.store.getState();

    const isViewingOnlyUnread = this.defaultOptions.status === "unread";

    // If we're looking at the unread view, then we want to remove all of the items optimistically
    // from the store given that nothing should be visible. We do this by resetting the store state
    // and setting the current metadata counts to 0
    if (isViewingOnlyUnread) {
      state.resetStore({
        ...metadata,
        total_count: 0,
        unread_count: 0,
      });
    } else {
      // Otherwise we want to update the metadata and mark all of the items in the store as seen
      state.setMetadata({ ...metadata, unread_count: 0 });

      const attrs = { read_at: new Date().toISOString() };
      const itemIds = items.map((item) => item.id);

      state.setItemAttrs(itemIds, attrs);
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("read");
    this.emitEvent("all_read", items);

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

  async markAsInteracted(
    itemOrItems: FeedItemOrItems,
    metadata?: Record<string, string>,
  ) {
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

    return this.makeStatusUpdate(itemOrItems, "interacted", metadata);
  }

  /*
  Marking one or more items as archived should:

  - Decrement the badge count for any unread / unseen items
  - Remove the item from the feed list when the `archived` flag is "exclude" (default)

  TODO: how do we handle rollbacks?
  */
  async markAsArchived(itemOrItems: FeedItemOrItems) {
    const state = this.store.getState();

    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "exclude";

    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

    const itemIds: string[] = items.map((item) => item.id);

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
      const unseenCount = items.filter((i) => !i.seen_at).length;
      const unreadCount = items.filter((i) => !i.read_at).length;

      // Build the new metadata
      const updatedMetadata = {
        ...state.metadata,
        // Ensure that the counts don't ever go below 0 on archiving where the client state
        // gets out of sync with the server state
        total_count: Math.max(0, state.metadata.total_count - items.length),
        unseen_count: Math.max(0, state.metadata.unseen_count - unseenCount),
        unread_count: Math.max(0, state.metadata.unread_count - unreadCount),
      };

      // Remove the archiving entries
      const entriesToSet = state.items.filter(
        (item) => !itemIds.includes(item.id),
      );

      state.setResult({
        entries: entriesToSet,
        meta: updatedMetadata,
        page_info: state.pageInfo,
      });
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
    const { items, ...state } = this.store.getState();

    // Here if we're looking at a feed that excludes all of the archived items by default then we
    // will want to optimistically remove all of the items from the feed as they are now all excluded
    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "exclude";

    if (shouldOptimisticallyRemoveItems) {
      // Reset the store to clear out all of items and reset the badge count
      state.resetStore();
    } else {
      // Mark all the entries being updated as archived either way so the state is correct
      const itemIds = items.map((i) => i.id);
      state.setItemAttrs(itemIds, { archived_at: new Date().toISOString() });
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("archive");
    this.emitEvent("all_archived", items);

    return result;
  }

  async markAllReadAsArchived() {
    // Note: there is the potential for a race condition here because the bulk
    // update is an async method, so if a new message comes in during this window before
    // the update has been processed we'll effectively reset the `unseen_count` to be what it was.
    const { items, ...state } = this.store.getState();
    // Filter items to only include those that are unread
    const unreadItems = items.filter((item) => item.read_at === null);
    // Mark all the unread items as archived and read
    const itemIds = unreadItems.map((i) => i.id);
    state.setItemAttrs(itemIds, {
      archived_at: new Date().toISOString(),
    });

    // Here if we're looking at a feed that excludes all of the archived items by default then we
    // will want to optimistically remove all of the items from the feed as they are now all excluded
    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "exclude";

    if (shouldOptimisticallyRemoveItems) {
      // Remove all the read items from the store and reset the badge count
      const remainingItems = items.filter((item) => !itemIds.includes(item.id));
      // Build the new metadata
      const updatedMetadata = {
        ...state.metadata,
        total_count: remainingItems.length,
        unread_count: 0,
      };

      state.setResult({
        entries: remainingItems,
        meta: updatedMetadata,
        page_info: state.pageInfo,
      });
    }

    // Issue the API request to the bulk status change API
    const result = await this.makeBulkStatusUpdate("archive");
    // this.emitEvent("all_archived", readItems);

    return result;
  }

  async markAsUnarchived(itemOrItems: FeedItemOrItems) {
    const state = this.store.getState();

    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

    const itemIds: string[] = items.map((item) => item.id);

    const shouldOptimisticallyRemoveItems =
      this.defaultOptions.archived === "only";

    if (shouldOptimisticallyRemoveItems) {
      // If any of the items are unseen or unread, then capture as we'll want to decrement
      // the counts for these in the metadata we have
      const unseenCount = items.filter((i) => !i.seen_at).length;
      const unreadCount = items.filter((i) => !i.read_at).length;

      // Build the new metadata
      const updatedMetadata = {
        ...state.metadata,
        // Ensure that the counts don't ever go below 0 on unarchiving where the client state
        // gets out of sync with the server state
        total_count: Math.max(0, state.metadata.total_count - items.length),
        unseen_count: Math.max(0, state.metadata.unseen_count - unseenCount),
        unread_count: Math.max(0, state.metadata.unread_count - unreadCount),
      };

      // Remove the unarchived entries
      const entriesToSet = state.items.filter(
        (item) => !itemIds.includes(item.id),
      );

      state.setResult({
        entries: entriesToSet,
        meta: updatedMetadata,
        page_info: state.pageInfo,
      });
    } else {
      this.optimisticallyPerformStatusUpdate(itemOrItems, "unarchived", {
        archived_at: null,
      });
    }

    return this.makeStatusUpdate(itemOrItems, "unarchived");
  }

  /* Fetches the feed content, appending it to the store */
  async fetch(options: FetchFeedOptions = {}) {
    const { networkStatus, ...state } = this.store.getState();

    // If the user is not authenticated, then do nothing
    if (!this.knock.isAuthenticated()) {
      this.knock.log("[Feed] User is not authenticated, skipping fetch");
      return;
    }

    // If there's an existing request in flight, then do nothing
    if (isRequestInFlight(networkStatus)) {
      this.knock.log("[Feed] Request is in flight, skipping fetch");
      return;
    }

    // Set the loading type based on the request type it is
    state.setNetworkStatus(options.__loadingType ?? NetworkStatus.loading);

    // trigger_data should be a JSON string for the API
    // this function will format the trigger data if it's an object
    // https://docs.knock.app/reference#get-feed
    const formattedTriggerData = getFormattedTriggerData({
      ...this.defaultOptions,
      ...options,
    });

    // Always include the default params, if they have been set
    const queryParams: FetchFeedOptionsForRequest = {
      ...this.defaultOptions,
      ...mergeDateRangeParams(options),
      trigger_data: formattedTriggerData,
      // Unset options that should not be sent to the API
      __loadingType: undefined,
      __fetchSource: undefined,
      __experimentalCrossBrowserUpdates: undefined,
    };

    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.knock.userId}/feeds/${this.feedId}`,
      params: queryParams,
    });

    if (result.statusCode === "error" || !result.body) {
      state.setNetworkStatus(NetworkStatus.error);

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
      state.setResult(response, opts);
    } else if (options.after) {
      const opts = { shouldSetPage: true, shouldAppend: true };
      state.setResult(response, opts);
    } else {
      state.setResult(response);
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

  async fetchNextPage(options: FetchFeedOptions = {}) {
    // Attempts to fetch the next page of results (if we have any)
    const { pageInfo } = this.store.getState();

    if (!pageInfo.after) {
      // Nothing more to fetch
      return;
    }

    this.fetch({
      ...options,
      after: pageInfo.after,
      __loadingType: NetworkStatus.fetchMore,
    });
  }

  get socketChannelTopic(): string {
    return `feeds:${this.userFeedId}`;
  }

  private broadcast(
    eventName: FeedEvent,
    data: FeedResponse | FeedEventPayload,
  ) {
    this.broadcaster.emit(eventName, data);
  }

  // Invoked when a new real-time message comes in from the socket
  private async onNewMessageReceived({ data }: FeedMessagesReceivedPayload) {
    this.knock.log("[Feed] Received new real-time message");

    // Handle the new message coming in
    const { items, ...state } = this.store.getState();
    const currentHead: FeedItem | undefined = items[0];

    // Optimistically set the badge counts
    const metadata = data[this.referenceId]?.metadata;
    if (metadata) {
      state.setMetadata(metadata);
    }

    // Fetch the items before the current head (if it exists)
    this.fetch({ before: currentHead?.__cursor, __fetchSource: "socket" });
  }

  private buildUserFeedId() {
    return `${this.feedId}:${this.knock.userId}`;
  }

  private optimisticallyPerformStatusUpdate(
    itemOrItems: FeedItemOrItems,
    type: MessageEngagementStatus | "unread" | "unseen" | "unarchived",
    attrs: object,
    badgeCountAttr?: "unread_count" | "unseen_count",
  ) {
    const state = this.store.getState();
    const normalizedItems = Array.isArray(itemOrItems)
      ? itemOrItems
      : [itemOrItems];
    const itemIds = normalizedItems.map((item) => item.id);

    if (badgeCountAttr) {
      const { metadata } = state;

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

      // This is a hack to determine the direction of whether we're
      // adding or removing from the badge count
      const direction = type.startsWith("un")
        ? itemsToUpdate.length
        : -itemsToUpdate.length;

      state.setMetadata({
        ...metadata,
        [badgeCountAttr]: Math.max(0, metadata[badgeCountAttr] + direction),
      });
    }

    // Update the items with the given attributes
    state.setItemAttrs(itemIds, attrs);
  }

  private async makeStatusUpdate(
    itemOrItems: FeedItemOrItems,
    type: MessageEngagementStatus | "unread" | "unseen" | "unarchived",
    metadata?: Record<string, string>,
  ) {
    // Always treat items as a batch to use the corresponding batch endpoint
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const itemIds = items.map((item) => item.id);

    const result = await this.knock.messages.batchUpdateStatuses(
      itemIds,
      type,
      { metadata },
    );

    // Emit the event that these items had their statuses changed
    // Note: we do this after the update to ensure that the server event actually completed
    this.emitEvent(type, items);

    return result;
  }

  private async makeBulkStatusUpdate(
    status: BulkUpdateMessagesInChannelProperties["status"],
  ) {
    // The base scope for the call should take into account all of the options currently
    // set on the feed, as well as being scoped for the current user. We do this so that
    // we ONLY make changes to the messages that are currently in view on this feed, and not
    // all messages that exist.
    const options = {
      user_ids: [this.knock.userId!],
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

    return await this.knock.messages.bulkUpdateAllStatusesInChannel({
      channelId: this.feedId,
      status,
      options,
    });
  }

  private setupBroadcastChannel() {
    // Attempt to bind to listen to other events from this feed in different tabs
    // Note: here we ensure `self` is available (it's not in server rendered envs)
    this.broadcastChannel =
      typeof self !== "undefined" && "BroadcastChannel" in self
        ? new BroadcastChannel(`knock:feed:${this.userFeedId}`)
        : null;

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
          default:
            return null;
        }
      };
    }
  }

  private broadcastOverChannel(type: string, payload: GenericData) {
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

  private initializeRealtimeConnection() {
    // In server environments we might not have a socket connection
    if (!this.socketManager) return;

    // If we're initializing but they have previously opted to listen to real-time updates
    // then we will automatically reconnect on their behalf
    if (this.hasSubscribedToRealTimeUpdates && this.knock.isAuthenticated()) {
      this.unsubscribeFromSocketEvents = this.socketManager?.join(this);
    }
  }

  async handleSocketEvent(payload: SocketEventPayload) {
    switch (payload.event) {
      case SocketEventType.NewMessage:
        this.onNewMessageReceived(payload);
        return;
      default: {
        const _exhaustiveCheck: never = payload.event;
        return;
      }
    }
  }

  private emitEvent(
    type:
      | MessageEngagementStatus
      | "all_read"
      | "all_seen"
      | "all_archived"
      | "unread"
      | "unseen"
      | "unarchived",
    items: FeedItem[],
  ) {
    // Handle both `items.` and `items:` format for events for compatibility reasons
    this.broadcaster.emit(`items.${type}`, { items });
    this.broadcaster.emit(`items:${type}`, { items });
    // Internal events only need `items:`
    this.broadcastOverChannel(`items:${type}`, { items });
  }

}

export default Feed;
