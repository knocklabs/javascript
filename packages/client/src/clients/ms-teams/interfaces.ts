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

export type GetMsTeamsTeamsResponse = {
  ms_teams_teams: MsTeamsTeam[];
  next_link: string | null;
};

export type MsTeamsTeam = {
  id: string;
};
