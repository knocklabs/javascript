import { GenericData, PageInfo, Tenant } from "@knocklabs/types";

import { NetworkStatus } from "../../networkStatus";
import { NotificationSource } from "../messages/interfaces";

export interface InAppMessage<
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
  TTenantProperties = GenericData,
> {
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
  tenant: Tenant<TTenantProperties>;
}

export interface InAppMessagesResponse<
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
> {
  entries: InAppMessage<TContent, TData>[];
  pageInfo: PageInfo;
}

export interface InAppMessagesQueryInfo {
  networkStatus: NetworkStatus;
  loading: boolean;
  data?: {
    messageIds: string[];
    pageInfo: PageInfo;
  };
}

export interface InAppMessagesStoreState {
  messages: Record<string, InAppMessage>;
  queries: Record<string, InAppMessagesQueryInfo>;
}

type InAppMessageEngagementStatus =
  | "read"
  | "unread"
  | "seen"
  | "unseen"
  | "link_clicked"
  | "link_unclicked"
  | "interacted"
  | "uninteracted";

export interface InAppMessagesClientOptions {
  order?: "asc" | "desc";
  engagement_status?: InAppMessageEngagementStatus[];
  // Optionally scope by schema version, either for an exact version (e.g. "1.0.0")
  // or a version range as a comparator (e.g. ">2.0.0" or "<=1.2.0"). Must
  // provide a valid semver in the format of `major.minor.patch`.
  schema_version?: string;
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
  // Pagination params
  before?: string;
  after?: string;
  page_size?: number;
}
