import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useSlackChannels from "../../src/modules/slack/hooks/useSlackChannels";

// ----------------------------------------------------------------------------------
// Mock state that can be modified between renders
// ----------------------------------------------------------------------------------

let mockSlackClientState = {
  knockSlackChannelId: "knock_chan",
  tenantId: "tenant_1",
  connectionStatus: "connected" as string,
};

vi.mock("../../src/modules/slack", () => ({
  useKnockSlackClient: () => mockSlackClientState,
}));

// Mock Knock client (only the slack API namespace used by the hook)
const mockGetChannels = vi.fn();

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    slack: {
      getChannels: mockGetChannels,
    },
  }),
}));

// ----------------------------------------------------------------------------------
// Mock `swr/infinite` so we can fully control the hook behaviour and track calls
// ----------------------------------------------------------------------------------

const mockSetSize = vi.fn();
const mockMutate = vi.fn();
let mockGetKeyFn: ((pageIndex: number, previousPageData: unknown) => unknown) | null = null;

vi.mock("swr/infinite", () => {
  return {
    __esModule: true,
    default: (getKey: (pageIndex: number, previousPageData: unknown) => unknown, _fetcher: unknown, _options: unknown) => {
      // Capture the getKey function so we can test what keys it generates
      mockGetKeyFn = getKey;
      return {
        data: [
          {
            slack_channels: [
              { id: "1", name: "general" },
              { id: "2", name: "random" },
            ],
            next_cursor: null,
          },
        ],
        error: undefined,
        isLoading: false,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };
    },
  };
});

// ----------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------

describe("useSlackChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state to defaults
    mockSlackClientState = {
      knockSlackChannelId: "knock_chan",
      tenantId: "tenant_1",
      connectionStatus: "connected",
    };
    mockGetKeyFn = null;
  });

  it("returns aggregated channel list and triggers pagination when appropriate", () => {
    const { result } = renderHook(() => useSlackChannels({}));

    // Aggregated data should flatten all pages
    expect(result.current.data).toEqual([
      { id: "1", name: "general" },
      { id: "2", name: "random" },
    ]);

    // Loading state should be derived from isLoading || isValidating
    expect(result.current.isLoading).toBe(false);
  });

  describe("cache key includes tenantId and channelId", () => {
    it("generates cache key with tenantId and knockSlackChannelId for first page", () => {
      renderHook(() => useSlackChannels({}));

      // The getQueryKey function should have been captured
      expect(mockGetKeyFn).not.toBeNull();

      // Test first page key generation
      const firstPageKey = mockGetKeyFn!(0, null);
      expect(firstPageKey).toEqual([
        "SLACK_CHANNELS",
        "tenant_1",
        "knock_chan",
        "",
      ]);
    });

    it("generates cache key with cursor for subsequent pages", () => {
      renderHook(() => useSlackChannels({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test subsequent page key generation with cursor
      const nextPageKey = mockGetKeyFn!(1, { next_cursor: "cursor_abc" });
      expect(nextPageKey).toEqual([
        "SLACK_CHANNELS",
        "tenant_1",
        "knock_chan",
        "cursor_abc",
      ]);
    });

    it("returns null for subsequent pages when no more data", () => {
      renderHook(() => useSlackChannels({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test that null is returned when there's no next cursor
      const noMorePagesKey = mockGetKeyFn!(1, { next_cursor: null });
      expect(noMorePagesKey).toBeNull();
    });

    it("returns null when not connected", () => {
      mockSlackClientState.connectionStatus = "disconnected";

      renderHook(() => useSlackChannels({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Should return null when disconnected
      const key = mockGetKeyFn!(0, null);
      expect(key).toBeNull();
    });
  });

  describe("cache clearing behavior", () => {
    it("clears cache when tenantId changes", () => {
      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Change tenant
      mockSlackClientState.tenantId = "tenant_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("clears cache when knockSlackChannelId changes", () => {
      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Change channel
      mockSlackClientState.knockSlackChannelId = "knock_chan_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("clears cache when connection is re-established", () => {
      // Start disconnected
      mockSlackClientState.connectionStatus = "disconnected";

      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Reconnect
      mockSlackClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared when re-establishing connection
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("does not clear cache when already connected and connection status stays connected", () => {
      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Rerender with same connection status
      rerender();

      // Cache should not be cleared
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("does not clear cache when transitioning from connected to disconnected", () => {
      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Disconnect
      mockSlackClientState.connectionStatus = "disconnected";
      rerender();

      // Cache should not be cleared on disconnect (only on reconnect)
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("clears cache when transitioning from error to connected", () => {
      // Start with error
      mockSlackClientState.connectionStatus = "error";

      const { rerender } = renderHook(() => useSlackChannels({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Reconnect after error
      mockSlackClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });
  });
});
