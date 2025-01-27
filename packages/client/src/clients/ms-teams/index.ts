import { ApiResponse } from "../../api";
import { AuthCheckInput, RevokeAccessTokenInput } from "../../interfaces";
import Knock from "../../knock";
import { TENANT_OBJECT_COLLECTION } from "../objects/constants";

import {
  GetMsTeamsChannelsInput,
  GetMsTeamsChannelsResponse,
  GetMsTeamsTeamsInput,
  GetMsTeamsTeamsResponse,
} from "./interfaces";

class MsTeamsClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async authCheck({ tenant: tenantId, knockChannelId }: AuthCheckInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/ms-teams/${knockChannelId}/auth_check`,
      params: {
        ms_teams_tenant_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockChannelId,
      },
    });

    return this.handleResponse(result);
  }

  async getTeams(
    input: GetMsTeamsTeamsInput,
  ): Promise<GetMsTeamsTeamsResponse> {
    const { knockChannelId, tenant: tenantId } = input;
    const queryOptions = input.queryOptions || {};

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/ms-teams/${knockChannelId}/teams`,
      params: {
        ms_teams_tenant_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        query_options: {
          $filter: queryOptions.$filter,
          $select: queryOptions.$select,
          $top: queryOptions.$top,
          $skiptoken: queryOptions.$skiptoken,
        },
      },
    });

    return this.handleResponse(result);
  }

  async getChannels(
    input: GetMsTeamsChannelsInput,
  ): Promise<GetMsTeamsChannelsResponse> {
    const { knockChannelId, teamId, tenant: tenantId } = input;
    const queryOptions = input.queryOptions || {};

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/providers/ms-teams/${knockChannelId}/channels`,
      params: {
        ms_teams_tenant_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        team_id: teamId,
        query_options: {
          $filter: queryOptions.$filter,
          $select: queryOptions.$select,
        },
      },
    });

    return this.handleResponse(result);
  }

  async revokeAccessToken({
    tenant: tenantId,
    knockChannelId,
  }: RevokeAccessTokenInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/providers/ms-teams/${knockChannelId}/revoke_access`,
      params: {
        ms_teams_tenant_object: {
          object_id: tenantId,
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

export default MsTeamsClient;
