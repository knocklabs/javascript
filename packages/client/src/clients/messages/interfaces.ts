import { RecipientRef } from "../..";

export type MessageDeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "delivery_attempted"
  | "undelivered"
  | "not_sent";

export interface NotificationSource {
  key: string;
  version_id: string;
  categories: string[];
}

export type MessageEngagementStatus =
  | "seen"
  | "read"
  | "interacted"
  | "archived";

export interface Message<T = unknown> {
  id: string;
  channel_id: string;
  recipient: RecipientRef;
  actors: RecipientRef[];
  inserted_at: string;
  updated_at: string;
  read_at: string | null;
  seen_at: string | null;
  archived_at: string | null;
  tenant: string | null;
  status: MessageDeliveryStatus;
  engagement_statuses: MessageEngagementStatus[];
  source: NotificationSource;
  data: T | null;
  metadata: {
    external_id?: string;
  };
}

export type BulkUpdateMessagesInChannelProperties = {
  channelId: string;
  status: "seen" | "read" | "archive";
  options: {
    user_ids?: string[];
    engagement_status?: "seen" | "read" | "unseen" | "unread";
    archived?: "exclude" | "include" | "only";
    has_tenant?: boolean;
    tenants?: string[];
  };
};
