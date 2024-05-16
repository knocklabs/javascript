import { PageInfo } from "@knocklabs/types";

import { NetworkStatus } from "../../networkStatus";

import { FeedItem, FeedMetadata, FeedResponse } from "./interfaces";

export type StoreFeedResultOptions = {
  shouldSetPage?: boolean;
  shouldAppend?: boolean;
};

export interface FeedStoreState {
  items: FeedItem[];
  pageInfo: PageInfo;
  metadata: FeedMetadata;
  loading: boolean;
  networkStatus: NetworkStatus;
  setResult: (response: FeedResponse, opts?: StoreFeedResultOptions) => void;
  setMetadata: (metadata: FeedMetadata) => void;
  setNetworkStatus: (networkStatus: NetworkStatus) => void;
  setItemAttrs: (itemIds: string[], attrs: object) => void;
  resetStore: (metadata?: FeedMetadata) => void;
}

export interface FeedMessagesReceivedPayload {
  metadata: FeedMetadata;
}

/*
Event types:
- `messages.new`: legacy event fired for all messages (feed items) received, real-time or not
- `items.received.realtime`: all real-time items received via a socket update
- `items.received.page`: invoked every time a page is fetched (like on initial load)
*/
export type FeedRealTimeEvent = "messages.new";

export type FeedEvent =
  | FeedRealTimeEvent
  | "items.received.page"
  | "items.received.realtime"
  | "items.archived"
  | "items.unarchived"
  | "items.seen"
  | "items.unseen"
  | "items.read"
  | "items.unread"
  | "items.all_archived"
  | "items.all_read"
  | "items.all_seen";

// Because we can bind to wild card feed events, this is here to accomodate whatever can be bound to
export type BindableFeedEvent = FeedEvent | "items.received.*" | "items.*";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FeedEventPayload<T = any> {
  event: Omit<FeedEvent, "messages.new">;
  items: FeedItem<T>[];
  metadata: FeedMetadata;
}

export type FeedRealTimeCallback = (resp: FeedResponse) => void;

export type FeedEventCallback = (payload: FeedEventPayload) => void;

export type FeedItemOrItems = FeedItem | FeedItem[];
