export type GenericData = {
  // eslint-disable-next-line
  [x: string]: any;
};

export interface PageInfo {
  after: string | null;
  before: string | null;
  page_size: number;
}

// Channel types supported in Knock
// TODO: it would be great to pull this in from an external location
export type ChannelType =
  | "email"
  | "in_app_feed"
  | "sms"
  | "push"
  | "chat"
  | "http";
