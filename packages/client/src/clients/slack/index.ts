import { ApiResponse } from "../../api";
import { AuthCheckInput, RevokeAccessTokenInput } from "../../interfaces";
import Knock from "../../knock";
import { TENANT_OBJECT_COLLECTION } from "../objects/constants";

import { GetSlackChannelsInput, GetSlackChannelsResponse } from "./interfaces";

class SlackClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async authCheck({ tenant, knockChannelId }: AuthCheckInput) {
    if (!this.instance.isAuthenticated()) {
      this.instance.log("[Slack] Skipping authCheck - user not authenticated");
      return { status: "not_connected" };
    }

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/${knockChannelId}/auth_check`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockChannelId,
      },
    });

    return this.handleResponse(result);
  }

  async getChannels(
    input: GetSlackChannelsInput,
  ): Promise<GetSlackChannelsResponse> {
    if (!this.instance.isAuthenticated()) {
      this.instance.log(
        "[Slack] Skipping getChannels - user not authenticated",
      );
      return { slack_channels: [], next_cursor: null };
    }

    const { knockChannelId, tenant } = input;
    const queryOptions = input.queryOptions || {};

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/slack/${knockChannelId}/channels`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_OBJECT_COLLECTION,
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
    if (!this.instance.isAuthenticated()) {
      this.instance.log(
        "[Slack] Skipping revokeAccessToken - user not authenticated",
      );
      return { status: "not_connected" };
    }

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/providers/slack/${knockChannelId}/revoke_access`,
      params: {
        access_token_object: {
          object_id: tenant,
          collection: TENANT_OBJECT_COLLECTION,
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
