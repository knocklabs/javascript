export interface KnockOptions {
  host?: string;
}

export type GenericData = {
  // eslint-disable-next-line
  [x: string]: any;
};

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

export interface PageInfo {
  after: string | null;
  before: string | null;
  page_size: number;
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
