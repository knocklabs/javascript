// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import MsTeamsClient from "../../../src/clients/ms-teams";
import type {
  GetMsTeamsChannelsResponse,
  GetMsTeamsTeamsResponse,
  MsTeamsChannel,
  MsTeamsTeam,
} from "../../../src/clients/ms-teams/interfaces";
import { TENANT_OBJECT_COLLECTION } from "../../../src/clients/objects/constants";
import Knock from "../../../src/knock";

describe("MsTeamsClient", () => {
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

      const client = new MsTeamsClient(mockKnock);
      await client.authCheck({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/ms-teams/channel_123/auth_check",
        params: {
          ms_teams_tenant_object: {
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

      const client = new MsTeamsClient(mockKnock);
      await expect(
        client.authCheck({
          tenant: "tenant_123",
          knockChannelId: "channel_123",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getTeams", () => {
    const mockTeam: MsTeamsTeam = {
      id: "team_123",
      displayName: "Test Team",
      description: "Test team description",
    };

    const mockTeamsResponse: GetMsTeamsTeamsResponse = {
      ms_teams_teams: [mockTeam],
      skip_token: null,
    };

    test("fetches teams with default options", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockTeamsResponse,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MsTeamsClient(mockKnock);
      const result = await client.getTeams({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/ms-teams/channel_123/teams",
        params: {
          ms_teams_tenant_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          query_options: {
            $filter: undefined,
            $select: undefined,
            $top: undefined,
            $skiptoken: undefined,
          },
        },
      });
      expect(result).toEqual(mockTeamsResponse);
    });

    test("fetches teams with query options", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockTeamsResponse,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MsTeamsClient(mockKnock);
      await client.getTeams({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
        queryOptions: {
          $filter: "displayName eq 'Test Team'",
          $select: "id,displayName",
          $top: 10,
          $skiptoken: "token_123",
        },
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/ms-teams/channel_123/teams",
        params: {
          ms_teams_tenant_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          query_options: {
            $filter: "displayName eq 'Test Team'",
            $select: "id,displayName",
            $top: 10,
            $skiptoken: "token_123",
          },
        },
      });
    });
  });

  describe("getChannels", () => {
    const mockChannel: MsTeamsChannel = {
      id: "channel_123",
      displayName: "Test Channel",
      description: "Test channel description",
      membershipType: "standard",
      isArchived: false,
      createdDateTime: new Date().toISOString(),
    };

    const mockChannelsResponse: GetMsTeamsChannelsResponse = {
      ms_teams_channels: [mockChannel],
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

      const client = new MsTeamsClient(mockKnock);
      const result = await client.getChannels({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
        teamId: "team_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/ms-teams/channel_123/channels",
        params: {
          ms_teams_tenant_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          team_id: "team_123",
          query_options: {
            $filter: undefined,
            $select: undefined,
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

      const client = new MsTeamsClient(mockKnock);
      await client.getChannels({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
        teamId: "team_123",
        queryOptions: {
          $filter: "displayName eq 'Test Channel'",
          $select: "id,displayName",
        },
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/providers/ms-teams/channel_123/channels",
        params: {
          ms_teams_tenant_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          team_id: "team_123",
          query_options: {
            $filter: "displayName eq 'Test Channel'",
            $select: "id,displayName",
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

      const client = new MsTeamsClient(mockKnock);
      await client.revokeAccessToken({
        tenant: "tenant_123",
        knockChannelId: "channel_123",
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "/v1/providers/ms-teams/channel_123/revoke_access",
        params: {
          ms_teams_tenant_object: {
            object_id: "tenant_123",
            collection: TENANT_OBJECT_COLLECTION,
          },
          channel_id: "channel_123",
        },
      });
    });
  });
});
