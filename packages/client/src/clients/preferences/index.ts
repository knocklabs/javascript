import { ApiResponse } from "../../api";
import Knock from "../../knock";
import {
  ChannelTypePreferences,
  ChannelType,
  PreferenceOptions,
  SetPreferencesProperties,
  WorkflowPreferenceSetting,
  WorkflowPreferences,
  PreferenceSet,
} from "./interfaces";

const DEFAULT_PREFERENCE_SET_ID = "default";

function buildUpdateParam(param: WorkflowPreferenceSetting) {
  if (typeof param === "object") {
    return param;
  }

  return { subscribed: param };
}

class Preferences {
  private instance: Knock;

  constructor(instance: Knock) {
    this.instance = instance;
  }

  async getAll() {
    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/preferences`,
    });

    return this.handleResponse(result);
  }

  async get(options: PreferenceOptions = {}) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "GET",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}`,
    });

    return this.handleResponse(result);
  }

  async set(
    preferenceSet: SetPreferencesProperties,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}`,
      data: preferenceSet,
    });

    return this.handleResponse(result);
  }

  async setChannelTypes(
    channelTypePreferences: ChannelTypePreferences,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/channel_types`,
      data: channelTypePreferences,
    });

    return this.handleResponse(result);
  }

  async setChannelType(
    channelType: ChannelType,
    setting: boolean,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/channel_types/${channelType}`,
      data: { subscribed: setting },
    });

    return this.handleResponse(result);
  }

  async setWorkflows(
    workflowPreferences: WorkflowPreferences,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/workflows`,
      data: workflowPreferences,
    });

    return this.handleResponse(result);
  }

  async setWorkflow(
    workflowKey: string,
    setting: WorkflowPreferenceSetting,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;
    const params = buildUpdateParam(setting);

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/workflows/${workflowKey}`,
      data: params,
    });

    return this.handleResponse(result);
  }

  async setCategories(
    categoryPreferences: WorkflowPreferences,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/categories`,
      data: categoryPreferences,
    });

    return this.handleResponse(result);
  }

  async setCategory(
    categoryKey: string,
    setting: WorkflowPreferenceSetting,
    options: PreferenceOptions = {},
  ) {
    const preferenceSetId = options.preferenceSet || DEFAULT_PREFERENCE_SET_ID;
    const params = buildUpdateParam(setting);

    const result = await this.instance.client().makeRequest({
      method: "PUT",
      url: `/v1/users/${this.instance.userId}/preferences/${preferenceSetId}/categories/${categoryKey}`,
      data: params,
    });

    return this.handleResponse(result);
  }

  private handleResponse(response: ApiResponse) {
    if (response.statusCode === "error") {
      throw new Error(response.error || response.body);
    }

    return response.body as PreferenceSet;
  }
}

export default Preferences;
