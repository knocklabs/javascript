// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import MessageClient from "../../../src/clients/messages";
import type {
  BulkUpdateMessagesInChannelProperties,
  Message,
  MessageEngagementStatus,
} from "../../../src/clients/messages/interfaces";
import {
  createApiError,
  createArchivedMessage,
  createBulkOperationScenario,
  createInteractedMessage,
  createMockMessage,
  createMockMessages,
  createReadMessage,
  createUnreadMessage,
  createUserJourneyScenario,
} from "../../test-utils/fixtures";
import {
  createErrorResponse,
  createSuccessResponse,
  expectApiRequest,
  expectValidResponse,
  setupBatchOperationTest,
  setupErrorScenario,
  setupMessageClientTest,
  useTestHooks,
} from "../../test-utils/test-setup";

/**
 * Modern Message Client Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic message fixtures
 * - Comprehensive error handling
 * - Batch operation testing
 * - Performance characteristics validation
 */
describe("MessageClient", () => {
  describe("Message Retrieval", () => {
    const getTestSetup = useTestHooks(() => setupMessageClientTest());

    test("retrieves individual messages successfully", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessage = createMockMessage();

        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse(mockMessage),
        );

        const result = await messageClient.get(mockMessage.id);

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "GET",
          url: `/v1/messages/${mockMessage.id}`,
        });

        expectValidResponse(result, (message) => {
          expect(message.id).toBe(mockMessage.id);
          expect(message.status).toBe("sent");
        });
      } finally {
        cleanup();
      }
    });

    test("handles message not found gracefully", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const notFoundError = createApiError("not-found", "Message not found");

        mockApiClient.makeRequest.mockResolvedValue(
          createErrorResponse(notFoundError, 404),
        );

        await expect(messageClient.get("non-existent-id")).rejects.toThrow(
          "Message not found",
        );

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/messages/non-existent-id",
        });
      } finally {
        cleanup();
      }
    });

    test("handles network errors during retrieval", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const networkError = createApiError("network");

        mockApiClient.makeRequest.mockResolvedValue(
          createErrorResponse(networkError, 0),
        );

        await expect(messageClient.get("message-id")).rejects.toThrow(
          "Network request failed",
        );
      } finally {
        cleanup();
      }
    });
  });

  describe("Message Status Management", () => {
    const getTestSetup = useTestHooks(() => setupMessageClientTest());

    describe("individual status updates", () => {
      const statusTestCases: Array<{
        status: MessageEngagementStatus;
        createMessage: () => Message;
        expectedProperty: string;
        metadata?: Record<string, string>;
      }> = [
        {
          status: "seen",
          createMessage: () => createUnreadMessage(),
          expectedProperty: "seen_at",
        },
        {
          status: "read",
          createMessage: () => createUnreadMessage(),
          expectedProperty: "read_at",
        },
        {
          status: "archived",
          createMessage: () => createReadMessage(),
          expectedProperty: "archived_at",
        },
        {
          status: "interacted",
          createMessage: () => createUnreadMessage(),
          expectedProperty: "interacted_at",
          metadata: { action: "clicked", target: "button" },
        },
      ];

      test.each(statusTestCases)(
        "updates message status to $status",
        async ({ status, createMessage, expectedProperty, metadata }) => {
          const { messageClient, mockApiClient, cleanup } = getTestSetup();

          try {
            const message = createMessage();
            const updatedMessage = {
              ...message,
              [expectedProperty]: new Date().toISOString(),
            };

            mockApiClient.makeRequest.mockResolvedValue(
              createSuccessResponse(updatedMessage),
            );

            await messageClient.updateStatus(
              message.id,
              status,
              metadata ? { metadata } : undefined,
            );

            expectApiRequest(mockApiClient).toHaveBeenCalledWith({
              method: "PUT",
              url: `/v1/messages/${message.id}/${status}`,
              data: status === "interacted" ? { metadata } : undefined,
            });
          } finally {
            cleanup();
          }
        },
      );
    });

    describe("status removal operations", () => {
      const removalTestCases: Array<
        Exclude<MessageEngagementStatus, "interacted">
      > = ["seen", "read", "archived"];

      test.each(removalTestCases)(
        "removes %s status from message",
        async (status) => {
          const { messageClient, mockApiClient, cleanup } = getTestSetup();

          try {
            const message = createMockMessage({
              [`${status}_at`]: new Date().toISOString(),
            });

            const updatedMessage = {
              ...message,
              [`${status}_at`]: null,
            };

            mockApiClient.makeRequest.mockResolvedValue(
              createSuccessResponse(updatedMessage),
            );

            await messageClient.removeStatus(message.id, status);

            expectApiRequest(mockApiClient).toHaveBeenCalledWith({
              method: "DELETE",
              url: `/v1/messages/${message.id}/${status}`,
            });
          } finally {
            cleanup();
          }
        },
      );
    });

    test("handles status update failures gracefully", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const message = createUnreadMessage();
        const validationError = createApiError(
          "validation",
          "Invalid status transition",
        );

        mockApiClient.makeRequest.mockResolvedValue(
          createErrorResponse(validationError, 400),
        );

        await expect(
          messageClient.updateStatus(message.id, "read"),
        ).rejects.toThrow("Invalid status transition");
      } finally {
        cleanup();
      }
    });
  });

  describe("Batch Operations", () => {
    const getTestSetup = useTestHooks(() => setupMessageClientTest());

    test("performs batch status updates efficiently", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const { messageIds } = createBulkOperationScenario(50);
        const updatedMessages = messageIds.map((id) =>
          createReadMessage({ id }),
        );

        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse(updatedMessages),
        );

        const result = await messageClient.batchUpdateStatuses(
          messageIds,
          "read",
        );

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/read",
          data: { message_ids: messageIds },
        });

        expectValidResponse(result, (messages) => {
          expect(messages).toHaveLength(50);
          messages.forEach((message) => {
            expect(message.read_at).toBeTruthy();
          });
        });
      } finally {
        cleanup();
      }
    });

    test("handles batch operations with metadata", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const messageIds = ["msg_1", "msg_2", "msg_3"];
        const metadata = { campaign: "newsletter", source: "email" };

        mockApiClient.makeRequest.mockResolvedValue(createSuccessResponse([]));

        await messageClient.batchUpdateStatuses(messageIds, "interacted", {
          metadata,
        });

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/interacted",
          data: { message_ids: messageIds, metadata },
        });
      } finally {
        cleanup();
      }
    });

    test("handles partial batch failures gracefully", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const messageIds = ["valid_msg", "invalid_msg", "another_valid"];

        // Simulate partial failure response
        const partialError = new Error("Some messages could not be updated");
        mockApiClient.makeRequest.mockResolvedValue(
          createErrorResponse(partialError, 207), // Multi-status
        );

        await expect(
          messageClient.batchUpdateStatuses(messageIds, "seen"),
        ).rejects.toThrow("Some messages could not be updated");
      } finally {
        cleanup();
      }
    });
  });

  describe("Bulk Channel Operations", () => {
    const getTestSetup = useTestHooks(() => setupMessageClientTest());

    test("updates all messages in channel", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const channelId = "channel_123";
        const updateProperties: BulkUpdateMessagesInChannelProperties = {
          channelId,
          status: "read",
          options: {
            user_ids: ["user_1", "user_2"],
          },
        };

        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse({ id: "bulk_123", status: "completed" }),
        );

        const result =
          await messageClient.bulkUpdateAllStatusesInChannel(updateProperties);

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "POST",
          url: `/v1/channels/${channelId}/messages/bulk/${updateProperties.status}`,
          data: updateProperties.options,
        });

        expect(result.id).toBe("bulk_123");
      } finally {
        cleanup();
      }
    });

    test("supports advanced filtering options", async () => {
      const { messageClient, mockApiClient, cleanup } = getTestSetup();

      try {
        const updateProperties: BulkUpdateMessagesInChannelProperties = {
          channelId: "channel_123",
          status: "archive",
          options: {
            user_ids: ["user_1"],
            engagement_status: "read",
            has_tenant: true,
            tenants: ["tenant_a", "tenant_b"],
          },
        };

        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse({ id: "bulk_456", status: "completed" }),
        );

        await messageClient.bulkUpdateAllStatusesInChannel(updateProperties);

        expectApiRequest(mockApiClient).toHaveBeenCalledWith({
          method: "POST",
          url: `/v1/channels/${updateProperties.channelId}/messages/bulk/${updateProperties.status}`,
          data: updateProperties.options,
        });
      } finally {
        cleanup();
      }
    });
  });

  describe("Error Recovery and Edge Cases", () => {
    test("handles malformed message data gracefully", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        // Test with various invalid inputs
        const invalidInputs = [
          null,
          undefined,
          "",
          "   ", // whitespace only
          "invalid-id-format",
        ];

        for (const invalidId of invalidInputs) {
          mockApiClient.makeRequest.mockResolvedValue(
            createErrorResponse(createApiError("validation"), 400),
          );

          await expect(messageClient.get(invalidId as any)).rejects.toThrow();
        }
      } finally {
        cleanup();
      }
    });

    test("handles concurrent status updates without race conditions", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        const message = createUnreadMessage();

        // Set up responses for concurrent operations
        mockApiClient.makeRequest
          .mockResolvedValueOnce(
            createSuccessResponse(
              createMockMessage({ seen_at: new Date().toISOString() }),
            ),
          )
          .mockResolvedValueOnce(
            createSuccessResponse(
              createMockMessage({ read_at: new Date().toISOString() }),
            ),
          )
          .mockResolvedValueOnce(
            createSuccessResponse(
              createMockMessage({ interacted_at: new Date().toISOString() }),
            ),
          );

        // Perform concurrent status updates
        const operations = [
          () => messageClient.updateStatus(message.id, "seen"),
          () => messageClient.updateStatus(message.id, "read"),
          () =>
            messageClient.updateStatus(message.id, "interacted", {
              metadata: { action: "click" },
            }),
        ];

        const results = await Promise.allSettled(operations.map((op) => op()));

        // All operations should complete successfully
        const successful = results.filter((r) => r.status === "fulfilled");
        expect(successful).toHaveLength(3);
      } finally {
        cleanup();
      }
    });

    test("provides meaningful error messages for API failures", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        const errorScenarios = [
          {
            name: "rate limit",
            error: createApiError("rate-limit"),
            expectedMessage: "Rate limit exceeded",
          },
          {
            name: "server error",
            error: createApiError("server"),
            expectedMessage: "Internal server error",
          },
          {
            name: "validation error",
            error: createApiError("validation", "Invalid message format"),
            expectedMessage: "Invalid message format",
          },
        ];

        for (const scenario of errorScenarios) {
          mockApiClient.makeRequest.mockResolvedValue(
            createErrorResponse(scenario.error),
          );

          await expect(messageClient.get("test-id")).rejects.toThrow(
            scenario.expectedMessage,
          );
        }
      } finally {
        cleanup();
      }
    });
  });

  describe("Performance Characteristics", () => {
    test("handles large batch operations efficiently", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        const { messageIds } = createBulkOperationScenario(1000);

        // Mock successful batch response
        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse(
            messageIds.map((id) => createReadMessage({ id })),
          ),
        );

        const startTime = Date.now();

        await messageClient.batchUpdateStatuses(messageIds, "read");

        const duration = Date.now() - startTime;

        // Should handle large batches efficiently
        expect(duration).toBeLessThan(100); // Reasonable for mock operation

        expectApiRequest(mockApiClient).toHaveBeenCalledTimes(1);
      } finally {
        cleanup();
      }
    });

    test("maintains consistent API usage patterns", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        const message = createMockMessage();

        mockApiClient.makeRequest.mockResolvedValue(
          createSuccessResponse(message),
        );

        // Perform multiple operations to verify consistent patterns
        await messageClient.get(message.id);
        await messageClient.updateStatus(message.id, "seen");
        await messageClient.removeStatus(message.id, "seen");

        // Should make exactly 3 API calls
        expectApiRequest(mockApiClient).toHaveBeenCalledTimes(3);

        // All calls should follow the same base URL pattern
        const calls = mockApiClient.makeRequest.mock.calls;
        calls.forEach(([request]: [any]) => {
          expect(request.url).toMatch(/^\/v1\/messages/);
        });
      } finally {
        cleanup();
      }
    });
  });

  describe("User Journey Scenarios", () => {
    test("supports complete message engagement workflow", async () => {
      const { messageClient, mockApiClient, cleanup } =
        setupMessageClientTest();

      try {
        const { messages } = createUserJourneyScenario();
        const message = messages[0];

        if (!message) {
          throw new Error("No message available in test scenario");
        }

        // Mock responses for the complete workflow
        mockApiClient.makeRequest
          .mockResolvedValueOnce(createSuccessResponse(message)) // get
          .mockResolvedValueOnce(
            createSuccessResponse({
              ...message,
              seen_at: new Date().toISOString(),
            }),
          ) // mark seen
          .mockResolvedValueOnce(
            createSuccessResponse({
              ...message,
              read_at: new Date().toISOString(),
            }),
          ) // mark read
          .mockResolvedValueOnce(
            createSuccessResponse({
              ...message,
              interacted_at: new Date().toISOString(),
            }),
          ) // interact
          .mockResolvedValueOnce(
            createSuccessResponse({
              ...message,
              archived_at: new Date().toISOString(),
            }),
          ); // archive

        // Complete user journey
        const fetchedMessage = await messageClient.get(message.id);
        await messageClient.updateStatus(message.id, "seen");
        await messageClient.updateStatus(message.id, "read");
        await messageClient.updateStatus(message.id, "interacted", {
          metadata: { action: "button_click", element: "cta" },
        });
        await messageClient.updateStatus(message.id, "archived");

        // Verify the complete journey was executed
        expectApiRequest(mockApiClient).toHaveBeenCalledTimes(5);
        expect(fetchedMessage.id).toBe(message.id);
      } finally {
        cleanup();
      }
    });
  });
});
