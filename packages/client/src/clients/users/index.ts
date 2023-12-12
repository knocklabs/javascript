import { ApiResponse } from "../../api";
import Knock from "../../knock";

type SetChannelDataInput = {
  channelId: string;
  channelData: Record<string, any>;
};

type GetChannelDataInput = {
  channelId: string;
};

class UserClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async getChannelData(params: GetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/channel_data/${params.channelId}`,
    });

    return this.handleResponse(result);
  }

  async setChannelData({ channelId, channelData }: SetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/channel_data/${channelId}`,
      data: { data: channelData },
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

export default UserClient;
