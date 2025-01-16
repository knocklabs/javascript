export type MsTeamsTeamQueryOptions = {
  maxCount?: number;
  limitPerPage?: number;
  filter?: string;
  select?: string;
};

export type MsTeamsChannelQueryOptions = {
  $filter?: string;
  $select?: string;
};
