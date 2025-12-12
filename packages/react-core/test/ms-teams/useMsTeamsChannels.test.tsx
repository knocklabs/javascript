import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMsTeamsChannels from "../../src/modules/ms-teams/hooks/useMsTeamsChannels";

// ----------------------------------------------------------------------------------
// Mock state that can be modified between renders
// ----------------------------------------------------------------------------------

let mockMsTeamsClientState = {
  knockMsTeamsChannelId: "knock_chan",
  tenantId: "tenant_1",
  connectionStatus: "connected" as string,
};

vi.mock("../../src/modules/ms-teams/context", () => ({
  useKnockMsTeamsClient: () => mockMsTeamsClientState,
}));

// Mock Knock client with msTeams.getChannels implementation
const mockGetChannels = vi.fn().mockResolvedValue({
  ms_teams_channels: [],
});

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    msTeams: {
      getChannels: mockGetChannels,
    },
  }),
}));

// ----------------------------------------------------------------------------------
// Mock `swr` so we can fully control the hook behaviour and track calls
// ----------------------------------------------------------------------------------

const mockMutate = vi.fn();
let capturedSwrKey: unknown = null;
let mockFetcherFn: (() => unknown) | null = null;
let mockSwrReturnValue: {
  data: { ms_teams_channels: Array<{ id: string; displayName: string }> } | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: typeof mockMutate;
} = {
  data: {
    ms_teams_channels: [
      { id: "10", displayName: "General" },
      { id: "20", displayName: "Dev" },
    ],
  },
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: mockMutate,
};

vi.mock("swr", () => {
  return {
    __esModule: true,
    default: (key: unknown, fetcher: () => unknown, _options: unknown) => {
      // Capture the key and fetcher so we can test them
      capturedSwrKey = key;
      mockFetcherFn = fetcher;
      return mockSwrReturnValue;
    },
  };
});

// ----------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------

describe("useMsTeamsChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state to defaults
    mockMsTeamsClientState = {
      knockMsTeamsChannelId: "knock_chan",
      tenantId: "tenant_1",
      connectionStatus: "connected",
    };
    capturedSwrKey = null;
    mockFetcherFn = null;
    // Reset SWR return value to defaults
    mockSwrReturnValue = {
      data: {
        ms_teams_channels: [
          { id: "10", displayName: "General" },
          { id: "20", displayName: "Dev" },
        ],
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    };
  });

  it("returns channel list and loading flag", () => {
    const { result } = renderHook(() =>
      useMsTeamsChannels({ teamId: "team_42" }),
    );

    expect(result.current.data).toEqual([
      { id: "10", displayName: "General" },
      { id: "20", displayName: "Dev" },
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty array when data is undefined", () => {
    // Set data to undefined to test the nullish coalescing
    mockSwrReturnValue.data = undefined;

    const { result } = renderHook(() =>
      useMsTeamsChannels({ teamId: "team_42" }),
    );

    expect(result.current.data).toEqual([]);
  });

  describe("cache key includes tenantId and channelId", () => {
    it("generates cache key with tenantId, knockMsTeamsChannelId, and teamId", () => {
      renderHook(() => useMsTeamsChannels({ teamId: "team_42" }));

      expect(capturedSwrKey).toEqual([
        "MS_TEAMS_CHANNELS",
        "tenant_1",
        "knock_chan",
        "team_42",
      ]);
    });

    it("returns null key when teamId is not provided", () => {
      renderHook(() => useMsTeamsChannels({}));

      expect(capturedSwrKey).toBeNull();
    });

    it("returns null key when not connected", () => {
      mockMsTeamsClientState.connectionStatus = "disconnected";

      renderHook(() => useMsTeamsChannels({ teamId: "team_42" }));

      expect(capturedSwrKey).toBeNull();
    });

    it("generates key with different tenant", () => {
      mockMsTeamsClientState.tenantId = "tenant_xyz";

      renderHook(() => useMsTeamsChannels({ teamId: "team_42" }));

      expect(capturedSwrKey).toEqual([
        "MS_TEAMS_CHANNELS",
        "tenant_xyz",
        "knock_chan",
        "team_42",
      ]);
    });
  });

  describe("fetcher function", () => {
    it("calls knock.msTeams.getChannels with correct parameters", async () => {
      renderHook(() => useMsTeamsChannels({ 
        teamId: "team_42",
        queryOptions: { filter: "displayName eq 'Test'" }
      }));

      expect(mockFetcherFn).not.toBeNull();

      mockGetChannels.mockClear();

      await mockFetcherFn!();

      expect(mockGetChannels).toHaveBeenCalledWith({
        knockChannelId: "knock_chan",
        tenant: "tenant_1",
        teamId: "team_42",
        queryOptions: {
          $filter: "displayName eq 'Test'",
          $select: undefined,
        },
      });
    });

    it("calls with select option when provided", async () => {
      renderHook(() => useMsTeamsChannels({ 
        teamId: "team_42",
        queryOptions: { select: "id,displayName" }
      }));

      mockGetChannels.mockClear();

      await mockFetcherFn!();

      expect(mockGetChannels).toHaveBeenCalledWith({
        knockChannelId: "knock_chan",
        tenant: "tenant_1",
        teamId: "team_42",
        queryOptions: {
          $filter: undefined,
          $select: "id,displayName",
        },
      });
    });
  });

  describe("cache clearing behavior", () => {
    it("clears cache when tenantId changes", () => {
      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Change tenant
      mockMsTeamsClientState.tenantId = "tenant_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
    });

    it("clears cache when knockMsTeamsChannelId changes", () => {
      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Change channel
      mockMsTeamsClientState.knockMsTeamsChannelId = "knock_chan_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
    });

    it("clears cache when connection is re-established", () => {
      // Start disconnected
      mockMsTeamsClientState.connectionStatus = "disconnected";

      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Reconnect
      mockMsTeamsClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared when re-establishing connection
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
    });

    it("does not clear cache when already connected and connection status stays connected", () => {
      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Rerender with same connection status
      rerender();

      // Cache should not be cleared
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("does not clear cache when transitioning from connected to disconnected", () => {
      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Disconnect
      mockMsTeamsClientState.connectionStatus = "disconnected";
      rerender();

      // Cache should not be cleared on disconnect (only on reconnect)
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("clears cache when transitioning from error to connected", () => {
      // Start with error
      mockMsTeamsClientState.connectionStatus = "error";

      const { rerender } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Reconnect after error
      mockMsTeamsClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
    });
  });

  describe("refetch function", () => {
    it("calls mutate to refetch data", () => {
      const { result } = renderHook(() =>
        useMsTeamsChannels({ teamId: "team_42" }),
      );

      // Clear any previous calls
      mockMutate.mockClear();

      // Call refetch
      result.current.refetch();

      // Should call mutate without arguments to trigger revalidation
      expect(mockMutate).toHaveBeenCalledWith();
    });
  });
});
