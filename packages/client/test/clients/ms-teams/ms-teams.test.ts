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
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

/**
 * Modern MS Teams Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Comprehensive error scenario testing
 * - Proper cleanup and resource management
 */
describe("Microsoft Teams Client", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);
    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
  } as unknown as Knock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Management", () => {
    test("checks authentication status successfully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: { authenticated: true },
        });

        const client = new MsTeamsClient(knock);
        const result = await client.authCheck({
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

        expect(result).toEqual({ authenticated: true });
      } finally {
        cleanup();
      }
    });

    test("handles authentication errors gracefully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      // Suppress console.error for expected error scenarios
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const mockError = new Error("Unauthorized");
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: mockError,
          body: undefined,
        });

        const client = new MsTeamsClient(knock);
        await expect(
          client.authCheck({
            tenant: "tenant_123",
            knockChannelId: "channel_123",
          }),
        ).rejects.toThrow("Unauthorized");
      } finally {
        consoleSpy.mockRestore();
        cleanup();
      }
    });
  });

  describe("Teams Management", () => {
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
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockTeamsResponse,
        });

        const client = new MsTeamsClient(knock);
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
      } finally {
        cleanup();
      }
    });

    test("fetches teams with comprehensive query options", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const extendedTeamsResponse = {
          ms_teams_teams: [
            mockTeam,
            {
              id: "team_456",
              displayName: "Engineering Team",
              description: "Development team",
            },
          ],
          skip_token: "next_page_token",
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: extendedTeamsResponse,
        });

        const client = new MsTeamsClient(knock);
        const result = await client.getTeams({
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

        expect(result).toEqual(extendedTeamsResponse);
        expect(result.ms_teams_teams).toHaveLength(2);
      } finally {
        cleanup();
      }
    });

    test("handles empty teams response gracefully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const emptyResponse: GetMsTeamsTeamsResponse = {
          ms_teams_teams: [],
          skip_token: null,
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: emptyResponse,
        });

        const client = new MsTeamsClient(knock);
        const result = await client.getTeams({
          tenant: "tenant_123",
          knockChannelId: "channel_123",
        });

        expect(result.ms_teams_teams).toEqual([]);
        expect(result.skip_token).toBeNull();
      } finally {
        cleanup();
      }
    });
  });

  describe("Channels Management", () => {
    const mockChannel: MsTeamsChannel = {
      id: "channel_123",
      displayName: "Test Channel",
      description: "Test channel description",
      membershipType: "standard",
      isArchived: false,
      createdDateTime: "2023-01-01T00:00:00Z",
    };

    const mockChannelsResponse: GetMsTeamsChannelsResponse = {
      ms_teams_channels: [mockChannel],
    };

    test("fetches channels successfully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockChannelsResponse,
        });

        const client = new MsTeamsClient(knock);
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
      } finally {
        cleanup();
      }
    });

    test("handles multiple channel types", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const multiChannelResponse = {
          ms_teams_channels: [
            mockChannel,
            {
              id: "channel_456",
              displayName: "Private Channel",
              description: "Private channel",
              membershipType: "private",
              isArchived: false,
              createdDateTime: "2023-01-02T00:00:00Z",
            },
            {
              id: "channel_789",
              displayName: "Archived Channel",
              description: "Archived channel",
              membershipType: "standard",
              isArchived: true,
              createdDateTime: "2023-01-03T00:00:00Z",
            },
          ],
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: multiChannelResponse,
        });

        const client = new MsTeamsClient(knock);
        const result = await client.getChannels({
          tenant: "tenant_123",
          knockChannelId: "channel_123",
          teamId: "team_123",
        });

        expect(result.ms_teams_channels).toHaveLength(3);
        expect(result.ms_teams_channels[1]?.membershipType).toBe("private");
        expect(result.ms_teams_channels[2]?.isArchived).toBe(true);
      } finally {
        cleanup();
      }
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("handles various error scenarios", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const errorScenarios = [
          {
            error: new Error("Team not found"),
            expectedMessage: "Team not found",
          },
          {
            error: new Error("Permission denied"),
            expectedMessage: "Permission denied",
          },
          {
            error: new Error("Rate limit exceeded"),
            expectedMessage: "Rate limit exceeded",
          },
        ];

        const client = new MsTeamsClient(knock);

        for (const scenario of errorScenarios) {
          mockApiClient.makeRequest.mockResolvedValueOnce({
            statusCode: "error",
            error: scenario.error,
          });

          await expect(
            client.getTeams({
              tenant: "tenant_test",
              knockChannelId: "channel_test",
            }),
          ).rejects.toThrow(scenario.expectedMessage);
        }
      } finally {
        consoleSpy.mockRestore();
        cleanup();
      }
    });

    test("handles network errors during channel operations", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        const networkError = new Error("Network timeout");
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: networkError,
        });

        const client = new MsTeamsClient(knock);
        await expect(
          client.getChannels({
            tenant: "tenant_123",
            knockChannelId: "channel_123",
            teamId: "team_123",
          }),
        ).rejects.toThrow("Network timeout");
      } finally {
        consoleSpy.mockRestore();
        cleanup();
      }
    });
  });

  describe("Performance and Integration", () => {
    test("handles concurrent operations efficiently", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        // Mock successful responses for concurrent operations
        mockApiClient.makeRequest.mockImplementation(() =>
          Promise.resolve({
            statusCode: "ok",
            body: { authenticated: true },
          }),
        );

        const client = new MsTeamsClient(knock);
        const startTime = Date.now();

        // Make multiple concurrent auth checks
        const requests = Array.from({ length: 3 }, (_, i) =>
          client.authCheck({
            tenant: `tenant_${i}`,
            knockChannelId: `channel_${i}`,
          }),
        );

        const results = await Promise.all(requests);
        const endTime = Date.now();

        // All requests should succeed
        expect(results).toHaveLength(3);
        results.forEach((result) => {
          expect(result.authenticated).toBe(true);
        });

        // Should handle concurrency efficiently
        expect(endTime - startTime).toBeLessThan(1000);
      } finally {
        cleanup();
      }
    });

    test("integrates properly with Knock client", () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const client = new MsTeamsClient(knock);

        // Verify proper integration
        expect(client).toBeInstanceOf(MsTeamsClient);

        // Verify that the client uses the same API client instance
        expect(knock.client()).toBe(mockApiClient);
      } finally {
        cleanup();
      }
    });
  });
});
