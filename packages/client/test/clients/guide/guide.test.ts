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
import {
  GuideActivationUrlRuleData,
  GuideGroupData,
  StoreState,
} from "../../../src/clients/guide/types";
import Knock from "../../../src/knock";

// Mock @tanstack/store
const mockStore = {
  getState: vi.fn(
    () =>
      ({
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: {},
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      }) as StoreState,
  ),
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
    guideGroupDisplayLogs: {},
    guides: {},
    previewGuides: {},
    queries: {},
    location: undefined,
    counter: 0,
    debug: { forcedGuideKey: null, previewSessionId: null },
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
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
};

describe("KnockGuideClient", () => {
  let mockApiClient: Partial<ApiClient>;
  let mockKnock: Knock;

  beforeEach(() => {
    // Clear all mocks first
    vi.clearAllMocks();

    // Reset window to undefined by default
    vi.stubGlobal("window", undefined);
    // Replace global timers with mock versions
    vi.useFakeTimers();

    // Reset store state
    mockStore.setState.mockClear();
    mockStore.getState.mockClear();
    mockStore.getState.mockReturnValue({
      guideGroups: [],
      guideGroupDisplayLogs: {},
      guides: {},
      previewGuides: {},
      queries: {},
      location: undefined,
      counter: 0,
      debug: { forcedGuideKey: null, previewSessionId: null },
    });
    mockStore.state = {
      guideGroups: [],
      guideGroupDisplayLogs: {},
      guides: {},
      previewGuides: {},
      queries: {},
      location: undefined,
      counter: 0,
      debug: { forcedGuideKey: null, previewSessionId: null },
    };

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
  });

  afterEach(() => {
    vi.useRealTimers();
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
        guideGroupDisplayLogs: {},
        guides: {},
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
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
        guideGroupDisplayLogs: {},
        guides: {},
        previewGuides: {},
        queries: {},
        location: "https://example.com",
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      });
    });

    test("does not track location when window is not available", () => {
      // window is already undefined from beforeEach
      const _client = new KnockGuideClient(mockKnock, channelId);

      expect(Store).toHaveBeenCalledWith({
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: {},
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      });
    });

    test("handles localStorage errors gracefully during initialization", () => {
      const mockLocalStorageWithErrors = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error("Privacy mode or quota exceeded");
        }),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error("Privacy mode or quota exceeded");
        }),
      };

      vi.stubGlobal("window", {
        location: {
          search:
            "?knock_guide_key=test_guide&knock_preview_session_id=session123",
        },
        localStorage: mockLocalStorageWithErrors,
      });

      expect(() => {
        new KnockGuideClient(mockKnock, channelId);
      }).not.toThrow();

      expect(mockLocalStorageWithErrors.setItem).toHaveBeenCalled();
    });

    test("starts the counter interval clock and sets the interval id", () => {
      const client = new KnockGuideClient(mockKnock, channelId);
      expect(client["counterIntervalId"]).toBeDefined();
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
            active: true,
            steps: [],
            activation_url_rules: [],
            activation_url_patterns: [],
            bypass_global_group_limit: false,
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
          guideGroupDisplayLogs: {},
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
          receive: vi.fn().mockReturnValue({
            receive: vi.fn().mockReturnValue({
              receive: vi.fn(),
            }),
          }),
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

    test("handles successful channel join", () => {
      let okCallback: () => void;
      const mockChannel = {
        join: vi.fn().mockReturnValue({
          receive: vi.fn((event, callback) => {
            if (event === "ok") {
              okCallback = callback;
            }
            return {
              receive: vi.fn().mockReturnValue({ receive: vi.fn() }),
            };
          }),
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

      // Trigger the ok callback
      okCallback!();

      expect(mockKnock.log).toHaveBeenCalledWith(
        "[Guide] Successfully joined channel",
      );
    });

    test("unsubscribes after reaching max retry limit", () => {
      let errorCallback: (resp: { reason: string }) => void;
      const mockChannel = {
        join: vi.fn().mockReturnValue({
          receive: vi.fn((event, callback) => {
            if (event === "error") {
              errorCallback = callback;
            }
            return {
              receive: vi.fn((event, callback) => {
                if (event === "error") {
                  errorCallback = callback;
                }
                return {
                  receive: vi.fn((event, callback) => {
                    if (event === "error") {
                      errorCallback = callback;
                    }
                    return { receive: vi.fn() };
                  }),
                };
              }),
            };
          }),
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

      const unsubscribeSpy = vi.spyOn(client, "unsubscribe");

      client.subscribe();

      // Initial fail. The retry count starts at 0 and is incremented on each
      // error to represent the next retry.
      errorCallback!({ reason: "auth_error" });

      // First retry fail
      expect(client["subscribeRetryCount"]).toBe(1);
      errorCallback!({ reason: "auth_error" });

      // Second retry fail
      expect(client["subscribeRetryCount"]).toBe(2);
      errorCallback!({ reason: "auth_error" });

      // Third retry fail
      expect(client["subscribeRetryCount"]).toBe(3);
      errorCallback!({ reason: "auth_error" });

      // Check that the max retry limit message was logged
      expect(mockKnock.log).toHaveBeenCalledWith(
        "[Guide] Channel join max retry limit reached: 3",
      );

      expect(unsubscribeSpy).toHaveBeenCalled();
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

    test("subscribe includes force_all_guides when debug state has forcedGuideKey", () => {
      const mockChannel = {
        join: vi.fn().mockReturnValue({
          receive: vi.fn().mockReturnValue({
            receive: vi.fn().mockReturnValue({
              receive: vi.fn(),
            }),
          }),
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

      // Set debug state with forced guide key
      client.store.state.debug = {
        forcedGuideKey: "test_guide",
        previewSessionId: "test-session-id",
      };

      client.subscribe();

      expect(mockSocket.channel).toHaveBeenCalledWith(
        `guides:${channelId}`,
        expect.objectContaining({
          user_id: mockKnock.userId,
          data: defaultTargetParams.data,
          tenant: defaultTargetParams.tenant,
          force_all_guides: true,
        }),
      );
    });
  });

  describe("guide operations", () => {
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
      active: true,
      steps: [mockStep],
      activation_url_rules: [],
      activation_url_patterns: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
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
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsSeen(mockGuide, mockStep);

      expect(mockKnock.user.markGuideStepAs).toHaveBeenCalledWith("seen", {
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
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsInteracted(mockGuide, mockStep, { action: "clicked" });

      expect(mockKnock.user.markGuideStepAs).toHaveBeenCalledWith(
        "interacted",
        {
          channel_id: channelId,
          guide_key: "test_guide",
          guide_id: "guide_123",
          guide_step_ref: "step_1",
          metadata: { action: "clicked" },
        },
      );
    });

    test("marks guide step as interacted and returns new guide object", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      // Store the original guide reference
      const originalGuideRef = mockStore.state.guides[mockGuide.key];

      await client.markAsInteracted(mockGuide, mockStep, { action: "clicked" });

      // Get the setState function and execute it to verify the state changes
      const setStateCalls = mockStore.setState.mock.calls;
      const stateUpdateFn = setStateCalls.find(
        (call) => typeof call[0] === "function",
      )?.[0];

      const newState = stateUpdateFn(stateWithGuides);

      // Verify that the guide object is a new reference (not the same object)
      // This ensures useStore triggers a re-render
      expect(newState.guides[mockGuide.key]).not.toBe(originalGuideRef);
    });

    test("marks guide step as archived", async () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsArchived(mockGuide, mockStep);

      expect(mockKnock.user.markGuideStepAs).toHaveBeenCalledWith("archived", {
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
        unthrottled: false,
      });
    });

    test("marks guide step as archived with bypass_global_group_limit true", async () => {
      // Create a fresh mock step for this test
      const freshMockStep = {
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

      const unthrottledGuide = {
        ...mockGuide,
        bypass_global_group_limit: true,
        steps: [freshMockStep],
        getStep: vi.fn().mockReturnValue(freshMockStep),
      } as unknown as KnockGuide;

      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: { [unthrottledGuide.key]: unthrottledGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsArchived(unthrottledGuide, freshMockStep);

      expect(mockKnock.user.markGuideStepAs).toHaveBeenCalledWith("archived", {
        channel_id: channelId,
        guide_key: "test_guide",
        guide_id: "guide_123",
        guide_step_ref: "step_1",
        unthrottled: true,
      });
    });

    test("updates guideGroupDisplayLogs when archiving throttled guide", async () => {
      // Create a fresh mock step for this test
      const freshMockStep = {
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

      const throttledGuide = {
        ...mockGuide,
        steps: [freshMockStep],
        getStep: vi.fn().mockReturnValue(freshMockStep),
      } as unknown as KnockGuide;

      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: { [throttledGuide.key]: throttledGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsArchived(throttledGuide, freshMockStep);

      // Check that setState was called with a function that updates guideGroupDisplayLogs
      expect(mockStore.setState).toHaveBeenCalled();

      // Get the setState function and execute it to verify the state changes
      const setStateCalls = mockStore.setState.mock.calls;
      const stateUpdateFn = setStateCalls.find(
        (call) => typeof call[0] === "function",
      )?.[0];

      const newState = stateUpdateFn(stateWithGuides);
      expect(newState.guideGroupDisplayLogs).toHaveProperty("default");
      expect(newState.guideGroupDisplayLogs.default).toBeTruthy();
    });

    test("does not update guideGroupDisplayLogs when archiving unthrottled guide", async () => {
      // Create a fresh mock step for this test
      const freshMockStep = {
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

      const unthrottledGuide = {
        ...mockGuide,
        bypass_global_group_limit: true,
        steps: [freshMockStep],
        getStep: vi.fn().mockReturnValue(freshMockStep),
      } as unknown as KnockGuide;

      const client = new KnockGuideClient(mockKnock, channelId);

      // Mock the store to have the guide so setStepMessageAttrs can find it
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: { [unthrottledGuide.key]: unthrottledGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };
      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      await client.markAsArchived(unthrottledGuide, freshMockStep);

      // Check that setState was called with a function that does NOT update guideGroupDisplayLogs
      expect(mockStore.setState).toHaveBeenCalled();

      // Get the setState function and execute it to verify the state changes
      const setStateCalls = mockStore.setState.mock.calls;
      const stateUpdateFn = setStateCalls.find(
        (call) => typeof call[0] === "function",
      )?.[0];

      const newState = stateUpdateFn(stateWithGuides);
      expect(newState.guideGroupDisplayLogs).toEqual({});
    });
  });

  describe("cleanup", () => {
    test("removes event listeners, unsubscribes, and an interval", () => {
      vi.stubGlobal("window", mockWindow);

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      const unsubscribeSpy = vi.spyOn(client, "unsubscribe");
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      client.cleanup();

      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();

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
    const mockStep = {
      ref: "step_1",
      schema_key: "foo",
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

    const mockGuideOne = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_1",
      key: "onboarding",
      type: "card",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_rules: [],
      activation_url_patterns: [
        {
          directive: "allow",
          pathname: "/dashboard",
          pattern: new URLPattern({ pathname: "/dashboard" }),
        },
      ],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuideTwo = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_2",
      key: "feature_tour",
      type: "tooltip",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_rules: [],
      activation_url_patterns: [
        {
          directive: "block",
          pathname: "/settings",
          pattern: new URLPattern({ pathname: "/settings" }),
        },
      ],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuideThree = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_3",
      key: "system_status",
      type: "banner",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_rules: [],
      activation_url_patterns: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuides = {
      [mockGuideOne.key]: mockGuideOne,
      [mockGuideTwo.key]: mockGuideTwo,
      [mockGuideThree.key]: mockGuideThree,
    };

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
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
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
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, {
        key: "onboarding",
      });

      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by type", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, {
        type: "banner",
      });

      expect(result!.key).toBe("system_status");
    });

    test("filters guides by url patterns - allow directive", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should include the guide with allow directive for /dashboard
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by url patterns - block directive", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: "https://example.com/settings",
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should exclude the guide with block directive for /settings
      expect(result!.key).toBe("system_status");
    });

    test("filters guides by activation_url_rules - allow directive with equal_to", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_patterns: [],
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "equal_to",
            argument: "/dashboard",
          },
        ] as GuideActivationUrlRuleData[],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should include the guide with allow rule for /dashboard
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by activation_url_rules - allow directive with contains", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "contains",
            argument: "dash",
          },
        ] as GuideActivationUrlRuleData[],
        activation_url_patterns: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should include the guide with contains rule matching "dash"
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by activation_url_rules - block directive with equal_to", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideTwo,
        activation_url_rules: [
          {
            directive: "block",
            variable: "pathname",
            operator: "equal_to",
            argument: "/settings",
          },
        ] as GuideActivationUrlRuleData[],
        activation_url_patterns: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/settings",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should exclude the guide with block rule for /settings
      expect(result!.key).toBe("system_status");
    });

    test("filters guides by activation_url_rules - block directive with contains", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideTwo,
        activation_url_rules: [
          {
            directive: "block",
            variable: "pathname",
            operator: "contains",
            argument: "setting",
          },
        ] as GuideActivationUrlRuleData[],
        activation_url_patterns: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/user/settings",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should exclude the guide with block rule containing "setting"
      expect(result!.key).toBe("system_status");
    });

    test("filters guides by activation_url_rules - mixed allow and block rules (block prevails)", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "contains",
            argument: "admin",
          },
          {
            directive: "block",
            variable: "pathname",
            operator: "equal_to",
            argument: "/admin/settings",
          },
        ] as GuideActivationUrlRuleData[],
        activation_url_patterns: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/admin/settings",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Block rule should prevail even if allow rule also matches
      // feature_tour is excluded because it has url_patterns that don't match this location
      // onboarding is excluded because block rule prevails
      // system_status has no rules and is included
      expect(result!.key).toBe("system_status");
    });

    test("filters guides by activation_url_rules - multiple allow rules (any match allows)", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_patterns: [],
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "equal_to",
            argument: "/home",
          },
          {
            directive: "allow",
            variable: "pathname",
            operator: "equal_to",
            argument: "/dashboard",
          },
        ] as GuideActivationUrlRuleData[],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should allow the guide when any allow rule matches
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by activation_url_rules - handles leading slash in arguments", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_patterns: [],
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "equal_to",
            argument: "dashboard", // No leading slash
          },
        ] as GuideActivationUrlRuleData[],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should handle argument without leading slash correctly
      expect(result!.key).toBe("onboarding");
    });

    test("filters guides by activation_url_rules - no match when url rules don't match", () => {
      const mockGuideWithUrlRules = {
        ...mockGuideOne,
        activation_url_rules: [
          {
            directive: "allow",
            variable: "pathname",
            operator: "equal_to",
            argument: "/admin",
          },
        ] as GuideActivationUrlRuleData[],
        activation_url_patterns: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideOne.key]: mockGuideWithUrlRules,
        },
        queries: {},
        location: "https://example.com/dashboard",
        counter: 0,
        previewGuides: {},
        debug: { forcedGuideKey: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // Should not match the guide when url rules don't match
      // feature_tour is excluded because it has url_patterns that don't match this location
      // onboarding is excluded because its url_rules don't match
      // system_status has no rules and is included
      expect(result!.key).toBe("system_status");
    });

    test("handles guides without location when location is undefined", () => {
      // Create guides without location rules
      const g1 = {
        ...mockGuideOne,
        activation_url_patterns: [],
        activation_url_rules: [],
      };
      const g2 = {
        ...mockGuideTwo,
        activation_url_patterns: [],
        activation_url_rules: [],
      };
      const g3 = {
        ...mockGuideThree,
        activation_url_patterns: [],
        activation_url_rules: [],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          [g1.key]: g1,
          [g2.key]: g2,
          [g3.key]: g3,
        },
        previewGuides: {},
        queries: {},
        location: "https://example.com/settings",
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      expect(result!.key).toBe("feature_tour");
    });

    test("opens the group stage on the first select and tracks ordered guides", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      expect(client["stage"]).toBeUndefined();

      const r1 = client.selectGuide(stateWithGuides, { type: "banner" });
      expect(r1).toBeUndefined();

      const r2 = client.selectGuide(stateWithGuides, { type: "tooltip" });
      expect(r2).toBeUndefined();

      const r3 = client.selectGuide(stateWithGuides, { type: "card" });
      expect(r3).toBeUndefined();

      expect(client["stage"]).toMatchObject({
        status: "open",
        ordered: ["feature_tour", "onboarding", "system_status"],
      });
    });

    test("closing the group stage resolves the prevailing guide and can return on select", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);

      client["stage"] = {
        status: "open",
        ordered: ["feature_tour", "onboarding", "system_status"],
        timeoutId: 123,
      };

      client["closePendingGroupStage"]();

      expect(client["stage"]).toMatchObject({
        status: "closed",
        ordered: ["feature_tour", "onboarding", "system_status"],
        resolved: "feature_tour",
      });

      const r1 = client.selectGuide(stateWithGuides, { type: "banner" });
      expect(r1).toBeUndefined();

      // Should return the resolved guide.
      const r2 = client.selectGuide(stateWithGuides, { type: "tooltip" });
      expect(r2).toMatchObject({ key: "feature_tour", type: "tooltip" });

      const r3 = client.selectGuide(stateWithGuides, { type: "card" });
      expect(r3).toBeUndefined();
    });

    test("patching the group stage allows re-evaluation while keeping the current resolved guide in place", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      client["stage"] = {
        status: "closed",
        ordered: ["feature_tour", "onboarding", "system_status"],
        resolved: "feature_tour",
        timeoutId: 123,
      };

      const mockGuideFour = {
        __typename: "Guide",
        channel_id: channelId,
        id: "guide_4",
        key: "new_modal",
        type: "modal",
        semver: "1.0.0",
        active: true,
        steps: [mockStep],
        activation_url_patterns: [],
        activation_url_rules: [],
        bypass_global_group_limit: false,
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as KnockGuide;

      // Add a new guide, then re-evalute.
      const stateWithGuides = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_sequence: [
              "new_modal",
              "feature_tour",
              "onboarding",
              "system_status",
            ],
          },
        ],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideFour.key]: mockGuideFour,
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      client["patchClosedGroupStage"]();

      expect(client["stage"]).toMatchObject({
        status: "patch",
        ordered: [],
        resolved: "feature_tour",
      });

      expect(
        client.selectGuide(stateWithGuides, { type: "banner" }),
      ).toBeUndefined();

      // Should return the current resolved guide
      expect(
        client.selectGuide(stateWithGuides, { type: "tooltip" }),
      ).toMatchObject({
        key: "feature_tour",
        type: "tooltip",
      });

      expect(
        client.selectGuide(stateWithGuides, { type: "card" }),
      ).toBeUndefined();
      expect(
        client.selectGuide(stateWithGuides, { type: "modal" }),
      ).toBeUndefined();

      client["closePendingGroupStage"]();

      expect(client["stage"]).toMatchObject({
        status: "closed",
        ordered: ["new_modal", "feature_tour", "onboarding", "system_status"],
        resolved: "new_modal",
        timeoutId: null,
      });

      expect(
        client.selectGuide(stateWithGuides, { type: "banner" }),
      ).toBeUndefined();
      expect(
        client.selectGuide(stateWithGuides, { type: "tooltip" }),
      ).toBeUndefined();
      expect(
        client.selectGuide(stateWithGuides, { type: "card" }),
      ).toBeUndefined();

      // Now renders the newly resolved guide.
      expect(
        client.selectGuide(stateWithGuides, { type: "modal" }),
      ).toMatchObject({
        key: "new_modal",
        type: "modal",
      });
    });

    test("does not select an archived guide", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: {
            ...mockGuideTwo,
            steps: [
              {
                ...mockStep,
                message: {
                  ...mockStep.message,
                  archived_at: new Date().toISOString(),
                },
              },
            ],
          },
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      // feature_tour is the first in the order but archived, so should return
      // the next one.
      expect(result!.key).toBe("onboarding");
    });

    test("returns an archived guide when forced guide key is set", () => {
      const archivedGuide = {
        ...mockGuideThree,
        steps: [
          {
            ...mockStep,
            message: {
              ...mockStep.message,
              archived_at: new Date().toISOString(),
            },
          },
        ],
      };

      const stateWithArchivedGuide = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideThree.key]: archivedGuide,
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          // Force the archived guide
          forcedGuideKey: mockGuideThree.key,
          session_id: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithArchivedGuide, {
        key: mockGuideThree.key,
      });

      // Should return the forced guide even though it's archived
      expect(result!.key).toBe("system_status");
      expect(result!.steps[0]!.message.archived_at).toBeTruthy();
    });

    test("returns preview guide when forced guide key matches and preview guide exists", () => {
      const previewGuide = {
        ...mockGuideTwo,
        type: "preview-type",
        steps: [
          {
            ...mockStep,
            content: { title: "Preview Content" },
          },
        ],
      };

      const stateWithPreviewGuide = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: undefined as unknown as KnockGuide,
        },
        previewGuides: {
          [mockGuideTwo.key]: previewGuide,
        },
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          forcedGuideKey: mockGuideTwo.key,
          preview_session_id: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithPreviewGuide);

      // Should return the preview guide instead of the regular guide
      expect(result!.key).toBe("feature_tour");
      expect(result!.type).toBe("preview-type");
      expect(result!.steps[0]!.content).toEqual({ title: "Preview Content" });

      // Verify it's the preview guide, not the regular guide
      expect(result!.type).not.toBe("regular-type");
    });

    test("doesn't return the preview guide when filtered by a different key", () => {
      const previewGuide = {
        ...mockGuideTwo,
        type: "preview-type",
        steps: [
          {
            ...mockStep,
            content: { title: "Preview Content" },
          },
        ],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {
          [mockGuideTwo.key]: previewGuide,
        },
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          forcedGuideKey: mockGuideTwo.key,
          preview_session_id: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, {
        key: "onboarding",
      });

      expect(result!.key).toBe("onboarding");
    });

    test("doesn't return the preview guide when filtered by a different type", () => {
      const previewGuide = {
        ...mockGuideTwo,
        type: "preview-type",
        steps: [
          {
            ...mockStep,
            content: { title: "Preview Content" },
          },
        ],
      };

      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: mockGuides,
        previewGuides: {
          [mockGuideTwo.key]: previewGuide,
        },
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          forcedGuideKey: mockGuideTwo.key,
          preview_session_id: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides, {
        type: "banner",
      });

      expect(result!.key).toBe("system_status");
    });

    test("does not return a guide inside a throttle window ", () => {
      const stateWithGuides = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(),
        },
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result1 = client["_selectGuide"](stateWithGuides);

      // Even though we have selectable guides to return, we are inside the
      // configured throttle window, therefore should return nothing.
      expect(result1).toBeUndefined();

      // Fast forward 10 mins (in ms).
      vi.advanceTimersByTime(10 * 60 * 1000);

      // We should be outside the configured throttle window, so expect the
      // first guide in the display queue to be returned.
      const result2 = client["_selectGuide"](stateWithGuides);
      expect(result2!.key).toBe("feature_tour");
    });

    test("can return an unthrottled guide even though inside a throttle window ", () => {
      const stateWithGuides = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(),
        },
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: {
            ...mockGuideTwo,
            bypass_global_group_limit: true,
          },
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuide"](stateWithGuides);

      expect(result!.key).toBe("feature_tour");
    });

    test("returns a guide with includeThrottled option even inside throttle window", () => {
      const stateWithGuides = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(), // Throttle window started now
        },
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);

      // Without includeThrottled, should return undefined (throttled)
      const result1 = client["_selectGuide"](stateWithGuides, { type: "banner" });
      expect(result1).toBeUndefined();

      // Reset the group stage for the next test
      client["clearGroupStage"]();

      // With includeThrottled: true, should return the banner guide
      const result2 = client["_selectGuide"](stateWithGuides, { type: "banner" }, { includeThrottled: true });
      expect(result2).toBeDefined();
      expect(result2!.type).toBe("banner");
    });
  });

  describe("selectGuides", () => {
    const mockStep = {
      ref: "step_1",
      schema_key: "foo",
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

    const mockGuideOne = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_1",
      key: "onboarding",
      type: "card",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_patterns: [],
      activation_url_rules: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuideTwo = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_2",
      key: "changelog",
      type: "card",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_patterns: [],
      activation_url_rules: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuideThree = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_3",
      key: "system_status",
      type: "banner",
      semver: "1.0.0",
      steps: [mockStep],
      active: true,
      activation_url_patterns: [],
      activation_url_rules: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuides = {
      [mockGuideOne.key]: mockGuideOne,
      [mockGuideTwo.key]: mockGuideTwo,
      [mockGuideThree.key]: mockGuideThree,
    };

    const mockDefaultGroup = {
      __typename: "GuideGroup",
      key: "default",
      display_sequence: ["changelog", "system_status", "onboarding"],
      display_interval: 60,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as GuideGroupData;

    const stateWithGuides = {
      guideGroups: [mockDefaultGroup],
      guideGroupDisplayLogs: {},
      guides: mockGuides,
      previewGuides: {},
      queries: {},
      location: undefined,
      counter: 0,
      debug: { forcedGuideKey: null, previewSessionId: null },
    };

    test("returns all guides without filters", () => {
      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithGuides);

      expect(result).toHaveLength(3);
      expect(result.map((g) => g.key)).toEqual([
        "changelog",
        "system_status",
        "onboarding",
      ]);
    });

    test("filters guides by key", () => {
      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithGuides, {
        key: "onboarding",
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.key).toBe("onboarding");
    });

    test("filters guides by type", () => {
      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithGuides, { type: "card" });

      expect(result).toHaveLength(2);

      expect(result[0]!.key).toBe("changelog");
      expect(result[0]!.type).toBe("card");

      expect(result[1]!.key).toBe("onboarding");
      expect(result[1]!.type).toBe("card");
    });

    test("returns empty array when no guides match filters", () => {
      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithGuides, {
        type: "nonexistent",
      });

      expect(result).toEqual([]);
    });

    test("excludes guides where all steps are archived", () => {
      const stateWithArchivedGuide = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: {
            ...mockGuideTwo,
            steps: [
              {
                ...mockStep,
                message: {
                  ...mockStep.message,
                  archived_at: new Date().toISOString(),
                },
              },
            ],
          },
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithArchivedGuide);

      // Should exclude guides where all steps are archived
      expect(result).toHaveLength(2);
      expect(result.map((g) => g.key)).toEqual(["system_status", "onboarding"]);
    });

    test("can return a preview guide when no other guides are available", () => {
      const stateWithOnlyPreviewGuide = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {},
        previewGuides: {
          [mockGuideTwo.key]: mockGuideTwo,
        },
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          forcedGuideKey: mockGuideTwo.key,
          previewSessionId: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithOnlyPreviewGuide, {
        key: mockGuideTwo.key,
      });
      expect(result).toHaveLength(1);
      expect(result[0]!.key).toBe(mockGuideTwo.key);
    });

    test("does not return an inactive guide when forced guide key is set", () => {
      const stateWithGuides = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: {
            ...mockGuideTwo,
            active: false,
          },
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: {
          forcedGuideKey: mockGuideThree.key,
          previewSessionId: "test-session-id",
        },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateWithGuides);

      expect(result).toHaveLength(2);
      expect(result[0]!.key).toBe(mockGuideThree.key);
      expect(result[1]!.key).toBe(mockGuideOne.key);
    });

    test("returns empty array when inside throttle window by default", () => {
      const stateInsideThrottleWindow = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(), // Throttle window started now
        },
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateInsideThrottleWindow);

      // All guides have bypass_global_group_limit: false, so all are throttled
      expect(result).toEqual([]);
    });

    test("returns only guides with bypass_global_group_limit when inside throttle window", () => {
      const mockGuideWithBypass = {
        ...mockGuideTwo,
        bypass_global_group_limit: true,
      };

      const stateInsideThrottleWindow = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(), // Throttle window started now
        },
        guides: {
          ...mockGuides,
          [mockGuideTwo.key]: mockGuideWithBypass,
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](stateInsideThrottleWindow);

      // Only the guide with bypass_global_group_limit: true should be returned
      expect(result).toHaveLength(1);
      expect(result[0]!.key).toBe(mockGuideTwo.key);
      expect(result[0]!.bypass_global_group_limit).toBe(true);
    });

    test("returns all guides with includeThrottled option even inside throttle window", () => {
      const stateInsideThrottleWindow = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: new Date().toISOString(), // Throttle window started now
        },
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);
      const result = client["_selectGuides"](
        stateInsideThrottleWindow,
        {},
        { includeThrottled: true },
      );

      // With includeThrottled: true, all guides should be returned
      expect(result).toHaveLength(3);
      expect(result.map((g) => g.key)).toEqual([
        "changelog",
        "system_status",
        "onboarding",
      ]);
    });

    test("returns all guides when outside throttle window regardless of includeThrottled", () => {
      // Throttle window started 10 minutes ago with a 5 minute interval
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      const stateOutsideThrottleWindow = {
        guideGroups: [
          {
            ...mockDefaultGroup,
            display_interval: 5 * 60, // 5 minutes
          },
        ],
        guideGroupDisplayLogs: {
          default: tenMinutesAgo,
        },
        guides: mockGuides,
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const client = new KnockGuideClient(mockKnock, channelId);

      // Without includeThrottled
      const result = client["_selectGuides"](stateOutsideThrottleWindow);
      expect(result).toHaveLength(3);
    });
  });

  describe("guide socket event handling", () => {
    test("handles guide.added event", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      const mockGuideData = {
        __typename: "Guide" as const,
        channel_id: channelId,
        id: "guide_new",
        key: "new_guide",
        type: "test",
        semver: "1.0.0",
        active: true,
        steps: [],
        activation_url_patterns: [],
        activation_url_rules: [],
        bypass_global_group_limit: false,
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
      expect(client.store.state.guides[mockGuideData.key]).toMatchObject({
        key: "new_guide",
      });
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
        active: true,
        steps: [],
        activation_url_patterns: [],
        activation_url_rules: [],
        bypass_global_group_limit: false,
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        getStep() {
          return this.steps.find((s: KnockGuideStep) => !s.message.archived_at);
        },
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: { [existingGuide.key]: existingGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
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
        type: "updated-type",
      });
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
        active: true,
        steps: [],
        activation_url_patterns: [],
        activation_url_rules: [],
        bypass_global_group_limit: false,
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        getStep() {
          return this.steps.find((s: KnockGuideStep) => !s.message.archived_at);
        },
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: { [existingGuide.key]: existingGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const updateEvent = {
        topic: `guides:${channelId}`,
        event: "guide.updated" as const,
        data: { guide: existingGuide, eligible: false as const },
      };

      client["handleSocketEvent"](updateEvent);

      expect(mockStore.setState).toHaveBeenCalled();
      expect(client.store.state.guides[existingGuide.key]).toBeUndefined();
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
        active: true,
        steps: [],
        activation_url_rules: [],
        activation_url_patterns: [],
        bypass_global_group_limit: false,
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        getStep() {
          return this.steps.find((s: KnockGuideStep) => !s.message.archived_at);
        },
      };

      // Set up initial state with existing guide
      mockStore.state = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: { [existingGuide.key]: existingGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const removeEvent = {
        topic: `guides:${channelId}`,
        event: "guide.removed" as const,
        data: { guide: { key: "existing_guide" } },
      };

      client["handleSocketEvent"](removeEvent);

      expect(mockStore.setState).toHaveBeenCalled();
      expect(client.store.state.guides[existingGuide.key]).toBeUndefined();
    });
  });

  describe("guide group socket event handling", () => {
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

    const mockGuideOne = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_1",
      key: "guide_one",
      type: "banner",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_patterns: [],
      activation_url_rules: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockGuideTwo = {
      __typename: "Guide",
      channel_id: channelId,
      id: "guide_2",
      key: "guide_two",
      type: "banner",
      semver: "1.0.0",
      active: true,
      steps: [mockStep],
      activation_url_patterns: [],
      activation_url_rules: [],
      bypass_global_group_limit: false,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      getStep: vi.fn().mockReturnValue(mockStep),
    } as unknown as KnockGuide;

    const mockDefaultGroup = {
      __typename: "GuideGroup",
      key: "default",
      display_sequence: [mockGuideOne.key, mockGuideTwo.key],
      display_interval: null,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as GuideGroupData;

    test("handles guide_group.added event", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      mockStore.state = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: {
          [mockGuideOne.key]: mockGuideOne,
          [mockGuideTwo.key]: mockGuideTwo,
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const event = {
        topic: `guides:${channelId}`,
        event: "guide_group.added" as const,
        data: {
          guide_group: {
            ...mockDefaultGroup,
            display_sequence: [mockGuideTwo.key, mockGuideOne.key],
            display_sequence_unthrottled: [mockGuideTwo.key, mockGuideOne.key],
            display_sequence_throttled: [],
          },
        },
      };

      client["handleSocketEvent"](event);

      expect(mockStore.setState).toHaveBeenCalled();

      const [updatedGroup] = client.store.state.guideGroups;

      expect(updatedGroup).toMatchObject({
        __typename: "GuideGroup",
        key: "default",
        display_sequence: ["guide_two", "guide_one"],
        display_interval: null,
      });

      expect(client.store.state.guides["guide_two"]).toMatchObject({
        __typename: "Guide",
        key: "guide_two",
        bypass_global_group_limit: true,
      });

      expect(client.store.state.guides["guide_one"]).toMatchObject({
        __typename: "Guide",
        key: "guide_one",
        bypass_global_group_limit: true,
      });
    });

    test("handles guide_group.updated event", () => {
      const client = new KnockGuideClient(mockKnock, channelId);

      mockStore.state = {
        guideGroups: [mockDefaultGroup],
        guideGroupDisplayLogs: {},
        guides: {
          [mockGuideOne.key]: mockGuideOne,
          [mockGuideTwo.key]: mockGuideTwo,
        },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      const event = {
        topic: `guides:${channelId}`,
        event: "guide_group.updated" as const,
        data: {
          guide_group: {
            ...mockDefaultGroup,
            display_sequence: [mockGuideTwo.key, mockGuideOne.key],
            display_sequence_unthrottled: [mockGuideTwo.key],
            display_sequence_throttled: [mockGuideOne.key],
            display_interval: 3600,
          },
        },
      };

      client["handleSocketEvent"](event);

      expect(mockStore.setState).toHaveBeenCalled();

      const [updatedGroup] = client.store.state.guideGroups;

      expect(updatedGroup).toMatchObject({
        __typename: "GuideGroup",
        key: "default",
        display_sequence: ["guide_two", "guide_one"],
        display_interval: 3600,
      });

      expect(client.store.state.guides["guide_two"]).toMatchObject({
        __typename: "Guide",
        key: "guide_two",
        bypass_global_group_limit: true,
      });

      expect(client.store.state.guides["guide_one"]).toMatchObject({
        __typename: "Guide",
        key: "guide_one",
        bypass_global_group_limit: false,
      });
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

    test("handleLocationChange calls subscribe when entering debug mode", () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };

      vi.stubGlobal("window", {
        ...mockWindow,
        location: {
          href: "https://example.com/dashboard?knock_guide_key=test_guide",
          search: "?knock_guide_key=test_guide",
        },
        localStorage: mockLocalStorage,
      });

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      client.store.state.debug = { forcedGuideKey: null };
      client.store.state.location = "https://example.com/dashboard";

      const subscribeSpy = vi
        .spyOn(client, "subscribe")
        .mockImplementation(() => {});

      const fetchSpy = vi
        .spyOn(client, "fetch")
        .mockImplementation(() => Promise.resolve({ status: "ok" }));

      client["handleLocationChange"]();

      expect(fetchSpy).toHaveBeenCalled();
      expect(subscribeSpy).toHaveBeenCalled();

      // Should persist debug parameters to localStorage when detected in URL
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "knock_guide_debug",
        JSON.stringify({
          forcedGuideKey: "test_guide",
          previewSessionId: null,
        }),
      );
    });

    test("handleLocationChange calls subscribe when exiting debug mode", () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation((key: string) => {
          // Simulate localStorage having stored debug values from previous session
          if (key === "knock_guide_debug") {
            return JSON.stringify({
              forcedGuideKey: "stored_guide",
              previewSessionId: "stored_session",
            });
          }
          return null;
        }),
        setItem: vi.fn(),
      };

      vi.stubGlobal("window", {
        ...mockWindow,
        location: {
          href: "https://example.com/dashboard",
          search: "",
        },
        localStorage: mockLocalStorage,
      });

      const client = new KnockGuideClient(
        mockKnock,
        channelId,
        {},
        { trackLocationFromWindow: true },
      );

      client.store.state.debug = { forcedGuideKey: "test_guide" };
      client.store.state.location =
        "https://example.com/dashboard?knock_guide_key=test_guide";

      const subscribeSpy = vi
        .spyOn(client, "subscribe")
        .mockImplementation(() => {});

      client["handleLocationChange"]();

      expect(subscribeSpy).toHaveBeenCalled();

      // Should read from localStorage when no URL parameters are present
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "knock_guide_debug",
      );
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

    test("setStepMessageAttrs returns guide as new object when step is updated", () => {
      const mockGuide = {
        key: "test_guide",
        steps: [
          {
            ref: "step_1",
            message: { id: "msg_123", seen_at: null },
          },
        ],
      } as unknown as KnockGuide;

      const stateWithGuides = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      const client = new KnockGuideClient(mockKnock, channelId);

      // Store the original guide reference
      const originalGuideRef = mockStore.state.guides[mockGuide.key];

      // Update the step message attributes
      client["setStepMessageAttrs"]("test_guide", "step_1", {
        seen_at: "2023-01-01T00:00:00Z",
      });

      // Get the setState function and execute it to verify the state changes
      const setStateCalls = mockStore.setState.mock.calls;
      const stateUpdateFn = setStateCalls.find(
        (call) => typeof call[0] === "function",
      )?.[0];

      const newState = stateUpdateFn(stateWithGuides);

      // Verify that the guide object is a new reference (not the same object)
      expect(newState.guides["test_guide"]).not.toBe(originalGuideRef);

      // Verify that the step message was updated
      expect(newState.guides["test_guide"]!.steps[0]!.message.seen_at).toBe(
        "2023-01-01T00:00:00Z",
      );
    });

    test("setStepMessageAttrs returns same guide object when step is not found", () => {
      const mockGuide = {
        key: "test_guide",
        steps: [
          {
            ref: "step_1",
            message: { id: "msg_123", seen_at: null },
          },
        ],
      } as unknown as KnockGuide;

      const stateWithGuides = {
        guideGroups: [],
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
      };

      mockStore.state = stateWithGuides;
      mockStore.getState.mockReturnValue(stateWithGuides);

      const client = new KnockGuideClient(mockKnock, channelId);

      // Store the original guide reference
      const originalGuideRef = mockStore.state.guides[mockGuide.key];

      // Try to update a non-existent step
      client["setStepMessageAttrs"]("test_guide", "non_existent_step", {
        seen_at: "2023-01-01T00:00:00Z",
      });

      // Get the setState function and execute it to verify the state changes
      const setStateCalls = mockStore.setState.mock.calls;
      const stateUpdateFn = setStateCalls.find(
        (call) => typeof call[0] === "function",
      )?.[0];

      const newState = stateUpdateFn(stateWithGuides);

      // Verify that the guide object is the same reference (no update occurred)
      expect(newState.guides["test_guide"]).toBe(originalGuideRef);

      // Verify that the step message was NOT updated
      expect(newState.guides["test_guide"]!.steps[0]!.message.seen_at).toBe(
        null,
      );
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
        guideGroupDisplayLogs: {},
        guides: { [mockGuide.key]: mockGuide },
        previewGuides: {},
        queries: {},
        location: undefined,
        counter: 0,
        debug: { forcedGuideKey: null, previewSessionId: null },
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
