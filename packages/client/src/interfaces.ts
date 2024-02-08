import { GenericData } from "@knocklabs/types";

export interface KnockOptions {
  host?: string;
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

export interface Activity<T = GenericData> {
  id: string;
  inserted_at: string;
  updated_at: string;
  recipient: Recipient;
  actor: Recipient | null;
  data: T | null;
}

export interface ChannelData<T = any> {
  channel_id: string;
  data: T;
}

export type UserTokenExpiringCallback = (
  currentToken: string,
  decodedToken: any,
) => Promise<string> | string;

export interface AuthenticateOptions {
  onUserTokenExpiring: UserTokenExpiringCallback;
  timeBeforeExpirationInMs?: number;
}
