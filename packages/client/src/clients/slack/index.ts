import { ApiResponse } from "../../api";
import Knock from "../../knock";

type SlackChannelConnection = {
  access_token?: string;
  channel_id: string;
};

type ChannelConnectionInput = {
  objectId: string;
  collection: string;
  knockChannelId: string;
  slackChannelId: string;
  connections: SlackChannelConnection[];
  userId: string;
};

type GetSlackChannelsInput = {
  tenant: string;
  connectionsObject: {
    objectId: string;
    collection: string;
  };
  knockChannelId: string;
};

const TENANT_COLLECTION = "$tenants"

class SlackClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async getChannels(params: GetSlackChannelsInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/channels`,
      params: {
        access_token_object: {
          object_id: params.tenant,
          collection: TENANT_COLLECTION,
        },
        connections_object: {
          object_id: params.connectionsObject.objectId,
          collection: params.connectionsObject.collection,
        },
        channel_id: params.knockChannelId,
      },
    });

    return this.handleResponse(result);
  }

  async setChannelConnections({
    objectId,
    collection,
    knockChannelId,
    connections,
    userId,
  }: ChannelConnectionInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `v1/objects/${collection}/${objectId}/channel_data/${knockChannelId}`,
      data: { data: { connections }, user_id: userId },
    });

    return this.handleResponse(result);
  }

  private handleResponse(response: ApiResponse) {
    if (response.statusCode === "error") {
      throw new Error(response.error || response.body);
    }

    return response.body;
  }
}

export default SlackClient;
