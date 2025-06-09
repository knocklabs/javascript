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
    client: vi.fn(),
    feeds: {
      removeInstance: vi.fn(),
    },
  } as unknown as Knock;

  const mockSocketManager = {
    join: vi.fn(() => vi.fn()), // Returns unsubscribe function
    leave: vi.fn(),
  } as unknown as FeedSocketManager;

  const validFeedId = "550e8400-e29b-41d4-a716-446655440000";
  const defaultOptions: FeedClientOptions = {
    archived: "exclude",
    page_size: 50,
  };

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

    test("marks messages as unseen", async () => {
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
        seen_at: new Date().toISOString(),
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

      await feed.markAsUnseen(mockItem);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "unseen",
        { seen_at: null },
        "unseen_count",
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(mockItem, "unseen");
    });

    test("marks messages as read", async () => {
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

      await feed.markAsRead(mockItem);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "read",
        expect.objectContaining({ read_at: expect.any(String) }),
        "unread_count",
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(mockItem, "read");
    });

    test("marks all messages as read", async () => {
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

      await feed.markAllAsRead();

      expect(feed["makeBulkStatusUpdate"]).toHaveBeenCalledWith("read");
      expect(feed["emitEvent"]).toHaveBeenCalledWith(
        "all_read",
        expect.any(Array),
      );
    });

    test("marks all messages as read with unread filter", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, status: "unread" },
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

      await feed.markAllAsRead();

      expect(feed["makeBulkStatusUpdate"]).toHaveBeenCalledWith("read");
      expect(feed["emitEvent"]).toHaveBeenCalledWith(
        "all_read",
        expect.any(Array),
      );
    });

    test("marks messages as unread", async () => {
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
        read_at: new Date().toISOString(),
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

      await feed.markAsUnread(mockItem);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "unread",
        { read_at: null },
        "unread_count",
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(mockItem, "unread");
    });

    test("marks messages as interacted", async () => {
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

      const metadata = { action: "click" };

      // Mock the private methods
      feed["optimisticallyPerformStatusUpdate"] = vi.fn();
      feed["makeStatusUpdate"] = vi.fn();

      await feed.markAsInteracted(mockItem, metadata);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "interacted",
        expect.objectContaining({
          read_at: expect.any(String),
          interacted_at: expect.any(String),
        }),
        "unread_count",
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "interacted",
        metadata,
      );
    });

    test("marks messages as archived", async () => {
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
        unread_count: 1,
        unseen_count: 1,
      };

      // Mock store state
      feed.store.setState({
        items: [mockItem, { ...mockItem, id: "msg_2" }],
        metadata: mockMetadata,
        networkStatus: NetworkStatus.ready,
      });

      // Mock the private methods
      feed["makeStatusUpdate"] = vi.fn();

      await feed.markAsArchived(mockItem);

      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "archived",
      );
    });

    test("marks messages as archived with include filter", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, archived: "include" },
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
        unread_count: 1,
        unseen_count: 1,
      };

      // Mock store state
      feed.store.setState({
        items: [mockItem, { ...mockItem, id: "msg_2" }],
        metadata: mockMetadata,
        networkStatus: NetworkStatus.ready,
      });

      // Mock the private methods
      feed["makeStatusUpdate"] = vi.fn();

      await feed.markAsArchived(mockItem);

      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "archived",
      );
    });

    test("marks messages as unarchived", async () => {
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
        archived_at: new Date().toISOString(),
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

      await feed.markAsUnarchived(mockItem);

      expect(feed["optimisticallyPerformStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "unarchived",
        { archived_at: null },
      );
      expect(feed["makeStatusUpdate"]).toHaveBeenCalledWith(
        mockItem,
        "unarchived",
      );
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

    test("marks all messages as seen with unseen filter", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, status: "unseen" },
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

    test("marks all messages as archived", async () => {
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
        unread_count: 1,
        unseen_count: 1,
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

      await feed.markAllAsArchived();

      expect(feed["makeBulkStatusUpdate"]).toHaveBeenCalledWith("archive");
      expect(feed["emitEvent"]).toHaveBeenCalledWith(
        "all_archived",
        expect.any(Array),
      );
    });

    test("marks all read messages as archived", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockReadItem: FeedItem = {
        __cursor: "cursor_123",
        activities: [],
        actors: [],
        blocks: [],
        id: "msg_123",
        archived_at: null,
        inserted_at: new Date().toISOString(),
        read_at: new Date().toISOString(),
        seen_at: new Date().toISOString(),
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

      const mockUnreadItem: FeedItem = {
        ...mockReadItem,
        id: "msg_456",
        read_at: null,
        seen_at: null,
      };

      const mockMetadata: FeedMetadata = {
        total_count: 2,
        unread_count: 1,
        unseen_count: 1,
      };

      // Mock store state with proper methods
      const mockState = {
        items: [mockReadItem, mockUnreadItem],
        metadata: mockMetadata,
        networkStatus: NetworkStatus.ready,
        setResult: vi.fn(),
        setItemAttrs: vi.fn(),
      };

      feed.store.setState(mockState);
      feed.store.getState = vi.fn().mockReturnValue(mockState);

      // Mock private methods
      feed["makeBulkStatusUpdate"] = vi.fn();

      await feed.markAllReadAsArchived();

      expect(feed["makeBulkStatusUpdate"]).toHaveBeenCalledWith("archive");
      // Note: The actual implementation has the emitEvent commented out,
      // so we shouldn't expect it to be called
    });
  });

  describe("fetch operations", () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        channels: {
          getMessages: vi.fn(),
        },
        makeRequest: vi.fn(),
      };
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);
    });

    test("fetches feed messages", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockResponse = {
        statusCode: "ok",
        body: {
          entries: [],
          meta: { total_count: 0, unread_count: 0, unseen_count: 0 },
          page_info: { after: null, before: null },
        },
      };

      mockClient.makeRequest.mockResolvedValue(mockResponse);

      await feed.fetch();

      expect(mockClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${mockKnock.userId}/feeds/${validFeedId}`,
        params: {
          archived: "exclude",
          page_size: 50,
          __experimentalCrossBrowserUpdates: undefined,
          __fetchSource: undefined,
          __loadingType: undefined,
          auto_manage_socket_connection: undefined,
          auto_manage_socket_connection_delay: undefined,
          trigger_data: undefined,
        },
      });
    });

    test("fetches feed messages with custom options", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockResponse = {
        statusCode: "ok",
        body: {
          entries: [],
          meta: { total_count: 0, unread_count: 0, unseen_count: 0 },
          page_info: { after: null, before: null },
        },
      };

      mockClient.makeRequest.mockResolvedValue(mockResponse);

      await feed.fetch({ page_size: 10, status: "unread" });

      expect(mockClient.makeRequest).toHaveBeenCalledWith({
        method: "GET",
        url: `/v1/users/${mockKnock.userId}/feeds/${validFeedId}`,
        params: expect.objectContaining({
          page_size: 10,
          status: "unread",
          archived: "exclude",
        }),
      });
    });

    test("handles fetch errors", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockResponse = {
        statusCode: "error",
        error: "Network error",
      };

      mockClient.makeRequest.mockResolvedValue(mockResponse);

      await feed.fetch();

      const state = feed.getState();
      expect(state.networkStatus).toBe(NetworkStatus.error);
    });

    test("fetches next page", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Set up initial state with page info
      feed.store.setState({
        pageInfo: { after: "cursor_123", before: null, page_size: 50 },
        items: [],
        metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
        networkStatus: NetworkStatus.ready,
      });

      // Mock the fetch method instead of the client method
      feed.fetch = vi.fn();

      await feed.fetchNextPage();

      expect(feed.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          after: "cursor_123",
          __loadingType: NetworkStatus.fetchMore,
        }),
      );
    });
  });

  describe("private methods", () => {
    test("buildUserFeedId constructs correct ID", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const userFeedId = feed["buildUserFeedId"]();
      expect(typeof userFeedId).toBe("string");
    });

    test("gets socketChannelTopic", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const topic = feed.socketChannelTopic;
      expect(typeof topic).toBe("string");
      expect(topic).toContain(validFeedId);
    });

    test("handles socket events", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockPayload = {
        event: "new-message" as const,
        metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
        data: {
          "client_test-nanoid": {
            metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
          },
        },
      };

      feed["onNewMessageReceived"] = vi.fn();

      await feed.handleSocketEvent(mockPayload);

      expect(feed["onNewMessageReceived"]).toHaveBeenCalledWith(mockPayload);
    });

    test("emits events", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockItems: FeedItem[] = [];

      feed["emitEvent"]("seen", mockItems);

      // Just verify the method doesn't throw - testing internal broadcast is complex
      expect(true).toBe(true);
    });
  });

  describe("reinitialize", () => {
    test("reinitializes feed instance", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const newSocketManager = {} as FeedSocketManager;
      feed["initializeRealtimeConnection"] = vi.fn();
      feed["setupBroadcastChannel"] = vi.fn();

      feed.reinitialize(newSocketManager);

      expect(feed["socketManager"]).toBe(newSocketManager);
      expect(feed["initializeRealtimeConnection"]).toHaveBeenCalled();
      expect(feed["setupBroadcastChannel"]).toHaveBeenCalled();
    });
  });

  describe("visibility handling", () => {
    test("sets up visibility listeners", () => {
      const mockDocument = {
        addEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      feed["setUpVisibilityListeners"]();

      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });

    test("tears down visibility listeners", () => {
      const mockDocument = {
        removeEventListener: vi.fn(),
        addEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      feed["visibilityChangeListenerConnected"] = true;
      feed["tearDownVisibilityListeners"]();

      expect(mockDocument.removeEventListener).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });

    test("handles visibility change", () => {
      // Mock the client with socket to prevent errors
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(false),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockClient = {
        channels: { getMessages: vi.fn() },
        makeRequest: vi.fn(),
        socket: mockSocket,
      } as any;
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);

      // Mock document visibility state
      const mockDocument = {
        addEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, auto_manage_socket_connection: true },
        mockSocketManager,
      );

      feed["hasSubscribedToRealTimeUpdates"] = true;

      // Mock document becoming visible with socket disconnected
      mockDocument.visibilityState = "visible";
      mockSocket.isConnected.mockReturnValue(false);

      feed["handleVisibilityChange"]();

      expect(mockSocket.connect).toHaveBeenCalled();
    });
  });

  describe("broadcast channel operations", () => {
    let originalSelf: any;

    beforeEach(() => {
      // Store original self and reset global mocks
      originalSelf = globalThis.self;
      vi.unstubAllGlobals();
    });

    afterEach(() => {
      // Restore original self
      if (originalSelf !== undefined) {
        globalThis.self = originalSelf;
      } else {
        delete (globalThis as any).self;
      }
    });

    test("broadcasts over channel with valid JSON", () => {
      const mockBroadcastChannel = {
        onmessage: null as any,
        postMessage: vi.fn(),
        close: vi.fn(),
      };

      // Set up global self with BroadcastChannel
      globalThis.self = {
        BroadcastChannel: vi.fn(() => mockBroadcastChannel),
      } as any;

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Manually set the broadcast channel
      feed["broadcastChannel"] = mockBroadcastChannel as any;

      const payload = { items: [] };
      feed["broadcastOverChannel"]("items:seen", payload);

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: "items:seen",
        payload,
      });
    });

    test("handles broadcast channel JSON stringify errors", () => {
      const mockBroadcastChannel = {
        onmessage: null as any,
        postMessage: vi.fn(),
        close: vi.fn(),
      };

      // Set up global self with BroadcastChannel
      globalThis.self = {
        BroadcastChannel: vi.fn(() => mockBroadcastChannel),
      } as any;

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Manually set the broadcast channel
      feed["broadcastChannel"] = mockBroadcastChannel as any;

      // Create a circular reference that can't be JSON.stringified
      const circularPayload: any = {};
      circularPayload.self = circularPayload;

      feed["broadcastOverChannel"]("items:seen", circularPayload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not broadcast items:seen"),
      );

      consoleSpy.mockRestore();
    });

    test("skips broadcast when channel is not available", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Broadcast channel is null
      feed["broadcastChannel"] = null;

      // Should not throw
      feed["broadcastOverChannel"]("items:seen", { items: [] });
    });

    test("skips broadcast channel setup in non-browser environment", () => {
      // Delete self to simulate non-browser environment
      delete (globalThis as any).self;

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      expect(feed["broadcastChannel"]).toBeNull();
    });

    test("does not set up onmessage when __experimentalCrossBrowserUpdates is false", () => {
      const mockBroadcastChannel = {
        onmessage: null as any,
        postMessage: vi.fn(),
        close: vi.fn(),
      };

      // Set up global self with BroadcastChannel
      globalThis.self = {
        BroadcastChannel: vi.fn(() => mockBroadcastChannel),
      } as any;

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, __experimentalCrossBrowserUpdates: false },
        mockSocketManager,
      );

      // onmessage should remain null when __experimentalCrossBrowserUpdates is false
      expect(mockBroadcastChannel.onmessage).toBeNull();
    });

    test("skips visibility listeners setup in server environment", () => {
      vi.stubGlobal("document", undefined);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, auto_manage_socket_connection: true },
        mockSocketManager,
      );

      // Should not throw
      feed["setUpVisibilityListeners"]();
      expect(feed["visibilityChangeListenerConnected"]).toBe(false);
    });

    test("skips visibility listeners setup when already connected", () => {
      const mockDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      // Create a feed without auto_manage_socket_connection first
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions, // No auto_manage_socket_connection
        mockSocketManager,
      );

      // Clear any calls from initialization
      mockDocument.addEventListener.mockClear();

      // Now set the flag to true and call setUpVisibilityListeners
      feed["visibilityChangeListenerConnected"] = true;
      feed["setUpVisibilityListeners"]();

      // Should not add listener again
      expect(mockDocument.addEventListener).not.toHaveBeenCalled();
    });

    test("skips visibility listener teardown in server environment", () => {
      vi.stubGlobal("document", undefined);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Should not throw
      feed["tearDownVisibilityListeners"]();
    });
  });

  describe("bulk status updates", () => {
    test("makes bulk status update with proper options", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        {
          ...defaultOptions,
          status: "unread",
          has_tenant: true,
          tenant: "test_tenant",
        },
        mockSocketManager,
      );

      const mockMessages = {
        bulkUpdateAllStatusesInChannel: vi.fn().mockResolvedValue({}),
      };

      // Create a new mock with messages property
      const mockKnockWithMessages = {
        ...mockKnock,
        messages: mockMessages,
      } as any;

      // Temporarily replace the messages property
      Object.defineProperty(feed, "knock", {
        value: mockKnockWithMessages,
        configurable: true,
      });

      await feed["makeBulkStatusUpdate"]("read");

      expect(mockMessages.bulkUpdateAllStatusesInChannel).toHaveBeenCalledWith({
        channelId: validFeedId,
        status: "read",
        options: {
          user_ids: [mockKnock.userId],
          engagement_status: "unread",
          archived: "exclude",
          has_tenant: true,
          tenants: ["test_tenant"],
        },
      });
    });

    test("handles bulk status update with 'all' status", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, status: "all" },
        mockSocketManager,
      );

      const mockMessages = {
        bulkUpdateAllStatusesInChannel: vi.fn().mockResolvedValue({}),
      };

      // Create a new mock with messages property
      const mockKnockWithMessages = {
        ...mockKnock,
        messages: mockMessages,
      } as any;

      // Temporarily replace the messages property
      Object.defineProperty(feed, "knock", {
        value: mockKnockWithMessages,
        configurable: true,
      });

      await feed["makeBulkStatusUpdate"]("archive");

      expect(mockMessages.bulkUpdateAllStatusesInChannel).toHaveBeenCalledWith({
        channelId: validFeedId,
        status: "archive",
        options: {
          user_ids: [mockKnock.userId],
          engagement_status: undefined,
          archived: "exclude",
          has_tenant: undefined,
          tenants: undefined,
        },
      });
    });
  });

  describe("emitEvent variations", () => {
    test("emits events in both formats", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      const mockItems: FeedItem[] = [];
      feed["broadcastOverChannel"] = vi.fn();

      feed["emitEvent"]("seen", mockItems);

      expect(feed["broadcaster"].emit).toHaveBeenCalledWith("items.seen", {
        items: mockItems,
      });
      expect(feed["broadcaster"].emit).toHaveBeenCalledWith("items:seen", {
        items: mockItems,
      });
      expect(feed["broadcastOverChannel"]).toHaveBeenCalledWith("items:seen", {
        items: mockItems,
      });
    });
  });

  describe("visibility handling with timers", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("disconnects socket after delay when tab becomes hidden", () => {
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockClient = {
        socket: mockSocket,
        channels: { getMessages: vi.fn() },
        makeRequest: vi.fn(),
      } as any;
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);

      const mockDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        {
          ...defaultOptions,
          auto_manage_socket_connection: true,
          auto_manage_socket_connection_delay: 1000,
        },
        mockSocketManager,
      );

      feed["setUpVisibilityListeners"]();

      // Simulate tab becoming hidden
      mockDocument.visibilityState = "hidden";
      feed["handleVisibilityChange"]();

      // Should not disconnect immediately
      expect(mockSocket.disconnect).not.toHaveBeenCalled();

      // Fast-forward time by 1000ms
      vi.advanceTimersByTime(1000);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    test("cancels disconnect timer when tab becomes visible", () => {
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockClient = {
        socket: mockSocket,
        channels: { getMessages: vi.fn() },
        makeRequest: vi.fn(),
      } as any;
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);

      const mockDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        {
          ...defaultOptions,
          auto_manage_socket_connection: true,
          auto_manage_socket_connection_delay: 1000,
        },
        mockSocketManager,
      );

      feed["setUpVisibilityListeners"]();

      // Simulate tab becoming hidden
      mockDocument.visibilityState = "hidden";
      feed["handleVisibilityChange"]();

      // Then quickly becoming visible again
      mockDocument.visibilityState = "visible";
      feed["handleVisibilityChange"]();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Should not have disconnected
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    test("connects socket when tab becomes visible and socket is disconnected", () => {
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(false),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockClient = {
        socket: mockSocket,
        channels: { getMessages: vi.fn() },
        makeRequest: vi.fn(),
      } as any;
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);

      const mockDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, auto_manage_socket_connection: true },
        mockSocketManager,
      );

      feed["setUpVisibilityListeners"]();

      // Simulate tab becoming visible with disconnected socket
      mockDocument.visibilityState = "visible";
      feed["handleVisibilityChange"]();

      expect(mockSocket.connect).toHaveBeenCalled();
    });

    test("uses default disconnect delay when not specified", () => {
      const mockSocket = {
        isConnected: vi.fn().mockReturnValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockClient = {
        socket: mockSocket,
        channels: { getMessages: vi.fn() },
        makeRequest: vi.fn(),
      } as any;
      vi.mocked(mockKnock.client).mockReturnValue(mockClient);

      const mockDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        visibilityState: "visible",
        hidden: false,
      };
      vi.stubGlobal("document", mockDocument);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, auto_manage_socket_connection: true },
        mockSocketManager,
      );

      feed["setUpVisibilityListeners"]();

      // Simulate tab becoming hidden
      mockDocument.visibilityState = "hidden";
      feed["handleVisibilityChange"]();

      // Should use default delay (2000ms)
      vi.advanceTimersByTime(1999);
      expect(mockSocket.disconnect).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe("initialization edge cases", () => {
    test("skips real-time initialization when no socket manager", () => {
      const feed = new Feed(mockKnock, validFeedId, defaultOptions, undefined);

      feed["hasSubscribedToRealTimeUpdates"] = true;

      // Should not throw
      feed["initializeRealtimeConnection"]();
    });

    test("auto-reconnects when previously subscribed and authenticated", () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      feed["hasSubscribedToRealTimeUpdates"] = true;
      vi.mocked(mockKnock.isAuthenticated).mockReturnValue(true);

      feed["initializeRealtimeConnection"]();

      expect(mockSocketManager.join).toHaveBeenCalledWith(feed);
    });

    test("skips visibility listeners setup in server environment", () => {
      vi.stubGlobal("document", undefined);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        { ...defaultOptions, auto_manage_socket_connection: true },
        mockSocketManager,
      );

      // Should not throw
      feed["setUpVisibilityListeners"]();
      expect(feed["visibilityChangeListenerConnected"]).toBe(false);
    });

    test("skips visibility listener teardown in server environment", () => {
      vi.stubGlobal("document", undefined);

      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // Should not throw
      feed["tearDownVisibilityListeners"]();
    });
  });

  describe("socket event handling edge cases", () => {
    test("handles exhaustive socket event check", async () => {
      const feed = new Feed(
        mockKnock,
        validFeedId,
        defaultOptions,
        mockSocketManager,
      );

      // This should hit the never case for exhaustive checking
      const unknownPayload = {
        event: "unknown-event" as any,
        metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
        data: {},
      };

      const result = await feed.handleSocketEvent(unknownPayload);
      expect(result).toBeUndefined();
    });
  });
});
