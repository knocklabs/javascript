export interface SetChannelDataInput {
  channelId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channelData: Record<string, any>;
}

export interface GetChannelDataInput {
  channelId: string;
}
