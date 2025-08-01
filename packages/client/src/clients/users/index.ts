import { GenericData } from "@knocklabs/types";

import { ApiResponse } from "../../api";
import { ChannelData, User } from "../../interfaces";
import Knock from "../../knock";
import { guidesApiRootPath } from "../guide/client";
import { GuideEngagementEventBaseParams } from "../guide/types";
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

  async get() {
    this.instance.failIfNotAuthenticated();

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}`,
    });

    return this.handleResponse<User>(result);
  }

  async identify(props: GenericData = {}) {
    this.instance.failIfNotAuthenticated();

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}`,
      params: props,
    });

    return this.handleResponse<User>(result);
  }

  async getAllPreferences() {
    this.instance.failIfNotAuthenticated();

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/preferences`,
    });

    return this.handleResponse<PreferenceSet[]>(result);
  }

  async getPreferences(
    options: GetPreferencesOptions = {},
  ): Promise<PreferenceSet> {
    this.instance.failIfNotAuthenticated();
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
    this.instance.failIfNotAuthenticated();
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}`,
      data: preferenceSet,
    });

    return this.handleResponse<PreferenceSet>(result);
  }

  async getChannelData<T = GenericData>(params: GetChannelDataInput) {
    this.instance.failIfNotAuthenticated();

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/channel_data/${params.channelId}`,
    });

    return this.handleResponse<ChannelData<T>>(result);
  }

  async setChannelData<T = GenericData>({
    channelId,
    channelData,
  }: SetChannelDataInput) {
    this.instance.failIfNotAuthenticated();

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/channel_data/${channelId}`,
      data: { data: channelData },
    });

    return this.handleResponse<ChannelData<T>>(result);
  }

  async getGuides<P, R>(channelId: string, params: P) {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `${guidesApiRootPath(this.instance.userId)}/${channelId}`,
      params,
    });

    return this.handleResponse<R>(result);
  }

  async markGuideStepAs<P extends GuideEngagementEventBaseParams, R>(
    status: "seen" | "interacted" | "archived",
    params: P,
  ) {
    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `${guidesApiRootPath(this.instance.userId)}/messages/${params.message_id}/${status}`,
      data: params,
    });

    return this.handleResponse<R>(result);
  }

  private handleResponse<T>(response: ApiResponse) {
    if (response.statusCode === "error") {
      throw new Error(response.error || response.body);
    }

    return response.body as T;
  }
}

export default UserClient;
