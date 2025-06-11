import { describe, expect, test, vi } from "vitest";

import ObjectClient from "../../../src/clients/objects";
import type { ChannelData } from "../../../src/interfaces";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

describe("Object Client", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);
    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  describe("Channel Data Management", () => {
    describe("Getting Channel Data", () => {
      test("fetches channel data for an object successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          const mockChannelData: ChannelData<{ key: string }> = {
            channel_id: "channel_123",
            data: { key: "value" },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockChannelData,
          });

          const client = new ObjectClient(knock);
          const result = await client.getChannelData({
            objectId: "obj_123",
            collection: "users",
            channelId: "channel_123",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/objects/users/obj_123/channel_data/channel_123",
          });
          expect(result).toEqual(mockChannelData);
        } finally {
          cleanup();
        }
      });

      test("handles complex nested data structures", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          const complexData = {
            channel_id: "channel_456",
            data: {
              preferences: {
                notifications: { email: true, sms: false },
                timezone: "UTC",
              },
              metadata: { lastUpdated: "2023-01-01T00:00:00Z" },
              customFields: ["field1", "field2", "field3"],
            },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: complexData,
          });

          const client = new ObjectClient(knock);
          const result = await client.getChannelData({
            objectId: "obj_456",
            collection: "organizations",
            channelId: "channel_456",
          });

          expect(result).toEqual(complexData);
          expect(result.data.preferences.notifications.email).toBe(true);
        } finally {
          cleanup();
        }
      });
    });

    describe("Setting Channel Data", () => {
      test("sets channel data for an object successfully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          const inputData = { key: "value", timestamp: Date.now() };
          const mockResponse: ChannelData<typeof inputData> = {
            channel_id: "channel_123",
            data: inputData,
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: mockResponse,
          });

          const client = new ObjectClient(knock);
          const result = await client.setChannelData({
            objectId: "obj_123",
            collection: "users",
            channelId: "channel_123",
            data: inputData,
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "v1/objects/users/obj_123/channel_data/channel_123",
            data: { data: inputData },
          });
          expect(result).toEqual(mockResponse);
        } finally {
          cleanup();
        }
      });

      test("handles large data payloads efficiently", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          // Create a large data structure
          const largeData = {
            items: Array.from({ length: 1000 }, (_, i) => ({
              id: `item_${i}`,
              value: `value_${i}`,
              metadata: { index: i, created: new Date().toISOString() },
            })),
            summary: { total: 1000, processed: 1000 },
          };

          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { channel_id: "channel_789", data: largeData },
          });

          const client = new ObjectClient(knock);
          await client.setChannelData({
            objectId: "obj_789",
            collection: "bulk_operations",
            channelId: "channel_789",
            data: largeData,
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "PUT",
            url: "v1/objects/bulk_operations/obj_789/channel_data/channel_789",
            data: { data: largeData },
          });
        } finally {
          cleanup();
        }
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    describe("Network Error Scenarios", () => {
      test("handles get channel data errors gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        // Suppress console.error for expected error scenarios
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const mockError = new Error("Not found");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: mockError,
            body: undefined,
          });

          const client = new ObjectClient(knock);
          await expect(
            client.getChannelData({
              objectId: "obj_123",
              collection: "users",
              channelId: "channel_123",
            }),
          ).rejects.toThrow("Not found");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });

      test("handles set channel data errors gracefully", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        // Suppress console.error for expected error scenarios
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const mockError = new Error("Invalid data");
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "error",
            error: mockError,
            body: undefined,
          });

          const client = new ObjectClient(knock);
          await expect(
            client.setChannelData({
              objectId: "obj_123",
              collection: "users",
              channelId: "channel_123",
              data: { key: "value" },
            }),
          ).rejects.toThrow("Invalid data");
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });

      test("handles different error types appropriately", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        try {
          const errorScenarios = [
            {
              error: new Error("Network timeout"),
              expectedMessage: "Network timeout",
            },
            {
              error: new Error("Unauthorized access"),
              expectedMessage: "Unauthorized access",
            },
            {
              error: new Error("Rate limit exceeded"),
              expectedMessage: "Rate limit exceeded",
            },
          ];

          const client = new ObjectClient(knock);

          for (const scenario of errorScenarios) {
            mockApiClient.makeRequest.mockResolvedValueOnce({
              statusCode: "error",
              error: scenario.error,
            });

            await expect(
              client.getChannelData({
                objectId: "obj_test",
                collection: "test",
                channelId: "channel_test",
              }),
            ).rejects.toThrow(scenario.expectedMessage);
          }
        } finally {
          consoleSpy.mockRestore();
          cleanup();
        }
      });
    });

    describe("Input Validation", () => {
      test("handles special characters in identifiers", async () => {
        const { knock, mockApiClient, cleanup } = getTestSetup();

        try {
          mockApiClient.makeRequest.mockResolvedValue({
            statusCode: "ok",
            body: { channel_id: "channel-with-dashes", data: {} },
          });

          const client = new ObjectClient(knock);
          await client.getChannelData({
            objectId: "obj-with-dashes_and_underscores",
            collection: "special-collection",
            channelId: "channel-with-dashes",
          });

          expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
            method: "GET",
            url: "/v1/objects/special-collection/obj-with-dashes_and_underscores/channel_data/channel-with-dashes",
          });
        } finally {
          cleanup();
        }
      });
    });

    describe("Error Handling", () => {
      test("throws error when status code indicates error", async () => {
        const { knock, mockApiClient } = getTestSetup();

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: "Object not found",
          body: "Invalid object ID",
        });

        const client = new ObjectClient(knock);

        await expect(
          client.getChannelData({
            collection: "tenants",
            objectId: "invalid_id",
            channelId: "email",
          }),
        ).rejects.toThrow("Object not found");
      });

      test("throws error body when error is null", async () => {
        const { knock, mockApiClient } = getTestSetup();

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          error: null,
          body: "Service unavailable",
        });

        const client = new ObjectClient(knock);

        await expect(
          client.setChannelData({
            collection: "tenants",
            objectId: "tenant_123",
            channelId: "email",
            data: { key: "value" },
          }),
        ).rejects.toThrow("Service unavailable");
      });
    });
  });

  describe("Performance and Integration", () => {
    test("handles concurrent requests efficiently", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        // Mock multiple successful responses
        mockApiClient.makeRequest.mockImplementation(() =>
          Promise.resolve({
            statusCode: "ok",
            body: { channel_id: "test", data: { success: true } },
          }),
        );

        const client = new ObjectClient(knock);
        const startTime = Date.now();

        // Make multiple concurrent requests
        const requests = Array.from({ length: 10 }, (_, i) =>
          client.getChannelData({
            objectId: `obj_${i}`,
            collection: "concurrent_test",
            channelId: `channel_${i}`,
          }),
        );

        const results = await Promise.all(requests);
        const endTime = Date.now();

        // All requests should succeed
        expect(results).toHaveLength(10);
        results.forEach((result) => {
          expect(result.data.success).toBe(true);
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
        const client = new ObjectClient(knock);

        // Verify proper integration
        expect(client).toBeInstanceOf(ObjectClient);

        // Verify that the client would use the same API client instance
        // (without actually making a request)
        expect(knock.client()).toBe(mockApiClient);
      } finally {
        cleanup();
      }
    });
  });
});
