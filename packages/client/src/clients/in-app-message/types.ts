import { GenericData, PageInfo } from "@knocklabs/types";

import { NetworkStatus } from "../../networkStatus";
import { NotificationSource } from "../messages/interfaces";

export interface InAppMessage<TContent = GenericData, TData = GenericData> {
  __cursor: string;
  id: string;
  message_type: string;
  schema_variant: string;
  schema_version: string;
  content: TContent;
  data: TData | null;
  inserted_at: string;
  updated_at: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
  source: NotificationSource;
}

export interface InAppMessageResponse {
  items: InAppMessage[];
  pageInfo: PageInfo;
}

export interface InAppMessagesQueryInfo {
  networkStatus: NetworkStatus;
  loading: boolean;
  data?: InAppMessageResponse;
}

export interface InAppMessageStoreState {
  messages: Record<string, InAppMessage>;
  queries: Record<string, InAppMessagesQueryInfo>;
}

export type InAppMessageEngagementStatus =
  | "read"
  | "unread"
  | "seen"
  | "unseen"
  | "link_clicked"
  | "link_unclicked"
  | "interacted"
  | "uninteracted";

export interface InAppMessageClientOptions {
  order?: "asc" | "desc";
  before?: string;
  after?: string;
  page_size?: number;
  engagement_status?: InAppMessageEngagementStatus[];
  // Optionally scope all requests to a particular tenant or tenants
  tenant_id?: string | string[];
  // Optionally scope to notifications from the given workflow or workflows
  workflow_key?: string | string[];
  // Optionally scope to notifications with any of the categories provided
  workflow_categories?: string[];
  // Optionally scope to a given archived status (defaults to `exclude`)
  archived?: "include" | "exclude" | "only";
  // Optionally scope all notifications that contain this argument as part of their trigger payload
  trigger_data?: GenericData;
}

export type FetchInAppMessagesOptions = {
  __loadingType?: NetworkStatus.loading | NetworkStatus.fetchMore;
  __fetchSource?: "socket" | "http";
} & InAppMessageClientOptions;
