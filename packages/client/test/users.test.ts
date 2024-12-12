import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import Knock from "../src/knock";
import { SetChannelDataInput, GetChannelDataInput } from "../src/clients/users/interfaces";
import {
  SetPreferencesProperties,
  GetPreferencesOptions,
} from "../src/clients/preferences/interfaces";
import { GenericData } from "@knocklabs/types";
import { ApiResponse } from "../src/api";

describe("UserClient", () => {
  let knock: Knock;

  beforeEach(() => {
    knock = new Knock("pk_test_12345");
    knock.authenticate("test-user");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("get fetches user data", async () => {
    const mockResponse: ApiResponse = {
      body: { id: "test-user" },
      statusCode: "ok",
      status: 200,
    };
    vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

    const result = await knock.user.get();
    expect(result).toEqual(mockResponse.body);
  });

  test("identify updates user data", async () => {
    const props: GenericData = { name: "Test User" };
    const mockResponse: ApiResponse = {
      body: { id: "test-user", ...props },
      statusCode: "ok",
      status: 200,
    };
    vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

    const result = await knock.user.identify(props);
    expect(result).toEqual(mockResponse.body);
  });

  describe("preferences", () => {
    test("getAllPreferences fetches all preference sets", async () => {
      const mockResponse: ApiResponse = {
        body: [{ id: "default", channel_types: {}, workflows: {}, categories: null }],
        statusCode: "ok",
        status: 200,
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      const result = await knock.user.getAllPreferences();
      expect(result).toEqual(mockResponse.body);
    });

    test("getPreferences fetches specific preference set", async () => {
      const options: GetPreferencesOptions = { preferenceSet: "default" };
      const mockResponse: ApiResponse = {
        body: { id: "default", channel_types: {}, workflows: {}, categories: null },
        statusCode: "ok",
        status: 200,
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      const result = await knock.user.getPreferences(options);
      expect(result).toEqual(mockResponse.body);
    });

    test("setPreferences updates preference set", async () => {
      const preferences: SetPreferencesProperties = {
        channel_types: { email: true },
        workflows: { "workflow-1": true },
        categories: {},
      };
      const mockResponse: ApiResponse = {
        body: {
          id: "default",
          ...preferences,
        },
        statusCode: "ok",
        status: 200,
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      const result = await knock.user.setPreferences(preferences, { preferenceSet: "default" });
      expect(result).toEqual(mockResponse.body);
    });
  });

  describe("channel data", () => {
    test("getChannelData fetches channel data", async () => {
      const params: GetChannelDataInput = { channelId: "email" };
      const mockResponse: ApiResponse = {
        body: { channel_id: "email", data: {} },
        statusCode: "ok",
        status: 200,
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      const result = await knock.user.getChannelData(params);
      expect(result).toEqual(mockResponse.body);
    });

    test("setChannelData updates channel data", async () => {
      const input: SetChannelDataInput = {
        channelId: "email",
        channelData: { email: "test@example.com" },
      };
      const mockResponse: ApiResponse = {
        body: { channel_id: "email", data: input.channelData },
        statusCode: "ok",
        status: 200,
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      const result = await knock.user.setChannelData(input);
      expect(result).toEqual(mockResponse.body);
    });
  });

  describe("error handling", () => {
    test("handles API errors for get", async () => {
      const mockResponse: ApiResponse = {
        statusCode: "error",
        status: 500,
        error: new Error("API Error"),
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      await expect(knock.user.get()).rejects.toThrow();
    });

    test("handles API errors for identify", async () => {
      const mockResponse: ApiResponse = {
        statusCode: "error",
        status: 500,
        error: new Error("API Error"),
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      await expect(knock.user.identify({ name: "Test" })).rejects.toThrow();
    });

    test("handles API errors for preferences", async () => {
      const mockResponse: ApiResponse = {
        statusCode: "error",
        status: 500,
        error: new Error("API Error"),
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      await expect(knock.user.getAllPreferences()).rejects.toThrow();
      await expect(knock.user.getPreferences({ preferenceSet: "default" })).rejects.toThrow();
      await expect(knock.user.setPreferences({ channel_types: {}, workflows: {}, categories: {} })).rejects.toThrow();
    });

    test("handles API errors for channel data", async () => {
      const mockResponse: ApiResponse = {
        statusCode: "error",
        status: 500,
        error: new Error("API Error"),
      };
      vi.spyOn(knock.client(), "makeRequest").mockResolvedValue(mockResponse);

      await expect(knock.user.getChannelData({ channelId: "email" })).rejects.toThrow();
      await expect(knock.user.setChannelData({ channelId: "email", channelData: {} })).rejects.toThrow();
    });
  });
});
