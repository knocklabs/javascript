// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import ObjectClient from "../../../src/clients/objects";
import type { ChannelData } from "../../../src/interfaces";
import Knock from "../../../src/knock";

describe("ObjectClient", () => {
  const mockKnock = {
    client: vi.fn(() => ({
      makeRequest: vi.fn(),
    })),
  } as unknown as Knock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getChannelData", () => {
    test("fetches channel data for an object", async () => {
      const mockChannelData: ChannelData<{ key: string }> = {
        channel_id: "channel_123",
        data: { key: "value" },
      };

      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelData,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new ObjectClient(mockKnock);
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

      const client = new ObjectClient(mockKnock);
      await expect(
        client.getChannelData({
          objectId: "obj_123",
          collection: "users",
          channelId: "channel_123",
        }),
      ).rejects.toThrow("Not found");
    });
  });

  describe("setChannelData", () => {
    test("sets channel data for an object", async () => {
      const mockChannelData: ChannelData<{ key: string }> = {
        channel_id: "channel_123",
        data: { key: "value" },
      };

      const mockApiClient = {
        makeRequest: vi.fn().mockResolvedValue({
          statusCode: "ok",
          body: mockChannelData,
        }),
      };

      vi.mocked(mockKnock.client).mockReturnValue(
        mockApiClient as unknown as ApiClient,
      );

      const client = new ObjectClient(mockKnock);
      const result = await client.setChannelData({
        objectId: "obj_123",
        collection: "users",
        channelId: "channel_123",
        data: { key: "value" },
      });

      expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
        method: "PUT",
        url: "v1/objects/users/obj_123/channel_data/channel_123",
        data: { data: { key: "value" } },
      });
      expect(result).toEqual(mockChannelData);
    });

    test("handles error responses", async () => {
      const mockError = new Error("Invalid data");
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

      const client = new ObjectClient(mockKnock);
      await expect(
        client.setChannelData({
          objectId: "obj_123",
          collection: "users",
          channelId: "channel_123",
          data: { key: "value" },
        }),
      ).rejects.toThrow("Invalid data");
    });
  });
});
