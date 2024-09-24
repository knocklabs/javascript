import { GenericData, PageInfo } from "@knocklabs/types";

import { NetworkStatus } from "../../networkStatus";
import { NotificationSource } from "../messages/interfaces";

export interface CommonContentField {
  key: string;
  label: string;
  rendered: string;
  type: "text" | "markdown" | "boolean" | "textarea";
  value: string;
}

export interface ButtonContentField {
  key: string;
  type: "button";
  text: Exclude<CommonContentField, "key | type"> & {
    key: "text";
    type: "text";
  };
  action: Exclude<CommonContentField, "key | type"> & {
    key: "action";
    type: "text";
  };
}

export type ContentField = CommonContentField | ButtonContentField;

export interface InAppMessage<T = GenericData> {
  __cursor: string;
  id: string;
  message_type: string;
  schema_variant: string;
  schema_version: string;
  content: Record<string, ContentField>;
  data: T | null;
  inserted_at: string;
  updated_at: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
  source: NotificationSource;
}

export interface InAppMessagesQueryInfo {
  networkStatus: NetworkStatus;
  loading: boolean;
  items: InAppMessage[];
  pageInfo?: PageInfo;
}

export interface InAppStoreState {
  messages: Record<string, InAppMessage>;
  queries: Record<string, InAppMessagesQueryInfo>;
}

export type EngagementStatus =
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
  engagement_status?: EngagementStatus[];
  // Optionally scope all requests to a particular tenant
  tenant_id?: string;
  // Optionally scope to notifications with any tenancy or no tenancy
  with_null_tenant?: boolean;
  // Optionally scope to notifications from the given workflow
  workflow_key?: string;
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
