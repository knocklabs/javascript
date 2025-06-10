// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TENANT_OBJECT_COLLECTION } from "../../../src/clients/objects/constants";
import SlackClient from "../../../src/clients/slack";
import type {
  GetSlackChannelsResponse,
  SlackChannel,
} from "../../../src/clients/slack/interfaces";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

/**
 * Modern Slack Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Comprehensive error scenario testing
 * - Proper cleanup and resource management
 */
describe("Slack Client", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);
    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  describe("Authentication Management", () => {
    describe("Authentication Check", () => {
      test("checks authentication status successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { authenticated: true },
          });

          const client = new SlackClient(knock);
          const result = await client.authCheck({
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

          expect(result).toEqual({ authenticated: true });
        } finally {
          cleanup();
        }
      });

      test("handles authentication check failures gracefully", async () => {
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

          const client = new SlackClient(knock);
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

      test("handles different authentication error scenarios", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const errorScenarios = [
            {
              error: new Error("Token expired"),
              expectedMessage: "Token expired",
            },
            {
              error: new Error("Invalid workspace"),
              expectedMessage: "Invalid workspace",
            },
            {
              error: new Error("Rate limit exceeded"),
              expectedMessage: "Rate limit exceeded",
            },
          ];

          const client = new SlackClient(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(
              client.authCheck({
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
    });

    describe("Access Token Management", () => {
      test("revokes access token successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { success: true },
          });

          const client = new SlackClient(knock);
          const result = await client.revokeAccessToken({
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

          expect(result).toEqual({ success: true });
        } finally {
          cleanup();
        }
      });

      test("handles access token revocation errors", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const mockError = new Error("Failed to revoke token");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: mockError,
          });

          const client = new SlackClient(knock);
          await expect(
            client.revokeAccessToken({
              tenant: "tenant_123",
              knockChannelId: "channel_123",
            }),
          ).rejects.toThrow("Failed to revoke token");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });
  });

  describe("Channel Management", () => {
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

    describe("Channel Retrieval", () => {
      test("fetches channels with default options", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockChannelsResponse,
          });

          const client = new SlackClient(knock);
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
        } finally {
          cleanup();
        }
      });

      test("fetches channels with comprehensive query options", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          const advancedChannelsResponse = {
            slack_channels: [
              mockChannel,
              {
                id: "channel_456",
                name: "private-channel",
                is_private: true,
                is_im: false,
                context_team_id: false,
              },
            ],
            next_cursor: "next_page_token",
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: advancedChannelsResponse,
          });

          const client = new SlackClient(knock);
          const result = await client.getChannels({
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

          expect(result).toEqual(advancedChannelsResponse);
          expect(result.slack_channels).toHaveLength(2);
          expect(result.next_cursor).toBe("next_page_token");
        } finally {
          cleanup();
        }
      });

      test("handles empty channel lists gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          const emptyResponse: GetSlackChannelsResponse = {
            slack_channels: [],
            next_cursor: null,
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: emptyResponse,
          });

          const client = new SlackClient(knock);
          const result = await client.getChannels({
            tenant: "tenant_123",
            knockChannelId: "channel_123",
          });

          expect(result.slack_channels).toEqual([]);
          expect(result.next_cursor).toBeNull();
        } finally {
          cleanup();
        }
      });
    });

    describe("Channel Error Handling", () => {
      test("handles channel retrieval errors appropriately", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const errorScenarios = [
            {
              error: new Error("Workspace not found"),
              expectedMessage: "Workspace not found",
            },
            {
              error: new Error("Permission denied"),
              expectedMessage: "Permission denied",
            },
            {
              error: new Error("API rate limit exceeded"),
              expectedMessage: "API rate limit exceeded",
            },
          ];

          const client = new SlackClient(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(
              client.getChannels({
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
    });
  });

  describe("Integration and Performance", () => {
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

        const client = new SlackClient(knock);
        const startTime = Date.now();

        // Make multiple concurrent auth checks
        const requests = Array.from({ length: 5 }, (_, i) =>
          client.authCheck({
            tenant: `tenant_${i}`,
            knockChannelId: `channel_${i}`,
          }),
        );

        const results = await Promise.all(requests);
        const endTime = Date.now();

        // All requests should succeed
        expect(results).toHaveLength(5);
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
        const client = new SlackClient(knock);

        // Verify proper integration
        expect(client).toBeInstanceOf(SlackClient);

        // Verify that the client uses the same API client instance
        expect(knock.client()).toBe(mockApiClient);
      } finally {
        cleanup();
      }
    });
  });

  describe("Error Handling", () => {
    test("returns error response for client errors", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: { response: { status: 400 } }, // Client error
          body: "Bad Request",
        });

        const client = new SlackClient(knock);
        const result = await client.getChannels({
          tenant: "tenant_123",
          knockChannelId: "channel_123",
        });

        // Should return the error object for client errors
        expect(result).toEqual({ response: { status: 400 } });
      } finally {
        cleanup();
      }
    });

    test("throws error for server errors", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: { response: { status: 500 } }, // Server error
          body: "Internal Server Error",
        });

        const client = new SlackClient(knock);

        await expect(
          client.authCheck({
            tenant: "tenant_123",
            knockChannelId: "channel_123",
          }),
        ).rejects.toThrow();
      } finally {
        cleanup();
      }
    });

    test("throws error body when error is null", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: null,
          body: "Service Unavailable",
        });

        const client = new SlackClient(knock);

        await expect(
          client.revokeAccessToken({
            tenant: "tenant_123",
            knockChannelId: "channel_123",
          }),
        ).rejects.toThrow("Service Unavailable");
      } finally {
        cleanup();
      }
    });
  });
});
