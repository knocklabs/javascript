export interface SlackChannel {
  name: string;
  id: string;
  is_private: boolean;
  is_im: boolean;
  context_team_id: boolean;
}

export type ContainerObject = {
  objectId: string;
  collection: string;
};
