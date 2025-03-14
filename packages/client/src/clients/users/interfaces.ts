import { GenericData } from "@knocklabs/types";

export interface SetChannelDataInput {
  channelId: string;
  channelData: GenericData;
}

export interface GetChannelDataInput {
  channelId: string;
}
