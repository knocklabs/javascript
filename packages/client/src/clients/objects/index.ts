import { ApiResponse } from "../../api";
import { ChannelData } from "../../interfaces";
import Knock from "../../knock";

type GetChannelDataInput = {
  objectId: string;
  collection: string;
  channelId: string;
};

type SetChannelDataInput = {
  objectId: string;
  collection: string;
  channelId: string;
  data: any;
};

class ObjectClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }
  async getChannelData<T = any>({
    collection,
    objectId,
    channelId,
  }: GetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/objects/${collection}/${objectId}/channel_data/${channelId}`,
    });

    return this.handleResponse<ChannelData<T>>(result);
  }

  async setChannelData({
    objectId,
    collection,
    channelId,
    data,
  }: SetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `v1/objects/${collection}/${objectId}/channel_data/${channelId}`,
      data: { data },
    });

    return this.handleResponse(result);
  }

  private handleResponse<T>(response: ApiResponse) {
    if (response.statusCode === "error") {
      throw new Error(response.error || response.body);
    }

    return response.body as T;
  }
}

export default ObjectClient;
