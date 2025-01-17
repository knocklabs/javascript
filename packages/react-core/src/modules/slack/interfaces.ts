export type ContainerObject = {
  objectId: string;
  collection: string;
};

export type SlackChannelQueryOptions = {
  maxCount?: number;
  limitPerPage?: number;
  excludeArchived?: boolean;
  types?: string;
  teamId?: string;
};
