import { renderHook } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { mockMsTeamsContext, mockTranslations } from "../test-utils/mocks";

// Apply shared mocks **before** loading the hook
mockMsTeamsContext();
mockTranslations();

// Dynamically load the hook after mocks are set up
let useMsTeamsTeams: typeof import("../../src/modules/ms-teams/hooks/useMsTeamsTeams").default;

beforeAll(async () => {
  ({ default: useMsTeamsTeams } = await import(
    "../../src/modules/ms-teams/hooks/useMsTeamsTeams?m" as string
  ));
});

// ----------------------------------------------------------------------------------
// Mock dependent context hooks
// ----------------------------------------------------------------------------------

// Mock Knock client with msTeams.getTeams implementation
const mockGetTeams = vi.fn();

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    msTeams: {
      getTeams: mockGetTeams,
    },
  }),
}));

// Mock swr/infinite to provide deterministic data
vi.mock("swr/infinite", () => {
  return {
    __esModule: true,
    default: () => ({
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
      setSize: vi.fn(),
      mutate: vi.fn(),
    }),
  };
});

// ----------------------------------------------------------------------------------

describe("useMsTeamsTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns flattened list of teams and loading flag", () => {
    const { result } = renderHook(() => useMsTeamsTeams({}));

    expect(result.current.data).toEqual([
      { id: "1", displayName: "Team Alpha" },
      { id: "2", displayName: "Team Beta" },
    ]);
    expect(result.current.isLoading).toBe(false);
  });
});
