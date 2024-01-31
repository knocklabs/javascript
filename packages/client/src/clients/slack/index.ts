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

type AuthCheckInput = {
  tenant: string;
  knockChannelId: string;
};

type RevokeAccessTokenInput = {
  tenant: string;
  knockChannelId: string;
};

const TENANT_COLLECTION = "$tenants";

class SlackClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async authCheck({ tenant, knockChannelId }: AuthCheckInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/${knockChannelId}/auth_check`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_COLLECTION,
        },
        channel_id: knockChannelId,
      },
    });

    return this.handleResponse(result);
  }

  async getChannels({
    knockChannelId,
    tenant,
    connectionsObject,
  }: GetSlackChannelsInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/${knockChannelId}/channels`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_COLLECTION,
        },
        connections_object: {
          object_id: connectionsObject.objectId,
          collection: connectionsObject.collection,
        },
        channel_id: knockChannelId,
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

  async revokeAccessToken({ tenant, knockChannelId }: RevokeAccessTokenInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/providers/slack/${knockChannelId}/revoke_access`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_COLLECTION,
        },
        channel_id: knockChannelId,
      },
    });

    return this.handleResponse(result);
  }

  private handleResponse(response: ApiResponse) {
    if (response.statusCode === "error") {
      if (response.error?.response?.status < 500) {
        return response.error || response.body;
      }
      throw new Error(response.error || response.body);
    }

    return response.body;
  }
}

export default SlackClient;
