import { GenericData } from "@knocklabs/types";
import { JwtPayload } from "jwt-decode";

export type LogLevel = "debug";

export interface KnockOptions {
  host?: string;
  logLevel?: LogLevel;
}

export interface KnockObject<T = GenericData> {
  id: string;
  collection: string;
  properties: T;
  updated_at: string;
  created_at: string | null;
}

export interface User extends GenericData {
  id: string;
  email: string | null;
  name: string | null;
  phone_number: string | null;
  avatar: string | null;
  updated_at: string;
  created_at: string | null;
}

export type Recipient = User | KnockObject;

export type RecipientRef = string | { collection: string; id: string };

export interface Activity<T = GenericData> {
  id: string;
  inserted_at: string;
  updated_at: string;
  recipient: Recipient;
  actor: Recipient | null;
  data: T | null;
}

export interface ChannelData<T = GenericData> {
  channel_id: string;
  data: T;
}

export type UserTokenExpiringCallback = (
  currentToken: string,
  decodedToken: JwtPayload,
) => Promise<string | void>;

export interface AuthenticateOptions {
  onUserTokenExpiring?: UserTokenExpiringCallback;
  timeBeforeExpirationInMs?: number;
}

export interface BulkOperation {
  id: string;
  name: string;
  status: "queued" | "processing" | "completed" | "failed";
  processed_rows: number;
  estimated_total_rows: number;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  inserted_at: string;
  updated_at: string;
}

export type AuthCheckInput = {
  tenant: string;
  knockChannelId: string;
};

export type RevokeAccessTokenInput = {
  tenant: string;
  knockChannelId: string;
};
