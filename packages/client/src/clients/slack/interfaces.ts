export type SlackChannelConnection = {
  access_token?: string;
  channel_id?: string;
  incoming_webhook?: string;
  user_id?: null;
};

export type GetSlackChannelsInput = {
  tenant: string;
  knockChannelId: string;
  queryOptions?: {
    limit?: number;
    cursor?: string;
    excludeArchived?: boolean;
    teamId?: string;
    types?: string;
  };
};

export type GetSlackChannelsResponse = {
  slack_channels: SlackChannel[];
  next_cursor: string | null;
};

export type SlackChannel = {
  name: string;
  id: string;
  is_private: boolean;
  is_im: boolean;
  context_team_id: boolean;
};
