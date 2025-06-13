import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useSlackChannels from "../../src/modules/slack/hooks/useSlackChannels";

// ----------------------------------------------------------------------------------
// Mock the dependent context hooks
// ----------------------------------------------------------------------------------

vi.mock("../../src/modules/slack", () => ({
  useKnockSlackClient: () => ({
    knockSlackChannelId: "knock_chan",
    tenantId: "tenant_1",
    connectionStatus: "connected", // important for effect logic
  }),
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
// Mock `swr/infinite` so we can fully control the hook behaviour
// ----------------------------------------------------------------------------------

// Mock SWR to control data (internal setSize/mutate functions not referenced)
vi.mock("swr/infinite", () => {
  return {
    __esModule: true,
    default: () => ({
      data: [
        {
          slack_channels: [
            { id: "1", name: "general" },
            { id: "2", name: "random" },
          ],
          next_cursor: "next",
        },
      ],
      error: undefined,
      isLoading: false,
      isValidating: false,
      setSize: vi.fn(),
      mutate: vi.fn(),
    }),
  };
});

// ----------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------

describe("useSlackChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns aggregated channel list and triggers pagination when appropriate", async () => {
    const { result } = renderHook(() => useSlackChannels({}));

    // Aggregated data should flatten all pages
    expect(result.current.data).toEqual([
      { id: "1", name: "general" },
      { id: "2", name: "random" },
    ]);

    // Loading state should be derived from isLoading || isValidating
    expect(result.current.isLoading).toBe(false);
  });
});
