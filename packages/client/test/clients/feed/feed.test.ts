// @vitest-environment node
import EventEmitter from "eventemitter2";
import { nanoid } from "nanoid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Feed from "../../../src/clients/feed/feed";
import type {
  FeedClientOptions,
  FeedItem,
  FeedMetadata,
} from "../../../src/clients/feed/interfaces";
import { FeedSocketManager } from "../../../src/clients/feed/socket-manager";
import type { NotificationSource } from "../../../src/clients/messages/interfaces";
import Knock from "../../../src/knock";
import { NetworkStatus } from "../../../src/networkStatus";

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-nanoid"),
}));

// Mock eventemitter2
vi.mock("eventemitter2", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
}));

describe("Feed", () => {
  const mockKnock = {
    log: vi.fn(),
    isAuthenticated: vi.fn(() => true),
    feeds: {
      removeInstance: vi.fn(),
    },
  } as unknown as Knock;

  const mockSocketManager = {
    join: vi.fn(() => vi.fn()), // Returns unsubscribe function
    leave: vi.fn(),
  } as unknown as FeedSocketManager;

  const validFeedId = "550e8400-e29b-41d4-a716-446655440000";
  const defaultOptions: FeedClientOptions = { archived: "exclude" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    test("initializes with valid feed ID", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      expect(feed.feedId).toBe(validFeedId);
      expect(feed.referenceId).toBe("client_test-nanoid");
      expect(feed.defaultOptions).toEqual(defaultOptions);
      expect(mockKnock.log).toHaveBeenCalledWith(
        `[Feed] Initialized a feed on channel ${validFeedId}`,
      );
    });

    test("logs error with invalid feed ID", () => {
      new Feed(mockKnock, "invalid-uuid", defaultOptions, mockSocketManager);

      expect(mockKnock.log).toHaveBeenCalledWith(
        "[Feed] Invalid or missing feedId provided to the Feed constructor. The feed should be a UUID of an in-app feed channel (`in_app_feed`) found in the Knock dashboard. Please provide a valid feedId to the Feed constructor.",
        true,
      );
    });
  });

  describe("listenForUpdates", () => {
    test("connects to real-time service when authenticated", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      feed.listenForUpdates();

      expect(mockSocketManager.join).toHaveBeenCalledWith(feed);
      // @ts-ignore accessing private property for testing
      expect(feed["hasSubscribedToRealTimeUpdates"]).toBe(true);
    });

    test("skips connection when not authenticated", () => {
      vi.mocked(mockKnock.isAuthenticated).mockReturnValueOnce(false);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      feed.listenForUpdates();

      expect(mockSocketManager.join).not.toHaveBeenCalled();
      // @ts-ignore accessing private property for testing
      expect(feed["hasSubscribedToRealTimeUpdates"]).toBe(true);
      expect(mockKnock.log).toHaveBeenCalledWith(
        "[Feed] User is not authenticated, skipping listening for updates",
      );
    });
  });

  describe("event handling", () => {
    test("binds event handlers", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      const callback = vi.fn();

      feed.on("messages.new", callback);

      expect(feed["broadcaster"].on).toHaveBeenCalledWith(
        "messages.new",
        callback,
      );
    });

    test("unbinds event handlers", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      const callback = vi.fn();

      feed.off("messages.new", callback);

      expect(feed["broadcaster"].off).toHaveBeenCalledWith(
        "messages.new",
        callback,
      );
    });
  });

  describe("teardown", () => {
    test("cleans up resources", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Setup disconnectTimer
      feed["disconnectTimer"] = setTimeout(() => {}, 1000);

      feed.teardown();

      expect(mockSocketManager.leave).toHaveBeenCalledWith(feed);
      expect(feed["disconnectTimer"]).toBeNull();
    });
  });

  describe("dispose", () => {
    test("removes all resources and instance", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      feed.dispose();

      expect(mockSocketManager.leave).toHaveBeenCalledWith(feed);
      expect(feed["broadcaster"].removeAllListeners).toHaveBeenCalled();
      expect(mockKnock.feeds.removeInstance).toHaveBeenCalledWith(feed);
    });
  });

  describe("store operations", () => {
    test("returns current state", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      const state = feed.getState();

      expect(state).toBeDefined();
      expect(state.networkStatus).toBe(NetworkStatus.ready);
    });
  });

  describe("message operations", () => {
    test("marks messages as seen", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );
      const mockItem: FeedItem = {
        __cursor: "cursor_123",
        activities: [],
        actors: [],
        blocks: [],
        id: "msg_123",
        archived_at: null,
        inserted_at: new Date().toISOString(),
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: {
          key: "test_source",
          version_id: "version_123",
          categories: [],
        },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: new Date().toISOString(),
        data: null,
      };

      // Mock the private methods
      feed["optimisticallyPerformStatusUpdate"] = vi.fn();
      feed["makeStatusUpdate"] = vi.fn();

      await feed.markAsSeen(mockItem);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "seen",
        expect.objectContaining({ seen_at: expect.any(String) }),
        "unseen_count",
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(mockItem, "seen");
    });

    test("marks all messages as seen", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockItem: FeedItem = {
        __cursor: "cursor_123",
        activities: [],
        actors: [],
        blocks: [],
        id: "msg_123",
        archived_at: null,
        inserted_at: new Date().toISOString(),
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: {
          key: "test_source",
          version_id: "version_123",
          categories: [],
        },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: new Date().toISOString(),
        data: null,
      };

      const mockMetadata: FeedMetadata = {
        total_count: 2,
        unread_count: 2,
        unseen_count: 2,
      };

      // Mock store state
      feed.store.setState({
        items: [mockItem, { ...mockItem, id: "msg_2" }],
        metadata: mockMetadata,
        networkStatus: NetworkStatus.ready,
      });

      // Mock private methods
      feed["makeBulkStatusUpdate"] = vi.fn();
      feed["emitEvent"] = vi.fn();

      await feed.markAllAsSeen();

      expect(feed["makeBulkStatusUpdate"]).toHaveBeenCalledWith("seen");
      expect(feed["emitEvent"]).toHaveBeenCalledWith(
        "all_seen",
        expect.any(Array),
      );
    });
  });
});
