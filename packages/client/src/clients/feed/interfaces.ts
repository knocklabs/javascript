import { Activity, GenericData, PageInfo, Recipient } from "../../interfaces";
import { NetworkStatus } from "../../networkStatus";

// Specific feed interfaces

export interface FeedClientOptions {
  before?: string;
  after?: string;
  page_size?: number;
  status?: "unread" | "read" | "unseen" | "seen" | "all";
  // Optionally scope all notifications to a particular source only
  source?: string;
  // Optionally scope all requests to a particular tenant
  tenant?: string;
  // Optionally scope to notifications with any tenancy or no tenancy
  has_tenant?: boolean;
  // Optionally scope to notifications with any of the categories provided
  workflow_categories?: string[];
  // Optionally scope to a given archived status (defaults to `exclude`)
  archived?: "include" | "exclude" | "only";
  // Optionally scope all notifications that contain this argument as part of their trigger payload
  trigger_data?: GenericData;
  // Optionally enable cross browser feed updates for this feed
  __experimentalCrossBrowserUpdates?: boolean;
}

export type FetchFeedOptions = {
  __loadingType?: NetworkStatus.loading | NetworkStatus.fetchMore;
  __fetchSource?: "socket" | "http";
} & Omit<FeedClientOptions, "__experimentalCrossBrowserUpdates">;

export interface ContentBlock {
  content: string;
  rendered: string;
  type: "markdown" | "text";
  name: string;
}

export interface NotificationSource {
  key: string;
  version_id: string;
}

export interface FeedItem<T = GenericData> {
  __cursor: string;
  id: string;
  activities: Activity<T>[];
  actors: Recipient[];
  blocks: ContentBlock[];
  inserted_at: string;
  updated_at: string;
  read_at: string | null;
  seen_at: string | null;
  archived_at: string | null;
  total_activities: number;
  total_actors: number;
  data: T | null;
  source: NotificationSource;
  tenant: string | null;
}

export interface FeedMetadata {
  total_count: number;
  unread_count: number;
  unseen_count: number;
}

export interface FeedResponse {
  entries: FeedItem[];
  meta: FeedMetadata;
  page_info: PageInfo;
}
