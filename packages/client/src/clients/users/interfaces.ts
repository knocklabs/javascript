import { GenericData } from "@knocklabs/types";

import { InAppMessagesClientOptions } from "../in-app-messages/types";

export interface SetChannelDataInput {
  channelId: string;
  channelData: GenericData;
}

export interface GetChannelDataInput {
  channelId: string;
}

export interface GetInAppMessagesInput {
  channelId: string;
  messageType: string;
  params: InAppMessagesClientOptions;
}
