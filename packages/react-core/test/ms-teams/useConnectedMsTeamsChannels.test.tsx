import KnockClient, { type MsTeamsChannelConnection } from "@knocklabs/client";
import { act, renderHook } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { mockMsTeamsContext, mockTranslations } from "../test-utils/mocks";

// ----------------------------------------------------------------------------------
// Shared mocks
// ----------------------------------------------------------------------------------

const mockGetChannelData = vi.fn();
const mockSetChannelData = vi.fn();

const mockKnock = {
  objects: {
    getChannelData: mockGetChannelData,
    setChannelData: mockSetChannelData,
  },
} as unknown as typeof KnockClient;

// Mock useKnockClient
vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => mockKnock,
}));

// Mock swr
const mutateMock = vi.fn((updateFn: unknown) => {
  if (typeof updateFn === "function") {
    return updateFn();
  }
});

function buildSWRMock(initialData: unknown[] = []) {
  return {
    __esModule: true,
    default: () => ({
      data: initialData,
      mutate: mutateMock,
      isValidating: false,
      isLoading: false,
    }),
  };
}

vi.mock("swr", () =>
  buildSWRMock([
    {
      channel_id: "1",
      team_id: "T",
    } as unknown as MsTeamsChannelConnection,
  ]),
);

// Apply shared mocks _before_ loading the hook to ensure context is mocked first
mockMsTeamsContext();
mockTranslations();

let useConnectedMsTeamsChannels: typeof import("../../src/modules/ms-teams/hooks/useConnectedMsTeamsChannels").default;

beforeAll(async () => {
  // Dynamically import after mocks are set up
  ({ default: useConnectedMsTeamsChannels } = await import(
    "../../src/modules/ms-teams/hooks/useConnectedMsTeamsChannels?m" as string
  ));
});

// ----------------------------------------------------------------------------------

describe("useConnectedMsTeamsChannels", () => {
  const recipient = { objectId: "obj_1", collection: "users" } as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial data", () => {
    const { result } = renderHook(() =>
      useConnectedMsTeamsChannels({
        msTeamsChannelsRecipientObject: recipient,
      }),
    );

    expect(result.current.data).toEqual([
      {
        channel_id: "1",
        team_id: "T",
      } as unknown as MsTeamsChannelConnection,
    ]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("updates connected channels", async () => {
    mutateMock.mockClear();
    mockSetChannelData.mockClear();

    const { result } = renderHook(() =>
      useConnectedMsTeamsChannels({
        msTeamsChannelsRecipientObject: recipient,
      }),
    );

    const newChannels = [
      {
        channel_id: "2",
        team_id: "T",
      } as unknown as MsTeamsChannelConnection,
    ];

    await act(async () => {
      await result.current.updateConnectedChannels(newChannels);
    });

    expect(mockSetChannelData).toHaveBeenCalledWith({
      objectId: recipient.objectId,
      collection: recipient.collection,
      channelId: "knock_chan",
      data: { connections: newChannels },
    });

    expect(mutateMock).toHaveBeenCalled();
  });
});
