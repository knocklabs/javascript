import type { RecipientObject } from "../../interfaces";

export type ContainerObject = RecipientObject;

export type SlackChannelQueryOptions = {
  maxCount?: number;
  limitPerPage?: number;
  excludeArchived?: boolean;
  types?: string;
  teamId?: string;
};
