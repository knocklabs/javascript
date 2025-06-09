// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import MessageClient from "../../../src/clients/messages";
import type {
  BulkUpdateMessagesInChannelProperties,
  Message,
  MessageEngagementStatus,
} from "../../../src/clients/messages/interfaces";
import Knock from "../../../src/knock";

describe("MessageClient", () => {
  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
  } as unknown as Knock;

  const mockMessage: Message = {
    id: "msg_123",
    channel_id: "channel_123",
    recipient: { id: "user_123", collection: "users" },
    actors: [],
    inserted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    read_at: null,
    seen_at: null,
    archived_at: null,
    clicked_at: null,
    interacted_at: null,
    link_clicked_at: null,
    tenant: null,
    status: "sent",
    engagement_statuses: [],
    source: {
      key: "test_source",
      version_id: "version_123",
      categories: [],
    },
    data: null,
    metadata: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    test("fetches a message by ID", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockMessage,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MessageClient(mockKnock);
      const result = await client.get("msg_123");

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/messages/msg_123",
      });

      expect(result).toEqual(mockMessage);
    });

    test("handles error responses", async () => {
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

      const client = new MessageClient(mockKnock);
      await expect(client.get("msg_123")).rejects.toThrow("Not found");
    });
  });

  describe("updateStatus", () => {
    const testCases: Array<
      [
        MessageEngagementStatus,
        { metadata?: Record<string, string> } | undefined,
      ]
    > = [
      ["seen", undefined],
      ["read", undefined],
      ["archived", undefined],
      ["interacted", { metadata: { action: "clicked" } }],
    ];

    test.each(testCases)(
      "updates message status to %s",
      async (status, options) => {
        const mockApiClient = {
          makeRequest: vi.fn().mockResolvedValue({
            statusCode: "ok",
            body: {
              ...mockMessage,
              [`${status}_at`]: new Date().toISOString(),
            },
          }),
        };

        vi.mocked(mockKnock.client).mockReturnValue(
          mockApiClient as unknown as ApiClient,
        );

        const client = new MessageClient(mockKnock);
        await client.updateStatus("msg_123", status, options);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "PUT",
          url: `/v1/messages/msg_123/${status}`,
          data:
            status === "interacted"
              ? { metadata: options?.metadata }
              : undefined,
        });
      },
    );
  });

  describe("removeStatus", () => {
    const testCases: Array<Exclude<MessageEngagementStatus, "interacted">> = [
      "seen",
      "read",
      "archived",
    ];

    test.each(testCases)("removes %s status from message", async (status) => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: { ...mockMessage, [`${status}_at`]: null },
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MessageClient(mockKnock);
      await client.removeStatus("msg_123", status);

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "DELETE",
        url: `/v1/messages/msg_123/${status}`,
      });
    });
  });

  describe("batchUpdateStatuses", () => {
    test("updates multiple messages status", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: [mockMessage],
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MessageClient(mockKnock);
      const messageIds = ["msg_123", "msg_456"];
      await client.batchUpdateStatuses(messageIds, "seen");

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "/v1/messages/batch/seen",
        data: { message_ids: messageIds },
      });
    });

    test("includes metadata for interacted status", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: [mockMessage],
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MessageClient(mockKnock);
      const messageIds = ["msg_123", "msg_456"];
      const metadata = { action: "clicked" };
      await client.batchUpdateStatuses(messageIds, "interacted", { metadata });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "/v1/messages/batch/interacted",
        data: { message_ids: messageIds, metadata },
      });
    });
  });

  describe("bulkUpdateAllStatusesInChannel", () => {
    test("updates all messages in a channel", async () => {
      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: { id: "bulk_op_123", status: "completed" },
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new MessageClient(mockKnock);
      const options = {
        user_ids: ["user_123"],
        engagement_status: "seen" as const,
        archived: "exclude" as const,
      };

      await client.bulkUpdateAllStatusesInChannel({
        channelId: "channel_123",
        status: "seen",
        options,
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "/v1/channels/channel_123/messages/bulk/seen",
        data: options,
      });
    });
  });
});
