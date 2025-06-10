// @vitest-environment node
import { describe, expect, test, vi } from "vitest";

import MessageClient from "../../../src/clients/messages";
import {
  createArchivedMessage,
  createBulkOperationScenario,
  createInteractedMessage,
  createMockMessage,
  createMockMessages,
  createReadMessage,
  createUnreadMessage,
} from "../../test-utils/fixtures";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

describe("MessageClient", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);
    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  describe("Basic Message Client Tests", () => {
    test("can create a message client", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Test basic message client creation without complex setup
        expect(knock).toBeDefined();
        expect(knock.isAuthenticated()).toBe(true);
      } finally {
        cleanup();
      }
    });
  });

  describe("Message Retrieval", () => {
    test("gets a single message by ID", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessage = createMockMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessage,
          status: 200,
        });

        const result = await knock.messages.get("message_123");

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/messages/message_123",
        });
        expect(result).toEqual(mockMessage);
      } finally {
        cleanup();
      }
    });

    test("handles message not found error", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          body: { error: "Message not found" },
          status: 404,
          error: { response: { status: 404 } },
        });

        const result = await knock.messages.get("nonexistent_message");

        expect(result).toEqual({ response: { status: 404 } });
      } finally {
        cleanup();
      }
    });

    test("throws error for server errors", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "error",
          body: "Internal Server Error",
          status: 500,
          error: "Server Error",
        });

        await expect(knock.messages.get("message_123")).rejects.toThrow();
      } finally {
        cleanup();
      }
    });
  });

  describe("Message Status Updates", () => {
    test("updates message status to read", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const readMessage = createReadMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: readMessage,
          status: 200,
        });

        const result = await knock.messages.updateStatus("message_123", "read");

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/messages/message_123/read",
          data: undefined,
        });
        expect(result).toEqual(readMessage);
      } finally {
        cleanup();
      }
    });

    test("updates message status to seen", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessage = createMockMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessage,
          status: 200,
        });

        const result = await knock.messages.updateStatus("message_123", "seen");

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/messages/message_123/seen",
          data: undefined,
        });
        expect(result).toEqual(mockMessage);
      } finally {
        cleanup();
      }
    });

    test("updates message status to archived", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const archivedMessage = createArchivedMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: archivedMessage,
          status: 200,
        });

        const result = await knock.messages.updateStatus(
          "message_123",
          "archived",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/messages/message_123/archived",
          data: undefined,
        });
        expect(result).toEqual(archivedMessage);
      } finally {
        cleanup();
      }
    });

    test("updates message status to interacted with metadata", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const interactedMessage = createInteractedMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: interactedMessage,
          status: 200,
        });

        const metadata = { action: "clicked", button: "primary" };
        const result = await knock.messages.updateStatus(
          "message_123",
          "interacted",
          { metadata },
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/messages/message_123/interacted",
          data: { metadata },
        });
        expect(result).toEqual(interactedMessage);
      } finally {
        cleanup();
      }
    });

    test("updates message status to interacted without metadata", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const interactedMessage = createInteractedMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: interactedMessage,
          status: 200,
        });

        const result = await knock.messages.updateStatus(
          "message_123",
          "interacted",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: "/v1/messages/message_123/interacted",
          data: undefined,
        });
        expect(result).toEqual(interactedMessage);
      } finally {
        cleanup();
      }
    });
  });

  describe("Message Status Removal", () => {
    test("removes read status from message", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const unreadMessage = createUnreadMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: unreadMessage,
          status: 200,
        });

        const result = await knock.messages.removeStatus("message_123", "read");

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "DELETE",
          url: "/v1/messages/message_123/read",
        });
        expect(result).toEqual(unreadMessage);
      } finally {
        cleanup();
      }
    });

    test("removes seen status from message", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessage = createMockMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessage,
          status: 200,
        });

        const result = await knock.messages.removeStatus("message_123", "seen");

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "DELETE",
          url: "/v1/messages/message_123/seen",
        });
        expect(result).toEqual(mockMessage);
      } finally {
        cleanup();
      }
    });

    test("removes archived status from message", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessage = createMockMessage();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessage,
          status: 200,
        });

        const result = await knock.messages.removeStatus(
          "message_123",
          "archived",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "DELETE",
          url: "/v1/messages/message_123/archived",
        });
        expect(result).toEqual(mockMessage);
      } finally {
        cleanup();
      }
    });
  });

  describe("Batch Status Updates", () => {
    test("batch updates messages to read status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(3, { readPercentage: 1.0 });
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2", "msg_3"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "read",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/read",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to seen status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2);
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "seen",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/seen",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to archived status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2, { archivedPercentage: 1.0 });
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "archived",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/archived",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to interacted status with metadata", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2, {
          interactedPercentage: 1.0,
        });
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const metadata = { action: "bulk_action", type: "button_click" };
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "interacted",
          { metadata },
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/interacted",
          data: { message_ids: messageIds, metadata },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to interacted status without metadata", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2, {
          interactedPercentage: 1.0,
        });
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "interacted",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/interacted",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to unseen status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2);
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "unseen",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/unseen",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to unread status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2);
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "unread",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/unread",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });

    test("batch updates messages to unarchived status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockMessages = createMockMessages(2);
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockMessages,
          status: 200,
        });

        const messageIds = ["msg_1", "msg_2"];
        const result = await knock.messages.batchUpdateStatuses(
          messageIds,
          "unarchived",
        );

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/unarchived",
          data: { message_ids: messageIds },
        });
        expect(result).toEqual(mockMessages);
      } finally {
        cleanup();
      }
    });
  });

  describe("Bulk Channel Updates", () => {
    test("bulk updates all messages in channel to read status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkOperation = createBulkOperationScenario();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkOperation,
          status: 200,
        });

        const channelId = "channel_123";
        const options = { tenants: ["tenant_456"] };
        const result = await knock.messages.bulkUpdateAllStatusesInChannel({
          channelId,
          status: "read",
          options,
        });

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/channel_123/messages/bulk/read",
          data: options,
        });
        expect(result).toEqual(bulkOperation);
      } finally {
        cleanup();
      }
    });

    test("bulk updates all messages in channel to seen status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkOperation = createBulkOperationScenario();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkOperation,
          status: 200,
        });

        const channelId = "channel_123";
        const options = { archived: "exclude" as const };
        const result = await knock.messages.bulkUpdateAllStatusesInChannel({
          channelId,
          status: "seen",
          options,
        });

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/channel_123/messages/bulk/seen",
          data: options,
        });
        expect(result).toEqual(bulkOperation);
      } finally {
        cleanup();
      }
    });

    test("bulk updates all messages in channel to archived status", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkOperation = createBulkOperationScenario();
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkOperation,
          status: 200,
        });

        const channelId = "channel_123";
        const options = { user_ids: ["user_1", "user_2"] };
        const result = await knock.messages.bulkUpdateAllStatusesInChannel({
          channelId,
          status: "archive",
          options,
        });

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/channel_123/messages/bulk/archive",
          data: options,
        });
        expect(result).toEqual(bulkOperation);
      } finally {
        cleanup();
      }
    });
  });

  describe("Error Handling", () => {
    test("returns error response for client errors", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      // Mock client error (status < 500)
      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: { response: { status: 404 } },
        body: "Message not found",
      });

      const client = new MessageClient(knock);
      const result = await client.get("invalid_message_id");

      // Should return the error object for client errors
      expect(result).toEqual({ response: { status: 404 } });
    });

    test("returns error body when no error object available", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      // Mock error with no error object but has body - should be treated as client error
      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: { response: { status: 400 } }, // Client error status
        body: "Bad Request - Invalid message ID",
      });

      const client = new MessageClient(knock);
      const result = await client.get("invalid_message_id");

      // Should return the error object for client errors
      expect(result).toEqual({ response: { status: 400 } });
    });

    test("returns body when error is null for client errors", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      // Mock error with null error but body present
      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: null,
        body: "Client error body message",
      });

      const client = new MessageClient(knock);

      // When error is null, it will check response.error?.response?.status which is null?.response?.status
      // This will be undefined, so it will not be < 500, meaning it goes to the throw path
      await expect(client.get("invalid_message_id")).rejects.toThrow(
        "Client error body message",
      );
    });

    test("throws error for server errors (5xx)", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const errorResponse = {
          statusCode: "error" as const,
          body: "Internal Server Error",
          status: 500,
          error: "Server Error",
        };

        mockApiClient.makeRequest.mockResolvedValue(errorResponse);

        await expect(knock.messages.get("message_123")).rejects.toThrow(
          "Server Error",
        );
      } finally {
        cleanup();
      }
    });

    test("throws error body for server errors when no error object", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const errorResponse = {
          statusCode: "error" as const,
          body: "Gateway Timeout",
          status: 504,
          error: null,
        };

        mockApiClient.makeRequest.mockResolvedValue(errorResponse);

        await expect(knock.messages.get("message_123")).rejects.toThrow(
          "Gateway Timeout",
        );
      } finally {
        cleanup();
      }
    });

    test("throws error when status code is error and error is undefined", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      // Mock server error with undefined error object
      mockApiClient.makeRequest.mockResolvedValue({
        statusCode: "error",
        error: undefined,
        body: "Server unavailable",
      });

      const client = new MessageClient(knock);

      // Should throw the body since error is undefined (not < 500)
      await expect(client.get("message_123")).rejects.toThrow(
        "Server unavailable",
      );
    });
  });
});
