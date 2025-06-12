import { renderHook } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type UseMsTeamsChannels from "../../src/modules/ms-teams/hooks/useMsTeamsChannels";
import { mockMsTeamsContext, mockTranslations } from "../test-utils/mocks";

// Apply shared mocks **before** loading the hook
mockMsTeamsContext();
mockTranslations();

// Dynamically load the hook after mocks are set up
let useMsTeamsChannels: typeof UseMsTeamsChannels;

beforeAll(async () => {
  ({ default: useMsTeamsChannels } = await import(
    "../../src/modules/ms-teams/hooks/useMsTeamsChannels?m" as string
  ));
});

// Mock Knock client with msTeams.getChannels implementation
const mockGetChannels = vi.fn();

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    msTeams: {
      getChannels: mockGetChannels,
    },
  }),
}));

// Mock swr for deterministic data
vi.mock("swr", () => {
  return {
    __esModule: true,
    default: () => ({
      data: {
        ms_teams_channels: [
          { id: "10", displayName: "General" },
          { id: "20", displayName: "Dev" },
        ],
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    }),
  };
});

// ----------------------------------------------------------------------------------

describe("useMsTeamsChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
