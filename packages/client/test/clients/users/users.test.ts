// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import type {
  PreferenceSet,
  SetPreferencesProperties,
} from "../../../src/clients/preferences/interfaces";
import UserClient from "../../../src/clients/users";
import type { ChannelData, User } from "../../../src/interfaces";
import Knock from "../../../src/knock";

describe("UserClient", () => {
  const userId = "user_123";
  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
    userId,
    failIfNotAuthenticated: vi.fn(),
  } as unknown as Knock;

  const mockUser: User = {
    id: userId,
    collection: "users",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Test User",
    email: "test@example.com",
    phone_number: null,
    avatar: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    test("fetches the authenticated user", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockUser,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const result = await client.get();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}`,
      });
      expect(result).toEqual(mockUser);
    });

    test("throws error on failed request", async () => {
      const mockError = new Error("Not found");
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "error",
          error: mockError,
          body: undefined,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      await expect(client.get()).rejects.toThrow("Not found");
    });
  });

  describe("identify", () => {
    test("updates user properties", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockUser,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const props = { name: "Updated Name" };
      await client.identify(props);

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}`,
        params: props,
      });
    });
  });

  describe("preferences", () => {
    const mockPreferenceSet: PreferenceSet = {
      id: "default",
      channel_types: {
        in_app_feed: true,
        email: false,
      },
      workflows: {
        onboarding: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
        },
      },
      categories: {
        marketing: {
          channel_types: {
            in_app_feed: true,
            email: false,
          },
        },
      },
    };

    test("gets all preference sets", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: [mockPreferenceSet],
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const result = await client.getAllPreferences();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/preferences`,
      });
      expect(result).toEqual([mockPreferenceSet]);
    });

    test("gets specific preference set", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const result = await client.getPreferences({
        preferenceSet: "default",
        tenant: "tenant_123",
      });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/preferences/default`,
        params: { tenant: "tenant_123" },
      });
      expect(result).toEqual(mockPreferenceSet);
    });

    test("sets preferences", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockPreferenceSet,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const preferences: SetPreferencesProperties = {
        channel_types: {
          in_app_feed: true,
          email: false,
        },
        workflows: {
          onboarding: {
            channel_types: {
              in_app_feed: true,
              email: false,
            },
          },
        },
        categories: {
          marketing: {
            channel_types: {
              in_app_feed: true,
              email: false,
            },
          },
        },
      };
      await client.setPreferences(preferences, { preferenceSet: "default" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/preferences/default`,
        data: preferences,
      });
    });
  });

  describe("channel data", () => {
    const mockChannelData: ChannelData<{ key: string }> = {
      channel_id: "channel_123",
      data: { key: "value" },
    };

    test("gets channel data", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelData,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const result = await client.getChannelData({ channelId: "channel_123" });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/channel_data/channel_123`,
      });
      expect(result).toEqual(mockChannelData);
    });

    test("sets channel data", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelData,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      await client.setChannelData({
        channelId: "channel_123",
        channelData: { key: "value" },
      });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/channel_data/channel_123`,
        data: { data: { key: "value" } },
      });
    });
  });

  describe("guides", () => {
    test("gets guides for a channel", async () => {
      const mockGuides = [{ id: "guide_123", key: "onboarding" }];
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockGuides,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const result = await client.getGuides("channel_123", {
        type: "onboarding",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${userId}/guides/channel_123`,
        params: { type: "onboarding" },
      });
      expect(result).toEqual(mockGuides);
    });

    test("marks guide step status", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: { status: "ok" },
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new UserClient(mockKnock);
      const params = {
        message_id: "msg_123",
        channel_id: "channel_123",
        guide_key: "onboarding",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
      };
      await client.markGuideStepAs("seen", params);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: `/v1/users/${userId}/guides/messages/msg_123/seen`,
        data: params,
      });
    });
  });
});
