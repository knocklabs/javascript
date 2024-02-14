import { ApiResponse } from "../../api";
import Knock from "../../knock";

import {
  AuthCheckInput,
  GetSlackChannelsInput,
  RevokeAccessTokenInput,
} from "./interfaces";

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

  async getChannels(input: GetSlackChannelsInput) {
    const { knockChannelId, tenant } = input;
    const queryOptions = input.queryOptions || {};

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/${knockChannelId}/channels`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_COLLECTION,
        },
        channel_id: knockChannelId,
        query_options: {
          cursor: queryOptions.cursor,
          limit: queryOptions.limit,
          exclude_archived: queryOptions.excludeArchived,
          team_id: queryOptions.teamId,
          types: queryOptions.types,
        },
      },
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
