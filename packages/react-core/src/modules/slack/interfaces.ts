export type SlackChannelQueryOptions = {
  maxCount?: number;
  limitPerPage?: number;
  excludeArchived?: boolean;
  types?: string;
  teamId?: string;
};
