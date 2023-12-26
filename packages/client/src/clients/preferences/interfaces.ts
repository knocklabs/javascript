// Channel types supported in Knock
// TODO: it would be great to pull this in from an external location
export type ChannelType =
  | "email"
  | "in_app_feed"
  | "sms"
  | "push"
  | "chat"
  | "http";

export type ChannelTypePreferences = {
  [K in ChannelType]?: boolean;
};

export type WorkflowPreferenceSetting =
  | boolean
  | { channel_types: ChannelTypePreferences };

export type WorkflowPreferences = Partial<
  Record<string, WorkflowPreferenceSetting>
>;

export interface SetPreferencesProperties {
  workflows: WorkflowPreferences;
  categories: WorkflowPreferences;
  channel_types: ChannelTypePreferences;
}

export interface PreferenceSet {
  id: string;
  categories: WorkflowPreferences;
  workflows: WorkflowPreferences;
  channel_types: ChannelTypePreferences;
}

export interface PreferenceOptions {
  preferenceSet?: string;
}

export interface GetPreferencesOptions extends PreferenceOptions {
  tenant?: string;
}
