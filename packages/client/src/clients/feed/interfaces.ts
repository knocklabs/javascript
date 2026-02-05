import { GenericData, PageInfo } from "@knocklabs/types";

import { Activity, Recipient } from "../../interfaces";
import { NetworkStatus } from "../../networkStatus";
import { NotificationSource } from "../messages/interfaces";

// Specific feed interfaces

/**
 * `trigger_data` may only specify flat key-value pairs, not nested objects
 * Specifying a nested object will result in a 422 "invalid_params" error
 * https://docs.knock.app/reference#trigger-data-filtering
 */
export interface TriggerData extends GenericData {
  [key: string]: string | number | boolean | null;
}

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
  trigger_data?: TriggerData;
  // Optionally enable cross browser feed updates for this feed
  __experimentalCrossBrowserUpdates?: boolean;
  // Optionally automatically manage socket connections on changes to tab visibility (defaults to `false`)
  auto_manage_socket_connection?: boolean;
  // Optionally set the delay amount in milliseconds when automatically disconnecting sockets from inactive tabs (defaults to `2000`)
  // Requires `auto_manage_socket_connection` to be `true`
  auto_manage_socket_connection_delay?: number;
  // Optionally scope notifications to a given date range
  inserted_at_date_range?: {
    // Optionally set the start date with a string in ISO 8601 format
    start?: string;
    // Optionally set the end date with a string in ISO 8601 format
    end?: string;
    // Optionally set whether to be inclusive of the start and end dates
    inclusive?: boolean;
  };
  /**
   * The mode to render the feed items in. When `mode` is `compact`:
   *
   * - The `activities` and `total_activities` fields will _not_ be present on feed items
   * - The `data` field will _not_ include nested arrays and objects
   * - The `actors` field will only have up to one actor
   *
   * @default "compact"
   */
  mode?: "rich" | "compact";
  /**
   * Field paths to exclude from the response. Use dot notation for nested fields
   * (e.g., "entries.archived_at"). Limited to 3 levels deep.
   */
  exclude?: string[];
}

export type FetchFeedOptions = {
  __loadingType?: NetworkStatus.loading | NetworkStatus.fetchMore;
  __fetchSource?: "socket" | "http";
} & Omit<FeedClientOptions, "__experimentalCrossBrowserUpdates">;

/**
 * The final data shape that is sent to the the list feed items endpoint of the Knock API.
 *
 * @see https://docs.knock.app/api-reference/users/feeds/list_items
 */
export type FetchFeedOptionsForRequest = Omit<
  FeedClientOptions,
  "trigger_data" | "exclude"
> & {
  // Formatted trigger data into a string
  trigger_data?: string;
  /** Fields to exclude from the response, joined by commas. */
  exclude?: string;
  "inserted_at.gte"?: string;
  "inserted_at.lte"?: string;
  "inserted_at.gt"?: string;
  "inserted_at.lt"?: string;
  // Unset options that should not be sent to the API
  __loadingType: undefined;
  __fetchSource: undefined;
  __experimentalCrossBrowserUpdates: undefined;
  auto_manage_socket_connection: undefined;
  auto_manage_socket_connection_delay: undefined;
};

export interface ContentBlockBase {
  name: string;
  type: "markdown" | "text" | "button_set";
}

export interface ActionButton {
  name: string;
  label: string;
  action: string;
}

export interface ButtonSetContentBlock extends ContentBlockBase {
  type: "button_set";
  buttons: ActionButton[];
}

export interface TextContentBlock extends ContentBlockBase {
  type: "text";
  rendered: string;
  content: string;
}

export interface MarkdownContentBlock extends ContentBlockBase {
  type: "markdown";
  rendered: string;
  content: string;
}

export type ContentBlock =
  | MarkdownContentBlock
  | TextContentBlock
  | ButtonSetContentBlock;

export interface FeedItem<T = GenericData> {
  __cursor: string;
  id: string;
  /**
   * List of activities associated with this feed item.
   * Only present in "rich" mode.
   */
  activities?: Activity<T>[];
  actors: Recipient[];
  blocks: ContentBlock[];
  inserted_at: string;
  updated_at: string;
  read_at: string | null;
  seen_at: string | null;
  clicked_at: string | null;
  interacted_at: string | null;
  link_clicked_at: string | null;
  archived_at: string | null;
  /**
   * Total number of activities related to this feed item.
   * Only present in "rich" mode.
   */
  total_activities?: number;
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

export interface FeedResponse<T = GenericData> {
  entries: FeedItem<T>[];
  meta: FeedMetadata;
  page_info: PageInfo;
}
