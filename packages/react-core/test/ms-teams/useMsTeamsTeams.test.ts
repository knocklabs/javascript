import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMsTeamsTeams from "../../src/modules/ms-teams/hooks/useMsTeamsTeams";

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

// Mock Knock client with msTeams.getTeams implementation
const mockGetTeams = vi.fn();

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    msTeams: {
      getTeams: mockGetTeams,
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
            ms_teams_teams: [
              { id: "1", displayName: "Team Alpha" },
              { id: "2", displayName: "Team Beta" },
            ],
            skip_token: null,
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

describe("useMsTeamsTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state to defaults
    mockMsTeamsClientState = {
      knockMsTeamsChannelId: "knock_chan",
      tenantId: "tenant_1",
      connectionStatus: "connected",
    };
    mockGetKeyFn = null;
  });

  it("returns flattened list of teams and loading flag", () => {
    const { result } = renderHook(() => useMsTeamsTeams({}));

    expect(result.current.data).toEqual([
      { id: "1", displayName: "Team Alpha" },
      { id: "2", displayName: "Team Beta" },
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  describe("cache key includes tenantId and channelId", () => {
    it("generates cache key with tenantId and knockMsTeamsChannelId for first page", () => {
      renderHook(() => useMsTeamsTeams({}));

      // The getQueryKey function should have been captured
      expect(mockGetKeyFn).not.toBeNull();

      // Test first page key generation
      const firstPageKey = mockGetKeyFn!(0, null);
      expect(firstPageKey).toEqual([
        "MS_TEAMS_TEAMS",
        "tenant_1",
        "knock_chan",
        "",
      ]);
    });

    it("generates cache key with skiptoken for subsequent pages", () => {
      renderHook(() => useMsTeamsTeams({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test subsequent page key generation with skiptoken
      const nextPageKey = mockGetKeyFn!(1, { skip_token: "skip_abc" });
      expect(nextPageKey).toEqual([
        "MS_TEAMS_TEAMS",
        "tenant_1",
        "knock_chan",
        "skip_abc",
      ]);
    });

    it("returns null for subsequent pages when no more data", () => {
      renderHook(() => useMsTeamsTeams({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test that null is returned when there's no next skip_token
      const noMorePagesKey = mockGetKeyFn!(1, { skip_token: null });
      expect(noMorePagesKey).toBeNull();
    });

    it("returns null when not connected", () => {
      mockMsTeamsClientState.connectionStatus = "disconnected";

      renderHook(() => useMsTeamsTeams({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Should return null when disconnected
      const key = mockGetKeyFn!(0, null);
      expect(key).toBeNull();
    });
  });

  describe("cache clearing behavior", () => {
    it("clears cache when tenantId changes", () => {
      const { rerender } = renderHook(() => useMsTeamsTeams({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Change tenant
      mockMsTeamsClientState.tenantId = "tenant_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("clears cache when knockMsTeamsChannelId changes", () => {
      const { rerender } = renderHook(() => useMsTeamsTeams({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Change channel
      mockMsTeamsClientState.knockMsTeamsChannelId = "knock_chan_2";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("clears cache when connection is re-established", () => {
      // Start disconnected
      mockMsTeamsClientState.connectionStatus = "disconnected";

      const { rerender } = renderHook(() => useMsTeamsTeams({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockSetSize).not.toHaveBeenCalled();

      // Reconnect
      mockMsTeamsClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared when re-establishing connection
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });

    it("does not clear cache when already connected and connection status stays connected", () => {
      const { rerender } = renderHook(() => useMsTeamsTeams({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Rerender with same connection status
      rerender();

      // Cache should not be cleared
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("does not clear cache when transitioning from connected to disconnected", () => {
      const { rerender } = renderHook(() => useMsTeamsTeams({}));

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

      const { rerender } = renderHook(() => useMsTeamsTeams({}));

      // Initial render should not clear cache
      expect(mockMutate).not.toHaveBeenCalled();

      // Reconnect after error
      mockMsTeamsClientState.connectionStatus = "connected";
      rerender();

      // Cache should be cleared
      expect(mockMutate).toHaveBeenCalledWith(undefined, { revalidate: false });
      expect(mockSetSize).toHaveBeenCalledWith(0);
    });
  });
});
