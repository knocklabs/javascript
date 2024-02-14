export type SlackChannelConnection = {
  access_token?: string;
  channel_id: string;
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

export type GetConnectedChannelsInput = {
  knockChannelId: string;
  connectionsObject: {
    objectId: string;
    collection: string;
  };
};

export type AuthCheckInput = {
  tenant: string;
  knockChannelId: string;
};

export type RevokeAccessTokenInput = {
  tenant: string;
  knockChannelId: string;
};

export type SlackChannel = {
  name: string;
  id: string;
  is_private: boolean;
  is_im: boolean;
  context_team_id: boolean;
};
