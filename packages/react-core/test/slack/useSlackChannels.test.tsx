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
const mockGetChannels = vi.fn().mockResolvedValue({
  slack_channels: [],
  next_cursor: null,
});

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
let mockFetcherFn: ((queryKey: unknown) => unknown) | null = null;
let mockSwrReturnValue: {
  data: Array<{ slack_channels: Array<{ id: string; name: string }>; next_cursor: string | null }>;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  setSize: typeof mockSetSize;
  mutate: typeof mockMutate;
} = {
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

vi.mock("swr/infinite", () => {
  return {
    __esModule: true,
    default: (getKey: (pageIndex: number, previousPageData: unknown) => unknown, fetcher: (queryKey: unknown) => unknown, _options: unknown) => {
      // Capture both functions so we can test them
      mockGetKeyFn = getKey;
      mockFetcherFn = fetcher;
      return mockSwrReturnValue;
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
    mockFetcherFn = null;
    // Reset SWR return value to defaults
    mockSwrReturnValue = {
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

  it("filters out null/undefined channels from response", () => {
    // Set mock with data containing falsy values BEFORE rendering
    mockSwrReturnValue.data = [
      {
        slack_channels: [
          { id: "1", name: "general" },
          null as any,
          { id: "2", name: "random" },
          undefined as any,
          false as any,
          0 as any,
        ],
        next_cursor: null,
      },
    ];

    const { result } = renderHook(() => useSlackChannels({}));

    // Should only include truthy channels
    expect(result.current.data).toEqual([
      { id: "1", name: "general" },
      { id: "2", name: "random" },
    ]);
  });

  it("returns empty array when data is undefined", () => {
    // Set data to undefined to test the nullish coalescing
    mockSwrReturnValue.data = undefined as any;

    const { result } = renderHook(() => useSlackChannels({}));

    expect(result.current.data).toEqual([]);
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

    it("handles pagination correctly for subsequent pages", () => {
      renderHook(() => useSlackChannels({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test with empty string cursor (should return null)
      const emptyStringKey = mockGetKeyFn!(1, { next_cursor: "" });
      expect(emptyStringKey).toBeNull();
    });

    it("handles undefined next_cursor in previousPageData", () => {
      renderHook(() => useSlackChannels({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test with previousPageData that has no next_cursor property
      const keyWithUndefinedCursor = mockGetKeyFn!(1, { slack_channels: [] });
      expect(keyWithUndefinedCursor).toEqual([
        "SLACK_CHANNELS",
        "tenant_1",
        "knock_chan",
        "",
      ]);
    });
  });

  describe("fetcher function", () => {
    it("calls knock.slack.getChannels with correct parameters", async () => {
      renderHook(() => useSlackChannels({ queryOptions: { limitPerPage: 100 } }));

      expect(mockFetcherFn).not.toBeNull();

      // Clear previous calls from hook initialization
      mockGetChannels.mockClear();

      // Call the fetcher with a sample query key
      const queryKey = ["SLACK_CHANNELS", "tenant_1", "knock_chan", "cursor_123"];
      await mockFetcherFn!(queryKey);

      expect(mockGetChannels).toHaveBeenCalledWith({
        tenant: "tenant_1",
        knockChannelId: "knock_chan",
        queryOptions: {
          cursor: "cursor_123",
          limitPerPage: 100,
          limit: 100,
          types: "private_channel,public_channel",
        },
      });
    });

    it("uses default limit when not specified", async () => {
      renderHook(() => useSlackChannels({}));

      mockGetChannels.mockClear();

      const queryKey = ["SLACK_CHANNELS", "tenant_1", "knock_chan", ""];
      await mockFetcherFn!(queryKey);

      expect(mockGetChannels).toHaveBeenCalledWith({
        tenant: "tenant_1",
        knockChannelId: "knock_chan",
        queryOptions: {
          cursor: "",
          limit: 200, // LIMIT_PER_PAGE default
          types: "private_channel,public_channel",
        },
      });
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

  describe("auto-pagination", () => {
    it("automatically fetches next page when hasNextPage is true and count is below maxCount", () => {
      // Configure SWR to indicate there's a next page
      mockSwrReturnValue = {
        data: [
          {
            slack_channels: [
              { id: "1", name: "general" },
            ],
            next_cursor: "next_cursor",
          },
        ],
        error: undefined,
        isLoading: false,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };

      renderHook(() => useSlackChannels({}));

      // setSize should be called to fetch next page
      expect(mockSetSize).toHaveBeenCalled();
    });

    it("does not auto-fetch when isLoading is true", () => {
      mockSwrReturnValue = {
        data: [
          {
            slack_channels: [{ id: "1", name: "general" }],
            next_cursor: "next_cursor",
          },
        ],
        error: undefined,
        isLoading: true,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };

      renderHook(() => useSlackChannels({}));

      // setSize should not be called when loading
      expect(mockSetSize).not.toHaveBeenCalled();
    });

    it("does not auto-fetch when error exists", () => {
      mockSwrReturnValue = {
        data: [
          {
            slack_channels: [{ id: "1", name: "general" }],
            next_cursor: "next_cursor",
          },
        ],
        error: new Error("API error"),
        isLoading: false,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };

      renderHook(() => useSlackChannels({}));

      // setSize should not be called when there's an error
      expect(mockSetSize).not.toHaveBeenCalled();
    });
  });
});
