import { GenericData } from "@knocklabs/types";

import { JwtPayload } from "./jwt";
import Knock from "./knock";

export type LogLevel = "debug";

export interface KnockOptions {
  host?: string;
  logLevel?: LogLevel;
  branch?: string;
  /** Automatically disconnect the socket when the page is hidden and reconnect when visible. Defaults to `true`. */
  disconnectOnPageHidden?: boolean;
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
  identificationStrategy?: "inline" | "skip";
}

/**
 * Whether a `Knock` instance currently has a user identity to act on behalf of.
 * When `unauthenticated`, the instance is fully quiescent: no network requests
 * and no real-time socket activity occur until `authenticate` is called.
 */
export type KnockAuthStatus = "authenticated" | "unauthenticated";

/**
 * The shape of the subscribable auth-state store exposed on `knock.authStore`.
 * Subsystems and React hooks can subscribe to this to react to auth transitions
 * (login / logout / user switch) without polling `isAuthenticated()`.
 */
export interface KnockAuthState {
  status: KnockAuthStatus;
  userId: UserId;
  userToken: string | undefined;
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

export type UserId = Knock["userId"];
export type UserWithProperties = { id: UserId } & GenericData;
export type UserIdOrUserWithProperties = UserId | UserWithProperties;
