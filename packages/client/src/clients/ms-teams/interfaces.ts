export type MsTeamsChannelConnection = {
  ms_teams_tenant_id?: string;
  ms_teams_team_id?: string;
  ms_teams_channel_id?: string;
  ms_teams_user_id?: null;
  incoming_webhook?: {
    url: string;
  };
};

export type GetMsTeamsTeamsInput = {
  tenant: string;
  knockChannelId: string;
  queryOptions?: {
    $filter?: string;
    $select?: string;
    $top?: number;
    $skiptoken?: string;
  };
};

export type GetMsTeamsChannelsInput = {
  tenant: string;
  knockChannelId: string;
  teamId: string;
  queryOptions?: {
    $filter?: string;
    $select?: string;
  };
};

export type GetMsTeamsTeamsResponse = {
  ms_teams_teams: MsTeamsTeam[];
  skip_token: string | null;
};

export type GetMsTeamsChannelsResponse = {
  ms_teams_channels: MsTeamsChannel[];
};

export type MsTeamsTeam = {
  id: string;
  displayName: string;
  description?: string;
};

export type MsTeamsChannel = {
  id: string;
  displayName: string;
  description?: string;
  membershipType?: string;
  isArchived?: boolean;
  createdDateTime?: string;
};
