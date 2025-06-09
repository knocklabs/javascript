// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import { TENANT_OBJECT_COLLECTION } from "../../../src/clients/objects/constants";
import SlackClient from "../../../src/clients/slack";
import type {
  GetSlackChannelsResponse,
  SlackChannel,
} from "../../../src/clients/slack/interfaces";
import Knock from "../../../src/knock";

describe("SlackClient", () => {
  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
  } as unknown as Knock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authCheck", () => {
    test("checks authentication status", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: { authenticated: true },
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new SlackClient(mockKnock);
      await client.authCheck({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/slack/channel_123/auth_check",
        params: {
          access_token_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          channel_id: "channel_123",
        },
      });
    });

    test("handles error responses", async () => {
      const mockError = new Error("Unauthorized");
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

      const client = new SlackClient(mockKnock);
      await expect(
        client.authCheck({
          tenant: "tenant_123",
          knockChannelId: "channel_123",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getChannels", () => {
    const mockChannel: SlackChannel = {
      id: "channel_123",
      name: "test-channel",
      is_private: false,
      is_im: false,
      context_team_id: false,
    };

    const mockChannelsResponse: GetSlackChannelsResponse = {
      slack_channels: [mockChannel],
      next_cursor: null,
    };

    test("fetches channels with default options", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelsResponse,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new SlackClient(mockKnock);
      const result = await client.getChannels({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/slack/channel_123/channels",
        params: {
          access_token_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          channel_id: "channel_123",
          query_options: {
            cursor: undefined,
            limit: undefined,
            exclude_archived: undefined,
            team_id: undefined,
            types: undefined,
          },
        },
      });
      expect(result).toEqual(mockChannelsResponse);
    });

    test("fetches channels with query options", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelsResponse,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new SlackClient(mockKnock);
      await client.getChannels({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
        queryOptions: {
          cursor: "next_page",
          limit: 10,
          excludeArchived: true,
          teamId: "team_123",
          types: "public_channel,private_channel",
        },
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/slack/channel_123/channels",
        params: {
          access_token_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          channel_id: "channel_123",
          query_options: {
            cursor: "next_page",
            limit: 10,
            exclude_archived: true,
            team_id: "team_123",
            types: "public_channel,private_channel",
          },
        },
      });
    });
  });

  describe("revokeAccessToken", () => {
    test("revokes access token", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: { success: true },
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new SlackClient(mockKnock);
      await client.revokeAccessToken({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/providers/slack/channel_123/revoke_access",
        params: {
          access_token_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          channel_id: "channel_123",
        },
      });
    });
  });
});
