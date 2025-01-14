export type GetMsTeamsTeamsInput = {
  tenantId: string;
  knockChannelId: string;
  queryOptions?: {
    $filter?: string;
    $select?: string;
    $top?: string;
    $skiptoken?: string;
    $count?: string;
  };
};

export type GetMsTeamsChannelsInput = {
  tenantId: string;
  knockChannelId: string;
  teamId: string;
  queryOptions?: {
    $filter?: string;
    $select?: string;
  };
};

export type GetMsTeamsTeamsResponse = {
  ms_teams_teams: MsTeamsTeam[];
  next_link: string | null;
};

export type GetMsTeamsChannelsResponse = {
  ms_teams_channels: MsTeamsChannel[];
};

export type MsTeamsTeam = {
  id?: string;
  displayName?: string;
  description?: string;
};

export type MsTeamsChannel = {
  id?: string;
  displayName?: string;
  description?: string;
  membershipType?: string;
  isArchived?: boolean;
  createdDateTime?: string;
};
