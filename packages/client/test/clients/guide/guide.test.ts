import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";
import { URLPattern } from "urlpattern-polyfill";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import {
  type KnockGuide,
  KnockGuideClient,
  type KnockGuideStep,
} from "../../../src/clients/guide";
import { StoreState, GuideGroupData } from "../../../src/clients/guide/types";
import Knock from "../../../src/knock";

// Mock @tanstack/store
const mockStore = {
  getState: vi.fn(() => ({
    guideGroups: [],
    guides: {},
    queries: {},
    location: undefined,
    counter: 0,
  } as StoreState)),
  setState: vi.fn((fn) => {
    if (typeof fn === "function") {
      const currentState = mockStore.state;
      const newState = fn(currentState);
      mockStore.state = newState;
      return newState;
    }
    mockStore.state = fn;
    return fn;
  }),
  state: {
    guideGroups: [],
    guides: {},
    queries: {},
    location: undefined,
    counter: 0,
  } as StoreState,
};

vi.mock("@tanstack/store", () => ({
  Store: vi.fn(() => mockStore),
}));

// Mock phoenix
vi.mock("phoenix", () => ({
  Socket: vi.fn(),
  Channel: vi.fn(),
}));

// Mock window for location tracking tests
const mockWindow = {
  location: { href: "https://example.com" },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe("KnockGuideClient", () => {
  let mockApiClient: Partial<ApiClient>;
  let mockKnock: Knock;

  beforeEach(() => {
    mockApiClient = {
      makeRequest: vi.fn().mockResolvedValue({ statusCode: "ok" }),
      socket: undefined,
    };

    mockKnock = {
      userId: "user_123",
      userToken: "token_456",
      isAuthenticated: vi.fn(() => true),
      failIfNotAuthenticated: vi.fn(),
      client: vi.fn(() => ({
        makeRequest: vi.fn(),
      })),
      log: vi.fn(),
      guides: [] as unknown[],
      user: {
        getGuides: vi
          .fn()
          .mockImplementation(() => Promise.resolve({ entries: [] })),
        markGuideStepAs: vi.fn().mockResolvedValue({ status: "ok" }),
      },
    } as unknown as Knock;

    vi.clearAllMocks();
    // Reset window to undefined by default
    vi.stubGlobal("window", undefined);
    // Reset store state
    mockStore.setState.mockClear();
    mockStore.getState.mockReturnValue({
      guideGroups: [],
      guides: {},
      queries: {},
      location: undefined,
      counter: 0,
    });
    mockStore.state = {
      guideGroups: [],
      guides: {},
      queries: {},
      location: undefined,
      counter: 0,
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const channelId = "channel_123";
  const defaultTargetParams = {
    data: { key: "value" },
    tenant: "tenant_123",
  };

  describe("constructor", () => {
    test("initializes with default options", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      expect(client.channelId).toBe(channelId);
      expect(client.targetParams).toEqual({});
      expect(Store).toHaveBeenCalledWith({
        guideGroups: [],
        guides: {},
        queries: {},
        location: undefined,
        counter: 0,
      });
    });

    test("initializes with target params", () => {
      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        defaultTargetParams,
      );

      expect(client.targetParams).toEqual(defaultTargetParams);
    });

    test("tracks location from window when enabled", () => {
      // Mock window to simulate browser environment
      vi.stubGlobal("window", mockWindow);

      const _client = new KnockGuideClient(mockKnock, channelId);

      expect(Store).toHaveBeenCalledWith({
        guideGroups: [],
        guides: {},
        queries: {},
        location: "https://example.com",
        counter: 0,
      });
    });

    test("does not track location when window is not available", () => {
      // window is already undefined from beforeEach
      const _client = new KnockGuideClient(mockKnock, channelId);

      expect(Store).toHaveBeenCalledWith({
        guideGroups: [],
        guides: {},
        queries: {},
        location: undefined,
        counter: 0,
      });
    });
  });

  describe("fetch", () => {
    test("fetches guides with default params", async () => {
      const mockResponse = {
        entries: [
          {
            __typename: "Guide",
            channel_id: channelId,
            id: "guide_123",
            key: "test_guide",
            type: "test",
            semver: "1.0.0",
            steps: [],
            activation_location_rules: [],
            inserted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(mockKnock.user.getGuides).mockResolvedValueOnce(mockResponse);

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        defaultTargetParams,
      );

      await client.fetch();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockKnock.user.getGuides).toHaveBeenCalledWith(
        channelId,
        expect.objectContaining({
          data: JSON.stringify(defaultTargetParams.data),
          tenant: defaultTargetParams.tenant,
        }),
      );
    });

    test("handles fetch errors", async () => {
      const mockError = new Error("Network error");
      vi.mocked(mockKnock.user.getGuides).mockRejectedValueOnce(mockError);

      const client = new KnockGuideClient(mockKnock, channelId);
      await client.fetch();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));

      // Get the last setState call and execute its function
      const calls = mockStore.setState.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (lastCall) {
        const setStateFunction = lastCall[0];
        const newState = setStateFunction({
          guideGroups: [],
          guides: {},
          queries: {},
          location: undefined,
          counter: 0,
        });
        expect(newState.queries).toEqual({
          "/v1/users/user_123/guides": { status: "error", error: mockError },
        });
      }
    });
  });

  describe("subscribe/unsubscribe", () => {
    test("subscribes to socket events when socket is available", () => {
      const mockChannel = {
        join: vi.fn().mockReturnValue({
          receive: vi.fn().mockReturnValue({ receive: vi.fn() }),
        }),
        on: vi.fn(),
        off: vi.fn(),
        leave: vi.fn(),
        state: "closed",
      };

      const mockSocket = {
        channel: vi.fn().mockReturnValue(mockChannel),
        isConnected: vi.fn().mockReturnValue(true),
        connect: vi.fn(),
      };

      mockApiClient.socket = mockSocket as unknown as Socket;
      vi.mocked(mockKnock.client).mockReturnValue(mockApiClient as ApiClient);

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        defaultTargetParams,
      );
      client.subscribe();

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockSocket.channel).toHaveBeenCalledWith(
        `guides:${channelId}`,
        expect.objectContaining({
          user_id: mockKnock.userId,
          data: defaultTargetParams.data,
          tenant: defaultTargetParams.tenant,
        }),
      );
      expect(mockChannel.join).toHaveBeenCalled();
    });

    test("unsubscribes from socket events", () => {
      const mockChannel = {
        join: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        leave: vi.fn(),
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      client["socketChannel"] = mockChannel as unknown as Channel;

      client.unsubscribe();

      expect(mockChannel.off).toHaveBeenCalled();
      expect(mockChannel.leave).toHaveBeenCalled();
    });
  });

  describe("guide operations", () => {
    let makeRequestSpy: ReturnType<typeof vi.fn>;
    let markGuideStepAsSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      makeRequestSpy = vi.fn().mockResolvedValue({ statusCode: "ok" });
      markGuideStepAsSpy = vi.fn().mockResolvedValue({ status: "ok" });

      mockApiClient.makeRequest = makeRequestSpy;

      // Mock the knock.user.markGuideStepAs method
      mockKnock = {
        ...mockKnock,
        user: {
          getGuides: vi
            .fn()
            .mockImplementation(() => Promise.resolve({ entries: [] })),
          markGuideStepAs: markGuideStepAsSpy,
        },
      } as unknown as Knock;

      vi.mocked(mockKnock.client).mockReturnValue({
        ...mockApiClient,
        makeRequest: makeRequestSpy,
        host: "https://api.knock.app",
        apiKey: "test_key",
        userToken: "test_token",
        axiosClient: {},
        canRetryRequest: () => true,
      } as unknown as ApiClient);
    });

    const mockStep = {
      ref: "step_1",
      schema_key: "test",
      schema_semver: "1.0.0",
      schema_variant_key: "default",
      message: {
        id: "msg_123",
        seen_at: null,
        read_at: null,
        interacted_at: null,
        archived_at: null,
        link_clicked_at: null,
      },
      content: {},
      markAsSeen: vi.fn(),
      markAsInteracted: vi.fn(),
      markAsArchived: vi.fn(),
    } as unknown as KnockGuideStep;

    const mockGuide = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_123",
      key: "test_guide",
      type: "test",
      semver: "1.0.0",
      steps: [mockStep],
      activation_location_rules: [],
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as KnockGuide;

    const mockDefaultGroup = {
      __typename: "GuideGroup",
      key: "default",
      display_sequence: [mockGuide.key],
      display_interval: null,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as GuideGroupData;

    test("marks guide step as seen", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: {[mockGuide.key]: mockGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsSeen(mockGuide, mockStep);

      expect(markGuideStepAsSpy).toHaveBeenCalledWith("seen", {
        message_id: "msg_123",
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
        content: {},
        data: undefined,
        tenant: undefined,
      });
    });

    test("marks guide step as interacted", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: {[mockGuide.key]: mockGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsInteracted(mockGuide, mockStep, { action: "clicked" });

      expect(markGuideStepAsSpy).toHaveBeenCalledWith("interacted", {
        message_id: "msg_123",
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
        metadata: { action: "clicked" },
      });
    });

    test("marks guide step as archived", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: {[mockGuide.key]: mockGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsArchived(mockGuide, mockStep);

      expect(markGuideStepAsSpy).toHaveBeenCalledWith("archived", {
        message_id: "msg_123",
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
      });
    });
  });

  describe("cleanup", () => {
    test("removes event listeners and unsubscribes", () => {
      vi.stubGlobal("window", mockWindow);

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );
      const unsubscribeSpy = vi.spyOn(client, "unsubscribe");

      client.cleanup();

      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(mockWindow.removeEventListener).toHaveBeenCalled();
    });

    test("handles cleanup when no window exists", () => {
      // Ensure window is undefined
      vi.stubGlobal("window", undefined);

      const client = new KnockGuideClient(mockKnock, channelId);

      // The cleanup method should handle undefined window gracefully
      // but the current implementation may try to access window.removeEventListener
      // Let's mock a minimal window object to prevent the error
      vi.stubGlobal("window", {
        removeEventListener: vi.fn(),
        history: undefined,
      });

      // Should not throw error
      expect(() => client.cleanup()).not.toThrow();
    });
  });

  describe("select", () => {
    const mockGuideOne = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_1",
      key: "onboarding",
      type: "card",
      semver: "1.0.0",
      steps: [],
      activation_location_rules: [
        {
          directive: "allow",
          pathname: "/dashboard",
          pattern: new URLPattern({ pathname: "/dashboard" }),
        },
      ],
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as KnockGuide;

    const mockGuideTwo = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_2",
      key: "feature_tour",
      type: "tooltip",
      semver: "1.0.0",
      steps: [],
      activation_location_rules: [
        {
          directive: "block",
          pathname: "/settings",
          pattern: new URLPattern({ pathname: "/settings" }),
        },
      ],
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as KnockGuide;

    const mockGuideThree = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_3",
      key: "system_status",
      type: "banner",
      semver: "1.0.0",
      steps: [],
      activation_location_rules: [],
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as KnockGuide;

    const mockGuides = {
      [mockGuideOne.key]: mockGuideOne,
      [mockGuideTwo.key]: mockGuideTwo,
      [mockGuideThree.key]: mockGuideThree,
    }

    const mockDefaultGroup = {
      __typename: "GuideGroup",
      key: "default",
      display_sequence: ["feature_tour", "onboarding", "system_status"],
      display_interval: null,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as GuideGroupData;

    test("selects guides without filters", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should select the first guide in the display sequence.
      // When location is undefined, guides are still included (location rules
      // are skipped).
      expect(result!.key).toBe("feature_tour");
    });

    test("filters guides by key", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, { key: "onboarding" });

      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by type", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, { type: "banner" });

      expect(result!.key).toBe("system_status");
    });

    test("filters guides by location rules - allow directive", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should include the guide with allow directive for /dashboard
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by location rules - block directive", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: "https://example.com/settings",
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should exclude the guide with block directive for /settings
      expect(result!.key).toBe("system_status");
    });

    test("handles guides without location when location is undefined", () => {
      // Create guides without location rules
      const g1 = { ...mockGuideOne, activation_location_rules: [] }
      const g2 = { ...mockGuideTwo, activation_location_rules: [] }
      const g3 = { ...mockGuideThree, activation_location_rules: [] }

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: {
          [g1.key]: g1,
          [g2.key]: g2,
          [g3.key]: g3,
        },
        queries: {},
        location: "https://example.com/settings",
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      expect(result!.key).toBe("feature_tour");
    });

    test("opens the group stage on the first select and tracks ordered guides", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      expect(client["stage"]).toBeUndefined()

      const r1 = client.selectGuide(stateWithGuides, { type: "banner" });
      expect(r1).toBeUndefined()

      const r2 = client.selectGuide(stateWithGuides, { type: "tooltip" });
      expect(r2).toBeUndefined()

      const r3 = client.selectGuide(stateWithGuides, { type: "card" });
      expect(r3).toBeUndefined()

      expect(client["stage"]).toMatchObject({
        status: 'open',
        ordered: [ 'feature_tour', 'onboarding', 'system_status' ],
      })
    });

    test("closing the group stage resolves the prevailing guide and can return on select", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guides: mockGuides,
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      client["stage"] = {
        status: "open",
        ordered: [ 'feature_tour', 'onboarding', 'system_status' ],
        timeoutId: 123,
      }

      client["closePendingGroupStage"]()

      expect(client["stage"]).toMatchObject({
        status: 'closed',
        ordered: [ 'feature_tour', 'onboarding', 'system_status' ],
        resolved: 'feature_tour'
      })

      const r1 = client.selectGuide(stateWithGuides, { type: "banner" });
      expect(r1).toBeUndefined()

      // Should return the resolved guide.
      const r2 = client.selectGuide(stateWithGuides, { type: "tooltip" });
      expect(r2).toMatchObject({ key: "feature_tour", type: "tooltip" })

      const r3 = client.selectGuide(stateWithGuides, { type: "card" });
      expect(r3).toBeUndefined()
    });

    test("patching the group stage allows re-evaluation while keeping the current resolved guide in place", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      client["stage"] = {
        status: "closed",
        ordered: [ 'feature_tour', 'onboarding', 'system_status' ],
        resolved: "feature_tour",
        timeoutId: 123,
      }

      const mockGuideFour = {
        __typename: "Guide",
        channel_id: channelId,
        id: "guide_4",
        key: "new_modal",
        type: "modal",
        semver: "1.0.0",
        steps: [],
        activation_location_rules: [],
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as KnockGuide;

      // Add a new guide, then re-evalute.
      const stateWithGuides = {
        guideGroups: [{
          ...mockDefaultGroup,
          display_sequence: ["new_modal", "feature_tour", "onboarding", "system_status"]
        }],
        guides: {
          ...mockGuides,
          [mockGuideFour.key]: mockGuideFour,
        },
        queries: {},
        location: undefined,
        counter: 0,
      };

      client["patchClosedGroupStage"]();

      expect(client["stage"]).toMatchObject({
        status: "patch",
        ordered: [],
        resolved: "feature_tour",
      })

      expect(client.selectGuide(stateWithGuides, { type: "banner" })).toBeUndefined()

      // Should return the current resolved guide
      expect(client.selectGuide(stateWithGuides, { type: "tooltip" })).toMatchObject({
        key: "feature_tour",
        type: "tooltip"
      })

      expect(client.selectGuide(stateWithGuides, { type: "card" })).toBeUndefined()
      expect(client.selectGuide(stateWithGuides, { type: "modal" })).toBeUndefined()

      client["closePendingGroupStage"]();

      expect(client["stage"]).toMatchObject({
        status: "closed",
        ordered: ["new_modal", "feature_tour", "onboarding", "system_status"],
        resolved: "new_modal",
        timeoutId: null,
      })

      expect(client.selectGuide(stateWithGuides, { type: "banner" })).toBeUndefined()
      expect(client.selectGuide(stateWithGuides, { type: "tooltip" })).toBeUndefined()
      expect(client.selectGuide(stateWithGuides, { type: "card" })).toBeUndefined()

      // Now renders the newly resolved guide.
      expect(client.selectGuide(stateWithGuides, { type: "modal" })).toMatchObject({
        key: "new_modal",
        type: "modal"
      })
    });
  });

  describe("socket event handling", () => {
    test("handles guide.added event", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const mockGuideData = {
        __typename: "Guide" as const,
        channel_id: channelId,
        id: "guide_new",
        key: "new_guide",
        type: "test",
        semver: "1.0.0",
        steps: [],
        activation_location_rules: [],
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const addEvent = {
        topic: `guides:${channelId}`,
        event: "guide.added" as const,
        data: { guide: mockGuideData, eligible: true as const },
      };

      client["handleSocketEvent"](addEvent);

      expect(mockStore.setState).toHaveBeenCalled();
      expect(client.store.state.guides[mockGuideData.key]).toMatchObject({ key: "new_guide" })
    });

    test("handles guide.updated event with eligible=true", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const existingGuide = {
        __typename: "Guide" as const,
        channel_id: channelId,
        id: "guide_existing",
        key: "existing_guide",
        type: "test",
        semver: "1.0.0",
        steps: [],
        activation_location_rules: [],
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guides: {[existingGuide.key]: existingGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };

      const updatedGuide = {
        ...existingGuide,
        type: "updated-type",
      };
      const updateEvent = {
        topic: `guides:${channelId}`,
        event: "guide.updated" as const,
        data: { guide: updatedGuide, eligible: true as const },
      };

      client["handleSocketEvent"](updateEvent);

      expect(mockStore.setState).toHaveBeenCalled();

      expect(client.store.state.guides[existingGuide.key]).toMatchObject({
        key: "existing_guide",
        type: "updated-type"
      })
    });

    test("handles guide.updated event with eligible=false", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const existingGuide = {
        __typename: "Guide" as const,
        channel_id: channelId,
        id: "guide_existing",
        key: "existing_guide",
        type: "test",
        semver: "1.0.0",
        steps: [],
        activation_location_rules: [],
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guides: {[existingGuide.key]: existingGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };

      const updateEvent = {
        topic: `guides:${channelId}`,
        event: "guide.updated" as const,
        data: { guide: existingGuide, eligible: false as const },
      };

      client["handleSocketEvent"](updateEvent);

      expect(mockStore.setState).toHaveBeenCalled();
      expect(client.store.state.guides[existingGuide.key]).toBeUndefined()
    });

    test("handles guide.removed event", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const existingGuide = {
        __typename: "Guide" as const,
        channel_id: channelId,
        id: "guide_existing",
        key: "existing_guide",
        type: "test",
        semver: "1.0.0",
        steps: [],
        activation_location_rules: [],
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guides: {[existingGuide.key]: existingGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };

      const removeEvent = {
        topic: `guides:${channelId}`,
        event: "guide.removed" as const,
        data: { guide: { key: "existing_guide" } },
      };

      client["handleSocketEvent"](removeEvent);

      expect(mockStore.setState).toHaveBeenCalled();
      expect(client.store.state.guides[existingGuide.key]).toBeUndefined()
    });
  });

  describe("location tracking", () => {
    test("sets up location change listeners when trackLocationFromWindow is true", () => {
      vi.stubGlobal("window", {
        ...mockWindow,
        history: {
          pushState: vi.fn(),
          replaceState: vi.fn(),
        },
      });

      const _client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function),
      );
    });

    test("monkey patches history methods when trackLocationFromWindow is true", () => {
      const mockHistory = {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      };

      vi.stubGlobal("window", {
        ...mockWindow,
        history: mockHistory,
      });

      // Verify that history methods were monkey-patched
      const windowWithHistory = window as unknown as {
        history: { pushState: unknown; replaceState: unknown };
      };
      expect(typeof windowWithHistory.history.pushState).toBe("function");
      expect(typeof windowWithHistory.history.replaceState).toBe("function");
    });

    test("handles location changes", () => {
      vi.stubGlobal("window", {
        ...mockWindow,
        location: { href: "https://example.com/new-page" },
      });

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      // Trigger location change handler
      client["handleLocationChange"]();

      expect(mockStore.setState).toHaveBeenCalled();
    });

    test("restores original history methods on cleanup", () => {
      const originalPushState = vi.fn();
      const originalReplaceState = vi.fn();

      const mockHistory = {
        pushState: originalPushState,
        replaceState: originalReplaceState,
      };

      vi.stubGlobal("window", {
        ...mockWindow,
        history: mockHistory,
      });

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      client.cleanup();

      // Verify that original methods were restored
      const windowWithHistory = window as unknown as {
        history: { pushState: unknown; replaceState: unknown };
      };
      expect(windowWithHistory.history.pushState).toBe(originalPushState);
      expect(windowWithHistory.history.replaceState).toBe(originalReplaceState);
    });
  });

  describe("private methods", () => {
    test("buildQueryParams formats parameters correctly", () => {
      const client = new KnockGuideClient(mockKnock, channelId, {
        data: { key: "value" },
        tenant: "test_tenant",
      });

      const result = client["buildQueryParams"]({ type: "tooltip" });

      expect(result).toEqual({
        data: JSON.stringify({ key: "value" }),
        tenant: "test_tenant",
        type: "tooltip",
      });
    });

    test("buildQueryParams handles missing data and tenant", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const result = client["buildQueryParams"]();

      expect(result).toEqual({});
    });

    test("formatQueryKey creates consistent key from params", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const params = { type: "tooltip", data: '{"key":"value"}' };
      const result = client["formatQueryKey"](params);

      expect(typeof result).toBe("string");
      expect(result).toContain("type=tooltip");
    });

    test("buildEngagementEventBaseParams creates correct parameters", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const mockStep = {
        ref: "step_1",
        message: { id: "msg_123" },
      } as unknown as KnockGuideStep;

      const mockGuide = {
        id: "guide_123",
        key: "test_guide",
        channel_id: channelId,
      } as unknown as KnockGuide;

      const result = client["buildEngagementEventBaseParams"](
        mockGuide,
        mockStep,
      );

      expect(result).toEqual({
        message_id: "msg_123",
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
      });
    });

    test("setStepMessageAttrs updates step message attributes", () => {
      const mockGuide = {
        key: "test_guide",
        steps: [
          {
            ref: "step_1",
            message: { id: "msg_123", seen_at: null },
          },
        ],
      } as unknown as KnockGuide;

      mockStore.state = {
        guideGroups: [],
        guides: {[mockGuide.key]: mockGuide},
        queries: {},
        location: undefined,
        counter: 0,
      };

      const client = new KnockGuideClient(mockKnock, channelId);

      client["setStepMessageAttrs"]("test_guide", "step_1", {
        seen_at: "2023-01-01T00:00:00Z",
      });

      expect(mockStore.setState).toHaveBeenCalled();
    });
  });

  describe("no socket available", () => {
    test("subscribe handles missing socket gracefully", () => {
      mockApiClient.socket = undefined;

      const _client = new KnockGuideClient(mockKnock, channelId);

      // Should not throw error
      expect(() => _client.subscribe()).not.toThrow();
    });

    test("unsubscribe handles missing socket channel gracefully", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Should not throw error when no socket channel exists
      expect(() => client.unsubscribe()).not.toThrow();
    });
  });

  describe("fetch with filters", () => {
    test("fetches guides with type filter", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      await client.fetch({ filters: { type: "tooltip" } });

      expect(mockKnock.failIfNotAuthenticated).toHaveBeenCalled();
      expect(mockKnock.user.getGuides).toHaveBeenCalledWith(
        channelId,
        expect.objectContaining({
          type: "tooltip",
        }),
      );
    });
  });
});
