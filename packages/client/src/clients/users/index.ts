import { ApiResponse } from "../../api";
import { ChannelData } from "../../interfaces";
import Knock from "../../knock";
import {
  GetPreferencesOptions,
  PreferenceOptions,
  PreferenceSet,
  SetPreferencesProperties,
} from "../preferences/interfaces";
import { GetChannelDataInput, SetChannelDataInput } from "./interfaces";

const DEFAULT_PREFERENCE_SET_ID = "default";

class UserClient {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async getAllPreferences() {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/preferences`,
    });

    return this.handleResponse<PreferenceSet[]>(result);
  }

  async getPreferences(
    options: GetPreferencesOptions = {},
  ): Promise<PreferenceSet> {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}`,
      params: { tenant: options.tenant },
    });

    return this.handleResponse<PreferenceSet>(result);
  }

  async setPreferences(
    preferenceSet: SetPreferencesProperties,
    options: PreferenceOptions = {},
  ): Promise<PreferenceSet> {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}`,
      data: preferenceSet,
    });

    return this.handleResponse<PreferenceSet>(result);
  }

  async getChannelData<T = any>(params: GetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/channel_data/${params.channelId}`,
    });

    return this.handleResponse<ChannelData<T>>(result);
  }

  async setChannelData<T = any>({
    channelId,
    channelData,
  }: SetChannelDataInput) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/channel_data/${channelId}`,
      data: { data: channelData },
    });

    return this.handleResponse<ChannelData<T>>(result);
  }

  private handleResponse<T>(response: ApiResponse) {
    if (response.statusCode === "error") {
      throw new Error(response.error || response.body);
    }

    return response.body as T;
  }
}

export default UserClient;
