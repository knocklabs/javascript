import EventEmitter from "eventemitter2";
import { Channel, Socket } from "phoenix";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreApi } from "zustand";

import Feed from "../src/clients/feed/feed";
import {
  FeedSocketManager,
  SocketEventType,
} from "../src/clients/feed/socket-manager";
import Knock from "../src/knock";

const TEST_CLIENT_REF_ID = "client_V1StGXR8_Z5jdHi6B-myT";

describe("FeedSocketManager", () => {
  let socket: Socket;
  let manager: FeedSocketManager;
  let mockChannel: Channel;
  let mockFeed: Feed;

  const createMockFeed = (overrides = {}) =>
    ({
      socketChannelTopic: "feeds:test:user1",
      referenceId: TEST_CLIENT_REF_ID,
      defaultOptions: { tenant: "test-tenant" },
      handleSocketEvent: vi.fn(),
      unsubscribeFromSocketEvents: vi.fn(),
      socketManager: undefined,
      userFeedId: "test-user-feed",
      broadcaster: new EventEmitter(),
      broadcastChannel: null,
      disconnectTimer: null,
      hasSubscribedToRealTimeUpdates: false,
      visibilityChangeHandler: () => {},
      visibilityChangeListenerConnected: false,
      store: {} as StoreApi<unknown>,
      knock: {} as Knock,
      feedId: "test-feed",
      ...overrides,
    }) as unknown as Feed;

  beforeEach(() => {
    socket = new Socket("ws://localhost:4000/socket");
    manager = new FeedSocketManager(socket);
    mockChannel = {
      join: vi.fn(),
      leave: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      state: "closed",
    } as unknown as Channel;
    mockFeed = createMockFeed();

    vi.spyOn(socket, "channel").mockReturnValue(mockChannel);
    vi.spyOn(socket, "isConnected").mockReturnValue(false);
    vi.spyOn(socket, "connect");
  });

  describe("join", () => {
    it("should connect socket if not connected", () => {
      manager.join(mockFeed);
      expect(socket.connect).toHaveBeenCalled();
    });

    it("should create and join channel with correct params", () => {
      manager.join(mockFeed);
      expect(socket.channel).toHaveBeenCalledWith("feeds:test:user1", {
        [TEST_CLIENT_REF_ID]: { tenant: "test-tenant" },
      });
      expect(mockChannel.join).toHaveBeenCalled();
    });

    it("should set up event listeners for socket events", () => {
      manager.join(mockFeed);
      expect(mockChannel.on).toHaveBeenCalledWith(
        SocketEventType.NewMessage,
        expect.any(Function),
      );
    });

    it("should not rejoin channel if already joined", () => {
      mockChannel.state = "joined";
      manager.join(mockFeed);
      expect(mockChannel.join).not.toHaveBeenCalled();
    });

    it("should update params and rejoin if params change", () => {
      manager.join(mockFeed);
      const newFeed = createMockFeed({
        defaultOptions: { tenant: "new-tenant" },
      });
      manager.join(newFeed);
      expect(socket.channel).toHaveBeenCalledWith("feeds:test:user1", {
        [TEST_CLIENT_REF_ID]: { tenant: "new-tenant" },
      });
    });

    it("should allow joining the same feed ID multiple times", () => {
      manager.join(mockFeed);
      const anotherFeed = createMockFeed({
        referenceId: "client_IgJDCQHSh-C546bVSnATQ",
        defaultOptions: { tenant: "test-tenant-2" },
      });
      manager.join(anotherFeed);

      expect(socket.channel).toHaveBeenCalledTimes(2);
      expect(mockChannel.join).toHaveBeenCalledTimes(2);

      expect(socket.channel).toHaveBeenNthCalledWith(1, "feeds:test:user1", {
        [TEST_CLIENT_REF_ID]: { tenant: "test-tenant" },
      });
      expect(socket.channel).toHaveBeenNthCalledWith(2, "feeds:test:user1", {
        [TEST_CLIENT_REF_ID]: { tenant: "test-tenant" },
        [anotherFeed.referenceId]: { tenant: "test-tenant-2" },
      });
    });
  });

  describe("leave", () => {
    beforeEach(() => {
      manager.join(mockFeed);
    });

    it("should unsubscribe feed from socket events", () => {
      manager.leave(mockFeed);
      expect(mockFeed.unsubscribeFromSocketEvents).toHaveBeenCalled();
    });

    it("should remove feed params and leave channel if no feeds remain", () => {
      manager.leave(mockFeed);
      expect(mockChannel.leave).toHaveBeenCalled();
      expect(mockChannel.off).toHaveBeenCalledWith(SocketEventType.NewMessage);
    });

    it("should not leave channel if other feeds remain", () => {
      const anotherFeed = createMockFeed({
        referenceId: "client_IgJDCQHSh-C546bVSnATQ",
      });
      manager.join(anotherFeed);
      manager.leave(mockFeed);
      expect(mockChannel.leave).not.toHaveBeenCalled();
    });
  });

  describe("socket event handling", () => {
    it("should notify relevant feed clients when receiving socket events", () => {
      const unsub = manager.join(mockFeed);
      const eventHandler = vi.mocked(mockChannel.on).mock.calls[0]?.[1];

      const payload = {
        event: SocketEventType.NewMessage,
        metadata: { id: "test" },
        data: { TEST_CLIENT_REF_ID: { metadata: { id: "test" } } },
        attn: [TEST_CLIENT_REF_ID],
      };

      eventHandler?.(payload);
      expect(mockFeed.handleSocketEvent).toHaveBeenCalledWith({
        event: SocketEventType.NewMessage,
        metadata: { id: "test" },
        data: { TEST_CLIENT_REF_ID: { metadata: { id: "test" } } },
      });

      unsub();
    });

    it("should not notify feed clients not in attn list", () => {
      const anotherFeed = createMockFeed({
        referenceId: "client_IgJDCQHSh-C546bVSnATQ",
      });
      manager.join(anotherFeed);
      const eventHandler = vi.mocked(mockChannel.on).mock.calls[0]?.[1];

      const payload = {
        event: SocketEventType.NewMessage,
        metadata: { id: "test" },
        data: { TEST_CLIENT_REF_ID: { metadata: { id: "test" } } },
        attn: [TEST_CLIENT_REF_ID],
      };

      eventHandler?.(payload);
      expect(anotherFeed.handleSocketEvent).not.toHaveBeenCalled();
    });
  });
});
