import { ChannelType } from "@knocklabs/types";

export type ChannelTypePreferences = {
  [_K in ChannelType]?: boolean;
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
