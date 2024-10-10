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

export interface Tenant<T = GenericData> {
  id: string;
  properties: T;
  settings?: TenantSettings;
  created_at?: string;
  updated_at: string;
}

export interface TenantSettings {
  branding?: TenantBrandingSettings;
  preference_set?: PreferenceSetProperties;
}

export interface TenantBrandingSettings {
  primary_color?: string;
  primary_color_contrast?: string;
  logo_url?: string;
  icon_url?: string;
}

export interface PreferenceSetProperties {
  workflows?: WorkflowPreferences;
  categories?: WorkflowPreferences;
  channel_types?: ChannelTypePreferences;
}

export interface WorkflowPreferences {
  [key: string]: WorkflowPreferenceSetting;
}

export type WorkflowPreferenceSetting =
  | boolean
  | { channel_types: ChannelTypePreferences }
  | ConditionalPreferenceSettings;

export type ChannelTypePreferences = {
  [K in ChannelType]?: boolean | ConditionalPreferenceSettings;
};

export type ConditionalPreferenceSettings = {
  conditions: Condition[];
};

export interface Condition {
  argument: string;
  variable: string;
  operator: string;
}
