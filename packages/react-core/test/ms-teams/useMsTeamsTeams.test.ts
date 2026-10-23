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
const mockGetTeams = vi.fn().mockResolvedValue({
  ms_teams_teams: [],
  skip_token: null,
});

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
let mockFetcherFn: ((queryKey: unknown) => unknown) | null = null;
let mockSwrReturnValue: {
  data: Array<{ ms_teams_teams: Array<{ id: string; displayName: string }>; skip_token: string | null }>;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  setSize: typeof mockSetSize;
  mutate: typeof mockMutate;
} = {
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
    mockFetcherFn = null;
    // Reset SWR return value to defaults
    mockSwrReturnValue = {
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
  });

  it("returns flattened list of teams and loading flag", () => {
    const { result } = renderHook(() => useMsTeamsTeams({}));

    expect(result.current.data).toEqual([
      { id: "1", displayName: "Team Alpha" },
      { id: "2", displayName: "Team Beta" },
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it("filters out null/undefined teams from response", () => {
    // Set mock with data containing falsy values BEFORE rendering
    mockSwrReturnValue.data = [
      {
        ms_teams_teams: [
          { id: "1", displayName: "Team Alpha" },
          null,
          { id: "2", displayName: "Team Beta" },
          undefined,
          false,
          0,
        ] as unknown as Array<{ id: string; displayName: string }>,
        skip_token: null,
      },
    ];

    const { result } = renderHook(() => useMsTeamsTeams({}));

    // Should only include truthy teams
    expect(result.current.data).toEqual([
      { id: "1", displayName: "Team Alpha" },
      { id: "2", displayName: "Team Beta" },
    ]);
  });

  it("returns empty array when data is undefined", () => {
    // Set data to undefined to test the nullish coalescing
    mockSwrReturnValue.data = undefined as unknown as typeof mockSwrReturnValue.data;

    const { result } = renderHook(() => useMsTeamsTeams({}));

    expect(result.current.data).toEqual([]);
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

    it("handles pagination correctly for subsequent pages", () => {
      renderHook(() => useMsTeamsTeams({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test with empty string skip_token (should return null)
      const emptyStringKey = mockGetKeyFn!(1, { skip_token: "" });
      expect(emptyStringKey).toBeNull();
    });

    it("handles undefined skip_token in previousPageData", () => {
      renderHook(() => useMsTeamsTeams({}));

      expect(mockGetKeyFn).not.toBeNull();

      // Test with previousPageData that has no skip_token property
      const keyWithUndefinedToken = mockGetKeyFn!(1, { ms_teams_teams: [] });
      expect(keyWithUndefinedToken).toEqual([
        "MS_TEAMS_TEAMS",
        "tenant_1",
        "knock_chan",
        "",
      ]);
    });
  });

  describe("fetcher function", () => {
    it("calls knock.msTeams.getTeams with correct parameters", async () => {
      renderHook(() => useMsTeamsTeams({ 
        queryOptions: { limitPerPage: 50, filter: "displayName eq 'Test'" }
      }));

      expect(mockFetcherFn).not.toBeNull();

      mockGetTeams.mockClear();

      // Call the fetcher with a sample query key
      const queryKey = ["MS_TEAMS_TEAMS", "tenant_1", "knock_chan", "skip_token_123"];
      await mockFetcherFn!(queryKey);

      expect(mockGetTeams).toHaveBeenCalledWith({
        knockChannelId: "knock_chan",
        tenant: "tenant_1",
        queryOptions: {
          $skiptoken: "skip_token_123",
          $top: 50,
          $filter: "displayName eq 'Test'",
          $select: undefined,
        },
      });
    });

    it("handles first page correctly", async () => {
      renderHook(() => useMsTeamsTeams({}));

      mockGetTeams.mockClear();

      const queryKey = ["MS_TEAMS_TEAMS", "tenant_1", "knock_chan", ""];
      await mockFetcherFn!(queryKey);

      expect(mockGetTeams).toHaveBeenCalledWith({
        knockChannelId: "knock_chan",
        tenant: "tenant_1",
        queryOptions: {
          $skiptoken: "",
          $top: undefined,
          $filter: undefined,
          $select: undefined,
        },
      });
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

  describe("auto-pagination", () => {
    it("automatically fetches next page when hasNextPage is true and count is below maxCount", () => {
      // Configure SWR to indicate there's a next page
      mockSwrReturnValue = {
        data: [
          {
            ms_teams_teams: [
              { id: "1", displayName: "Team Alpha" },
            ],
            skip_token: "next_token",
          },
        ],
        error: undefined,
        isLoading: false,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };

      renderHook(() => useMsTeamsTeams({}));

      // setSize should be called to fetch next page
      expect(mockSetSize).toHaveBeenCalled();
    });

    it("does not auto-fetch when error exists", () => {
      mockSwrReturnValue = {
        data: [
          {
            ms_teams_teams: [{ id: "1", displayName: "Team Alpha" }],
            skip_token: "next_token",
          },
        ],
        error: new Error("API error"),
        isLoading: false,
        isValidating: false,
        setSize: mockSetSize,
        mutate: mockMutate,
      };

      renderHook(() => useMsTeamsTeams({}));

      // setSize should not be called when there's an error
      expect(mockSetSize).not.toHaveBeenCalled();
    });
  });
});
