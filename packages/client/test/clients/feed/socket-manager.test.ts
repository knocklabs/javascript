// @vitest-environment node
import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";
import { beforeEach, describe, expect, test, vi } from "vitest";

import Feed from "../../../src/clients/feed/feed";
import { FeedMetadata } from "../../../src/clients/feed/interfaces";
import {
  FeedSocketManager,
  SocketEventType,
} from "../../../src/clients/feed/socket-manager";

// Mock dependencies
vi.mock("@tanstack/store");
vi.mock("phoenix");

describe("FeedSocketManager", () => {
  let mockSocket: Socket;
  let mockChannel: Channel;
  let mockFeed: Feed;
  let socketManager: FeedSocketManager;
  let mockStore: Store<any>;

  beforeEach(() => {
    // Mock Socket
    mockSocket = {
      isConnected: vi.fn(() => false),
      connect: vi.fn(),
      channel: vi.fn(),
    } as unknown as Socket;

    // Mock Channel
    mockChannel = {
      state: "closed",
      on: vi.fn(() => 0), // Phoenix channel.on returns a number
      off: vi.fn(() => 0), // Phoenix channel.off returns a number
      join: vi.fn(),
      leave: vi.fn(),
    } as unknown as Channel;

    // Mock Store
    mockStore = {
      state: {},
      setState: vi.fn(),
      subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    } as unknown as Store<any>;

    // Mock Feed
    mockFeed = {
      socketChannelTopic: "feeds:channel_123:user_456",
      referenceId: "client_ref_123",
      defaultOptions: { archived: "exclude", tenant: "test_tenant" },
      handleSocketEvent: vi.fn(),
      unsubscribeFromSocketEvents: vi.fn(),
    } as unknown as Feed;

    vi.mocked(Store).mockImplementation(() => mockStore);
    vi.mocked(mockSocket.channel).mockReturnValue(mockChannel);

    socketManager = new FeedSocketManager(mockSocket);
  });

  describe("constructor", () => {
    test("initializes with empty channels and params", () => {
      expect(socketManager["channels"]).toEqual({});
      expect(socketManager["params"]).toEqual({});
      expect(Store).toHaveBeenCalledWith({});
    });
  });

  describe("join", () => {
    test("connects socket if not connected", () => {
      vi.mocked(mockSocket.isConnected).mockReturnValue(false);

      socketManager.join(mockFeed);

      expect(mockSocket.connect).toHaveBeenCalled();
    });

    test("does not connect socket if already connected", () => {
      vi.mocked(mockSocket.isConnected).mockReturnValue(true);

      socketManager.join(mockFeed);

      expect(mockSocket.connect).not.toHaveBeenCalled();
    });

    test("creates new channel for new topic", () => {
      const topic = mockFeed.socketChannelTopic;
      const params = { [mockFeed.referenceId]: mockFeed.defaultOptions };

      socketManager.join(mockFeed);

      expect(mockSocket.channel).toHaveBeenCalledWith(topic, params);
      expect(mockChannel.on).toHaveBeenCalledWith(
        SocketEventType.NewMessage,
        expect.any(Function),
      );
    });

    test("joins channel if in closed state", () => {
      mockChannel.state = "closed";

      socketManager.join(mockFeed);

      expect(mockChannel.join).toHaveBeenCalled();
    });

    test("joins channel if in errored state", () => {
      mockChannel.state = "errored";

      socketManager.join(mockFeed);

      expect(mockChannel.join).toHaveBeenCalled();
    });

    test("does not join channel if in other states", () => {
      mockChannel.state = "joined";

      socketManager.join(mockFeed);

      expect(mockChannel.join).not.toHaveBeenCalled();
    });

    test("updates params for existing topic with new client", () => {
      const topic = mockFeed.socketChannelTopic;

      // First join
      socketManager.join(mockFeed);

      // Create second feed with different reference id
      const mockFeed2 = {
        ...mockFeed,
        referenceId: "client_ref_456",
        defaultOptions: { archived: "include" },
      } as unknown as Feed;

      // Mock a new channel for the updated params
      const mockChannel2 = { ...mockChannel };
      vi.mocked(mockSocket.channel).mockReturnValue(mockChannel2 as Channel);

      // Second join should update params and create new channel
      socketManager.join(mockFeed2);

      const expectedParams = {
        [mockFeed.referenceId]: mockFeed.defaultOptions,
        [mockFeed2.referenceId]: mockFeed2.defaultOptions,
      };

      expect(mockSocket.channel).toHaveBeenLastCalledWith(
        topic,
        expectedParams,
      );
    });

    test("reuses existing channel for same params", () => {
      // First join
      socketManager.join(mockFeed);

      const callCount = vi.mocked(mockSocket.channel).mock.calls.length;

      // Second join with same params
      socketManager.join(mockFeed);

      // Should not create a new channel
      expect(vi.mocked(mockSocket.channel)).toHaveBeenCalledTimes(callCount);
    });

    test("creates new channel when params change", () => {
      // First join
      socketManager.join(mockFeed);

      // Update feed options
      const updatedFeed = {
        ...mockFeed,
        defaultOptions: { archived: "include", tenant: "new_tenant" },
      } as unknown as Feed;

      const mockChannel2 = { ...mockChannel };
      vi.mocked(mockSocket.channel).mockReturnValue(mockChannel2 as Channel);

      // Second join with different params
      socketManager.join(updatedFeed);

      expect(mockSocket.channel).toHaveBeenCalledTimes(2);
    });

    test("sets up store subscription and returns unsubscribe function", () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(mockStore.subscribe).mockReturnValue(mockUnsubscribe);

      const result = socketManager.join(mockFeed);

      expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toBe(mockUnsubscribe);
    });

    test("handles store subscription callback", () => {
      let subscriptionCallback: Function;
      vi.mocked(mockStore.subscribe).mockImplementation((callback) => {
        subscriptionCallback = callback;
        return vi.fn();
      });

      const mockPayload = { event: "new-message", data: {} };
      mockStore.state = { [mockFeed.referenceId]: mockPayload };

      socketManager.join(mockFeed);

      // Trigger the subscription callback
      subscriptionCallback!();

      expect(mockFeed.handleSocketEvent).toHaveBeenCalledWith(mockPayload);
    });

    test("ignores store subscription callback when no payload for reference id", () => {
      let subscriptionCallback: Function;
      vi.mocked(mockStore.subscribe).mockImplementation((callback) => {
        subscriptionCallback = callback;
        return vi.fn();
      });

      mockStore.state = {}; // No payload for this reference id

      socketManager.join(mockFeed);

      // Trigger the subscription callback
      subscriptionCallback!();

      expect(mockFeed.handleSocketEvent).not.toHaveBeenCalled();
    });
  });

  describe("leave", () => {
    beforeEach(() => {
      // Set up initial state with a joined feed
      socketManager.join(mockFeed);
    });

    test("calls unsubscribe on feed", () => {
      socketManager.leave(mockFeed);

      expect(mockFeed.unsubscribeFromSocketEvents).toHaveBeenCalled();
    });

    test("removes params for the reference client", () => {
      const topic = mockFeed.socketChannelTopic;
      const referenceId = mockFeed.referenceId;

      // Verify params exist before leave
      expect(socketManager["params"][topic]).toBeDefined();
      expect(socketManager["params"][topic]![referenceId]).toBeDefined();

      socketManager.leave(mockFeed);

      // Verify params are removed
      expect(socketManager["params"][topic]![referenceId]).toBeUndefined();
    });

    test("leaves channel and removes it when no more clients", () => {
      const topic = mockFeed.socketChannelTopic;

      socketManager.leave(mockFeed);

      expect(mockChannel.off).toHaveBeenCalledWith(SocketEventType.NewMessage);
      expect(mockChannel.leave).toHaveBeenCalled();
      expect(socketManager["channels"][topic]).toBeUndefined();
    });

    test("keeps channel when other clients are still connected", () => {
      const topic = mockFeed.socketChannelTopic;

      // Add second feed to the same topic
      const mockFeed2 = {
        ...mockFeed,
        referenceId: "client_ref_456",
      } as unknown as Feed;

      socketManager.join(mockFeed2);

      // Leave first feed
      socketManager.leave(mockFeed);

      // Channel should still exist since mockFeed2 is still connected
      expect(mockChannel.leave).not.toHaveBeenCalled();
      expect(socketManager["channels"][topic]).toBeDefined();
    });

    test("handles missing topic gracefully", () => {
      const nonExistentFeed = {
        socketChannelTopic: "feeds:nonexistent:user",
        referenceId: "client_nonexistent",
        unsubscribeFromSocketEvents: vi.fn(),
      } as unknown as Feed;

      // Should not throw error
      expect(() => socketManager.leave(nonExistentFeed)).not.toThrow();
    });

    test("handles missing reference client gracefully", () => {
      const nonExistentRefFeed = {
        ...mockFeed,
        referenceId: "client_nonexistent",
        unsubscribeFromSocketEvents: vi.fn(),
      } as unknown as Feed;

      // Should not throw error
      expect(() => socketManager.leave(nonExistentRefFeed)).not.toThrow();
    });
  });

  describe("setInbox", () => {
    test("sets payload for all attention reference ids", () => {
      const metadata: FeedMetadata = {
        total_count: 1,
        unread_count: 1,
        unseen_count: 1,
      };
      const payload = {
        event: "new-message" as const,
        attn: ["client_ref_1", "client_ref_2"],
        data: {
          client_ref_1: { metadata },
          client_ref_2: { metadata },
        },
        metadata, // Legacy metadata field
      };

      // Call the private method through a socket event
      socketManager["setInbox"](payload);

      expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));

      // Get the function passed to setState and call it
      const setStateCallback = vi.mocked(mockStore.setState).mock.calls[0]![0];
      const result = setStateCallback({});

      expect(result).toEqual({
        client_ref_1: {
          event: "new-message",
          data: {
            client_ref_1: { metadata },
            client_ref_2: { metadata },
          },
          metadata,
        },
        client_ref_2: {
          event: "new-message",
          data: {
            client_ref_1: { metadata },
            client_ref_2: { metadata },
          },
          metadata,
        },
      });
    });

    test("handles empty attention array", () => {
      const metadata: FeedMetadata = {
        total_count: 0,
        unread_count: 0,
        unseen_count: 0,
      };
      const payload = {
        event: "new-message" as const,
        attn: [],
        data: {},
        metadata,
      };

      socketManager["setInbox"](payload);

      expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));

      const setStateCallback = vi.mocked(mockStore.setState).mock.calls[0]![0];
      const result = setStateCallback({});

      expect(result).toEqual({});
    });
  });

  describe("event handling integration", () => {
    test("properly handles socket events through channel listeners", () => {
      let eventCallback: Function;
      vi.mocked(mockChannel.on).mockImplementation((eventType, callback) => {
        if (eventType === SocketEventType.NewMessage) {
          eventCallback = callback;
        }
        return 0; // Phoenix channel.on returns a number
      });

      socketManager.join(mockFeed);

      const metadata: FeedMetadata = {
        total_count: 1,
        unread_count: 1,
        unseen_count: 1,
      };
      const mockSocketPayload = {
        event: "new-message" as const,
        attn: [mockFeed.referenceId],
        data: {
          [mockFeed.referenceId]: { metadata },
        },
        metadata,
      };

      // Simulate socket event
      eventCallback!(mockSocketPayload);

      expect(mockStore.setState).toHaveBeenCalled();
    });
  });
});
