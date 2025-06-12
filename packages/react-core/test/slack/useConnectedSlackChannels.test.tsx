import { SlackChannelConnection } from "@knocklabs/client";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useConnectedSlackChannels from "../../src/modules/slack/hooks/useConnectedSlackChannels";

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
} as unknown as import("@knocklabs/client").default;

// Provide minimal translation function
vi.mock("../../src/modules/i18n", () => ({
  useTranslations: () => ({ t: (k: string) => k }),
}));

// Mock useKnockClient to return our mockKnock
vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => mockKnock,
}));

// Mock useKnockSlackClient to inject channel id and connection status
vi.mock("../../src/modules/slack", () => ({
  useKnockSlackClient: () => ({
    knockSlackChannelId: "knock_chan",
    tenantId: "tenant_1",
    connectionStatus: "connected",
  }),
}));

// Mock SWR to control data and mutate
const mutateMock = vi.fn((updateFn: unknown) => {
  if (typeof updateFn === "function") {
    return updateFn();
  }
});

function buildSWRMock(initialData: SlackChannelConnection[] = []) {
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
    { channel_id: "1", team_id: "T" } as unknown as SlackChannelConnection,
  ]),
);

// ----------------------------------------------------------------------------------

describe("useConnectedSlackChannels", () => {
  const recipient = { objectId: "obj_1", collection: "users" } as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns data from swr", () => {
    const { result } = renderHook(() =>
      useConnectedSlackChannels({ slackChannelsRecipientObject: recipient }),
    );

    expect(result.current.data).toEqual([
      { channel_id: "1", team_id: "T" } as unknown as SlackChannelConnection,
    ]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("updates channels via setChannelData and mutate", async () => {
    // Provide empty initial data
    mutateMock.mockClear();
    mockSetChannelData.mockClear();

    const { result } = renderHook(() =>
      useConnectedSlackChannels({ slackChannelsRecipientObject: recipient }),
    );

    const newChannels: SlackChannelConnection[] = [
      { channel_id: "2", team_id: "T" } as unknown as SlackChannelConnection,
    ];

    await act(async () => {
      await result.current.updateConnectedChannels(newChannels);
    });

    // Should call Knock.objects.setChannelData with correct args
    expect(mockSetChannelData).toHaveBeenCalledWith({
      objectId: recipient.objectId,
      collection: recipient.collection,
      channelId: "knock_chan",
      data: { connections: newChannels },
    });

    // mutate called to update cache and setChannelData invoked
    expect(mockSetChannelData).toHaveBeenCalled();
    expect(mutateMock).toHaveBeenCalled();
  });
});
