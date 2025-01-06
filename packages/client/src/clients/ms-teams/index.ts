import { ApiResponse } from "../../api";
import Knock from "../../knock";
import { TENANT_OBJECT_COLLECTION } from "../objects/constants";

import { MSTeamsAuthCheckInput, MSTeamsDisconnectInput } from "./interfaces";

class MSTeamsClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async authCheck({ tenantId, knockChannelId }: MSTeamsAuthCheckInput) {
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

  async disconnect({ tenantId, knockChannelId }: MSTeamsDisconnectInput) {
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

export default MSTeamsClient;
