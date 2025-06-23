import { describe, expect, test, vi } from "vitest";

import ApiClient from "../../../src/api";
import Feed from "../../../src/clients/feed/feed";
import { FeedSocketManager } from "../../../src/clients/feed/socket-manager";
import { NetworkStatus } from "../../../src/networkStatus";
import {
  createMockFeedItems,
  createUnreadFeedItem,
} from "../../test-utils/fixtures";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

describe("Feed", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);
    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  describe("Basic Feed Tests", () => {
    test("can create a feed client", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Test basic feed creation without complex setup
        expect(knock).toBeDefined();
        expect(knock.isAuthenticated()).toBe(true);
      } finally {
        cleanup();
      }
    });
  });

  describe("Feed Initialization", () => {
    test("creates feed with valid UUID", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { archived: "exclude" },
          undefined,
        );

        expect(feed.feedId).toBe("01234567-89ab-cdef-0123-456789abcdef");
        expect(feed.referenceId).toMatch(/^client_/);
        expect(feed.store).toBeDefined();
      } finally {
        cleanup();
      }
    });

    test("logs warning for invalid feedId", () => {
      const { knock, cleanup } = getTestSetup();
      const logSpy = vi.spyOn(knock, "log");

      try {
        new Feed(knock, "invalid-feed-id", {}, undefined);

        expect(logSpy).toHaveBeenCalledWith(
          "[Feed] Invalid or missing feedId provided to the Feed constructor. The feed should be a UUID of an in-app feed channel (`in_app_feed`) found in the Knock dashboard. Please provide a valid feedId to the Feed constructor.",
          true,
        );
      } finally {
        cleanup();
      }
    });

    test("initializes with default options", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        expect(feed.defaultOptions.archived).toBe("exclude");
      } finally {
        cleanup();
      }
    });
  });

  describe("Feed Status Updates", () => {
    test("marks single item as seen", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem], // Batch response returns array
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsSeen(feedItem);

        // Feed always uses batch endpoints, even for single items
        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/seen",
          data: { message_ids: [feedItem.id] },
        });
        expect(result).toEqual([updatedItem]);
      } finally {
        cleanup();
      }
    });

    test("marks multiple items as seen", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItems = [createUnreadFeedItem(), createUnreadFeedItem()];
        const updatedItems = feedItems.map((item) => ({
          ...item,
          seen_at: new Date().toISOString(),
        }));

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: updatedItems,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsSeen(feedItems);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/seen",
          data: { message_ids: feedItems.map((item) => item.id) },
        });
        expect(result).toEqual(updatedItems);
      } finally {
        cleanup();
      }
    });

    test("marks single item as read", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, read_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsRead(feedItem);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/read",
          data: { message_ids: [feedItem.id] },
        });
        expect(result).toEqual([updatedItem]);
      } finally {
        cleanup();
      }
    });

    test("marks single item as archived", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = {
          ...feedItem,
          archived_at: new Date().toISOString(),
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsArchived(feedItem);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/archived",
          data: { message_ids: [feedItem.id] },
        });
        expect(result).toEqual([updatedItem]);
      } finally {
        cleanup();
      }
    });

    test("marks item as interacted with metadata", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const metadata = { action: "click", target: "button" };
        const updatedItem = {
          ...feedItem,
          interacted_at: new Date().toISOString(),
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsInteracted(feedItem, metadata);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/interacted",
          data: {
            message_ids: [feedItem.id],
            metadata,
          },
        });
        expect(result).toEqual([updatedItem]);
      } finally {
        cleanup();
      }
    });
  });

  describe("Bulk Operations", () => {
    test("marks all items as seen", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkResponse = { updated_count: 5 };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAllAsSeen();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/01234567-89ab-cdef-0123-456789abcdef/messages/bulk/seen",
          data: {
            archived: "exclude",
            user_ids: ["user_123"],
            engagement_status: undefined,
            has_tenant: undefined,
            tenants: undefined,
          },
        });
        expect(result).toEqual(bulkResponse);
      } finally {
        cleanup();
      }
    });

    test("marks all items as read", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkResponse = { updated_count: 3 };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAllAsRead();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/01234567-89ab-cdef-0123-456789abcdef/messages/bulk/read",
          data: {
            archived: "exclude",
            user_ids: ["user_123"],
            engagement_status: undefined,
            has_tenant: undefined,
            tenants: undefined,
          },
        });
        expect(result).toEqual(bulkResponse);
      } finally {
        cleanup();
      }
    });

    test("marks all items as archived", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const bulkResponse = { updated_count: 8 };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: bulkResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAllAsArchived();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/01234567-89ab-cdef-0123-456789abcdef/messages/bulk/archive",
          data: {
            archived: "exclude",
            user_ids: ["user_123"],
            engagement_status: undefined,
            has_tenant: undefined,
            tenants: undefined,
          },
        });
        expect(result).toEqual(bulkResponse);
      } finally {
        cleanup();
      }
    });
  });

  describe("Feed Data Fetching", () => {
    test("fetches feed data successfully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockFeedResponse = {
          entries: createMockFeedItems(3),
          meta: {
            total_count: 3,
            unread_count: 1,
            unseen_count: 2,
          },
          page_info: {
            before: null,
            after: "cursor_123",
            page_size: 50,
          },
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockFeedResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.fetch();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/users/user_123/feeds/01234567-89ab-cdef-0123-456789abcdef",
          params: { archived: "exclude" },
        });
        expect(result).toBeDefined();
        if (result && "entries" in result) {
          expect(result.entries).toHaveLength(3);
        }
      } finally {
        cleanup();
      }
    });

    test("fetches feed with custom options", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockFeedResponse = {
          entries: [],
          meta: { total_count: 0, unread_count: 0, unseen_count: 0 },
          page_info: { before: null, after: null, page_size: 25 },
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockFeedResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const options = {
          page_size: 25,
          source: "workflow_123",
          tenant: "tenant_456",
        };

        await feed.fetch(options);

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/users/user_123/feeds/01234567-89ab-cdef-0123-456789abcdef",
          params: {
            archived: "exclude",
            page_size: 25,
            source: "workflow_123",
            tenant: "tenant_456",
          },
        });
      } finally {
        cleanup();
      }
    });

    test("fetches next page of feed data", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockFeedResponse = {
          entries: createMockFeedItems(2),
          meta: { total_count: 5, unread_count: 0, unseen_count: 1 },
          page_info: {
            before: "cursor_123",
            after: "cursor_456",
            page_size: 50,
          },
        };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: mockFeedResponse,
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        // Set initial state with pagination
        feed.store.setState((state) => ({
          ...state,
          metadata: {
            total_count: 5,
            unread_count: 1,
            unseen_count: 2,
          },
          pageInfo: {
            before: null,
            after: "cursor_123",
            page_size: 50,
          },
        }));

        await feed.fetchNextPage();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "GET",
          url: "/v1/users/user_123/feeds/01234567-89ab-cdef-0123-456789abcdef",
          params: {
            archived: "exclude",
            after: "cursor_123",
          },
        });
      } finally {
        cleanup();
      }
    });
  });

  describe("Event Handling", () => {
    test("can bind and unbind event listeners", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const callback = vi.fn();
        feed.on("items.seen", callback);

        // Test that the listener was added
        expect(feed["broadcaster"].listenerCount("items.seen")).toBe(1);

        feed.off("items.seen", callback);

        // Test that the listener was removed
        expect(feed["broadcaster"].listenerCount("items.seen")).toBe(0);
      } finally {
        cleanup();
      }
    });

    test("can access feed state", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const state = feed.getState();

        expect(state).toHaveProperty("items");
        expect(state).toHaveProperty("metadata");
        expect(state).toHaveProperty("networkStatus");
        expect(state.networkStatus).toBe(NetworkStatus.ready);
      } finally {
        cleanup();
      }
    });
  });

  describe("Real-time Updates", () => {
    test("can listen for updates when authenticated", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        // Mock knock.log to capture logs
        const logSpy = vi.spyOn(knock, "log");

        feed.listenForUpdates();

        expect(logSpy).toHaveBeenCalledWith(
          "[Feed] Connecting to real-time service",
        );
      } finally {
        cleanup();
      }
    });

    test("skips listening when not authenticated", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Set up the user as not authenticated
        (knock as unknown as { userId?: string; userToken?: string }).userId =
          undefined;
        (
          knock as unknown as { userId?: string; userToken?: string }
        ).userToken = undefined;

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const logSpy = vi.spyOn(knock, "log");

        feed.listenForUpdates();

        expect(logSpy).toHaveBeenCalledWith(
          "[Feed] User is not authenticated, skipping listening for updates",
        );
      } finally {
        cleanup();
      }
    });
  });

  describe("Cleanup and Disposal", () => {
    test("tears down feed instance properly", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const logSpy = vi.spyOn(knock, "log");

        feed.teardown();

        expect(logSpy).toHaveBeenCalledWith(
          "[Feed] Tearing down feed instance",
        );
      } finally {
        cleanup();
      }
    });

    test("disposes of feed instance completely", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const logSpy = vi.spyOn(knock, "log");
        const removeInstanceSpy = vi.spyOn(knock.feeds, "removeInstance");

        feed.dispose();

        expect(logSpy).toHaveBeenCalledWith(
          "[Feed] Disposing of feed instance",
        );
        expect(removeInstanceSpy).toHaveBeenCalledWith(feed);

        removeInstanceSpy.mockRestore();
      } finally {
        cleanup();
      }
    });

    test("can reinitialize feed instance", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const originalUserFeedId = feed["userFeedId"];

        feed.reinitialize();

        // Should have the same user feed ID if user hasn't changed
        expect(feed["userFeedId"]).toBe(originalUserFeedId);
      } finally {
        cleanup();
      }
    });
  });

  describe("Cross-Browser Communication", () => {
    test("sets up broadcast channel when available", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Mock BroadcastChannel being available
        const mockBroadcastChannel = {
          postMessage: vi.fn(),
          close: vi.fn(),
          onmessage: null,
        };

        global.BroadcastChannel = vi
          .fn()
          .mockImplementation(() => mockBroadcastChannel);
        vi.stubGlobal("self", global);

        const _feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { __experimentalCrossBrowserUpdates: true },
          undefined,
        );

        expect(global.BroadcastChannel).toHaveBeenCalledWith(
          `knock:feed:01234567-89ab-cdef-0123-456789abcdef:${knock.userId}`,
        );
      } finally {
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;
        cleanup();
      }
    });

    test("handles broadcast channel unavailable gracefully", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        // Ensure BroadcastChannel is not available
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { __experimentalCrossBrowserUpdates: true },
          undefined,
        );

        // Should not throw and feed should still work
        expect(feed.feedId).toBe("01234567-89ab-cdef-0123-456789abcdef");
      } finally {
        cleanup();
      }
    });

    test("broadcasts messages over channel when available", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockPostMessage = vi.fn();
        const mockBroadcastChannel = {
          postMessage: mockPostMessage,
          close: vi.fn(),
          onmessage: null,
        };

        global.BroadcastChannel = vi
          .fn()
          .mockImplementation(() => mockBroadcastChannel);
        vi.stubGlobal("self", global);

        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { __experimentalCrossBrowserUpdates: true },
          undefined,
        );

        await feed.markAsSeen(feedItem);

        expect(mockPostMessage).toHaveBeenCalledWith({
          type: "items:seen",
          payload: { items: [feedItem] }, // Uses original items, not updated ones
        });
      } finally {
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;
        cleanup();
      }
    });

    test("handles broadcast channel message cloning errors", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        const mockPostMessage = vi.fn();
        const mockBroadcastChannel = {
          postMessage: mockPostMessage,
          close: vi.fn(),
          onmessage: null,
        };

        global.BroadcastChannel = vi
          .fn()
          .mockImplementation(() => mockBroadcastChannel);
        vi.stubGlobal("self", global);

        // Create a feedItem with circular reference to trigger JSON error
        const feedItem = createUnreadFeedItem();
        const circularData: Record<string, unknown> = { self: null };
        circularData.self = circularData;
        feedItem.data = circularData;

        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { __experimentalCrossBrowserUpdates: true },
          undefined,
        );

        await feed.markAsSeen(feedItem);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Could not broadcast items:seen"),
        );
      } finally {
        consoleSpy.mockRestore();
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;
        cleanup();
      }
    });

    test("receives and handles cross-browser updates", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockBroadcastChannel = {
          postMessage: vi.fn(),
          close: vi.fn(),
          onmessage: vi.fn(),
        };

        global.BroadcastChannel = vi
          .fn()
          .mockImplementation(() => mockBroadcastChannel);
        vi.stubGlobal("self", global);

        // Mock fetch response for when broadcast message triggers refetch
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: {
            entries: [],
            page_info: { before: null, after: null },
            metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
          },
        });

        const _feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { __experimentalCrossBrowserUpdates: true },
          undefined,
        );

        // Verify that the broadcast channel was set up
        expect(global.BroadcastChannel).toHaveBeenCalledWith(
          `knock:feed:01234567-89ab-cdef-0123-456789abcdef:${knock.userId}`,
        );
      } finally {
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;
        cleanup();
      }
    });
  });

  describe("Visibility Change Handling", () => {
    test("sets up visibility listeners when auto_manage_socket_connection is enabled", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const mockAddEventListener = vi.fn();
        global.document = {
          addEventListener: mockAddEventListener,
          removeEventListener: vi.fn(),
          visibilityState: "visible",
        } as unknown as Document;

        const mockSocketManager = {
          join: vi.fn().mockReturnValue(vi.fn()),
          leave: vi.fn(),
        };

        new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { auto_manage_socket_connection: true },
          mockSocketManager as unknown as FeedSocketManager,
        );

        expect(mockAddEventListener).toHaveBeenCalledWith(
          "visibilitychange",
          expect.any(Function),
        );
      } finally {
        delete (global as unknown as Record<string, unknown>).document;
        cleanup();
      }
    });

    test("handles document visibility change to hidden", async () => {
      const { knock, cleanup } = getTestSetup();

      try {
        let visibilityHandler: () => void;
        const mockAddEventListener = vi.fn((event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler;
          }
        });
        const mockSocket = {
          disconnect: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          connect: vi.fn(),
        };

        const mockDocument = {
          addEventListener: mockAddEventListener,
          removeEventListener: vi.fn(),
          visibilityState: "visible",
        };
        global.document = mockDocument as unknown as Document;

        const mockClient = {
          socket: mockSocket,
        };

        vi.spyOn(knock, "client").mockReturnValue(
          mockClient as unknown as ApiClient,
        );

        const mockSocketManager = {
          join: vi.fn().mockReturnValue(vi.fn()),
          leave: vi.fn(),
        };

        new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {
            auto_manage_socket_connection: true,
            auto_manage_socket_connection_delay: 100,
          },
          mockSocketManager as unknown as FeedSocketManager,
        );

        // Simulate visibility change to hidden
        mockDocument.visibilityState = "hidden";
        visibilityHandler!();

        // Should set up disconnect timer
        await new Promise((resolve) => setTimeout(resolve, 150));

        expect(mockSocket.disconnect).toHaveBeenCalled();
      } finally {
        delete (global as unknown as Record<string, unknown>).document;
        cleanup();
      }
    });

    test("handles document visibility change to visible", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        let visibilityHandler: () => void;
        const mockAddEventListener = vi.fn((event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler;
          }
        });
        const mockSocket = {
          disconnect: vi.fn(),
          isConnected: vi.fn().mockReturnValue(false),
          connect: vi.fn(),
        };

        const mockDocument = {
          addEventListener: mockAddEventListener,
          removeEventListener: vi.fn(),
          visibilityState: "hidden",
        };
        global.document = mockDocument as unknown as Document;

        const mockClient = {
          socket: mockSocket,
        };

        vi.spyOn(knock, "client").mockReturnValue(
          mockClient as unknown as ApiClient,
        );

        const mockSocketManager = {
          join: vi.fn().mockReturnValue(vi.fn()),
          leave: vi.fn(),
        };

        new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { auto_manage_socket_connection: true },
          mockSocketManager as unknown as FeedSocketManager,
        );

        // Simulate visibility change to visible
        mockDocument.visibilityState = "visible";
        visibilityHandler!();

        expect(mockSocket.connect).toHaveBeenCalled();
      } finally {
        delete (global as unknown as Record<string, unknown>).document;
        cleanup();
      }
    });

    test("tears down visibility listeners on dispose", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const mockRemoveEventListener = vi.fn();
        global.document = {
          addEventListener: vi.fn(),
          removeEventListener: mockRemoveEventListener,
          visibilityState: "visible",
        } as unknown as Document;

        const mockSocketManager = {
          join: vi.fn().mockReturnValue(vi.fn()),
          leave: vi.fn(),
        };

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          { auto_manage_socket_connection: true },
          mockSocketManager as unknown as FeedSocketManager,
        );

        feed.dispose();

        expect(mockRemoveEventListener).toHaveBeenCalledWith(
          "visibilitychange",
          expect.any(Function),
        );
      } finally {
        delete (global as unknown as Record<string, unknown>).document;
        cleanup();
      }
    });
  });

  describe("Socket Event Handling", () => {
    test("handles new message socket events", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const mockSocketManager = {
          join: vi.fn().mockReturnValue(vi.fn()),
          leave: vi.fn(),
        };

        // Mock the store response for the feed fetch
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: {
            entries: [],
            page_info: { before: null, after: null },
            metadata: { total_count: 1, unread_count: 1, unseen_count: 1 },
          },
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          mockSocketManager as unknown as FeedSocketManager,
        );

        const newMessagePayload = {
          event: "new-message" as const,
          metadata: { total_count: 2, unread_count: 2, unseen_count: 2 },
          data: {
            client_ref_id: {
              metadata: { total_count: 2, unread_count: 2, unseen_count: 2 },
            },
          },
        };

        await feed.handleSocketEvent(newMessagePayload);

        // Should trigger a fetch to get the latest data
        expect(mockApiClient.makeRequest).toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    test("initializes realtime connection with socket manager", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const mockJoin = vi.fn().mockReturnValue(vi.fn());
        const mockSocketManager = {
          join: mockJoin,
          leave: vi.fn(),
        };

        // Make knock authenticated and set hasSubscribedToRealTimeUpdates
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          mockSocketManager as unknown as FeedSocketManager,
        );

        // Simulate having subscribed before
        feed.listenForUpdates();

        // Reinitialize to trigger the realtime connection logic
        feed.reinitialize(mockSocketManager as unknown as FeedSocketManager);

        expect(mockJoin).toHaveBeenCalledWith(feed);
      } finally {
        cleanup();
      }
    });

    test("skips realtime connection when no socket manager", () => {
      const { knock, cleanup } = getTestSetup();

      try {
        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined, // No socket manager
        );

        // Should not throw when trying to initialize realtime connection
        feed.reinitialize();

        expect(feed.unsubscribeFromSocketEvents).toBeUndefined();
      } finally {
        cleanup();
      }
    });
  });

  describe("Bulk Status Operations", () => {
    test("performs bulk status update with proper scoping", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: { success: true },
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {
            status: "unread",
            archived: "exclude",
            has_tenant: true,
            tenant: "tenant-123",
          },
          undefined,
        );

        await feed.markAllAsRead();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/01234567-89ab-cdef-0123-456789abcdef/messages/bulk/read",
          data: {
            user_ids: ["user_123"],
            engagement_status: "unread",
            archived: "exclude",
            has_tenant: true,
            tenants: ["tenant-123"],
          },
        });
      } finally {
        cleanup();
      }
    });

    test("handles bulk status update with 'all' status filter", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: { success: true },
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {
            status: "all", // Should not be included in options
            archived: "include",
          },
          undefined,
        );

        await feed.markAllAsSeen();

        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/channels/01234567-89ab-cdef-0123-456789abcdef/messages/bulk/seen",
          data: {
            user_ids: ["user_123"],
            engagement_status: undefined, // Should be undefined when status is "all"
            archived: "include",
            has_tenant: undefined,
            tenants: undefined,
          },
        });
      } finally {
        cleanup();
      }
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("handles API errors during status updates gracefully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();

        mockApiClient.makeRequest.mockRejectedValue(new Error("API Error"));

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        await expect(feed.markAsSeen(feedItem)).rejects.toThrow("API Error");
      } finally {
        cleanup();
      }
    });

    test("handles network status updates during operations", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        // Initially the store should have ready network status
        expect(feed.getState().networkStatus).toBe("ready");

        const resultPromise = feed.markAsSeen(feedItem);

        await resultPromise;

        // After operation completes, should be ready again
        expect(feed.getState().networkStatus).toBe("ready");
      } finally {
        cleanup();
      }
    });

    test("handles empty item arrays gracefully", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        // Mock empty array response for empty input
        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const result = await feed.markAsSeen([]);

        expect(result).toEqual([]);
      } finally {
        cleanup();
      }
    });

    test("handles invalid metadata during status updates", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        // Create metadata with circular reference
        const circularMetadata: Record<string, unknown> = { self: null };
        circularMetadata.self = circularMetadata;

        const result = await feed.markAsInteracted(
          feedItem,
          circularMetadata as unknown as Record<string, string>,
        );

        expect(result).toEqual([updatedItem]);
        expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
          method: "POST",
          url: "/v1/messages/batch/interacted",
          data: {
            message_ids: [feedItem.id],
            metadata: circularMetadata,
          },
        });
      } finally {
        cleanup();
      }
    });
  });

  describe("Event Emission and Broadcasting", () => {
    test("emits events in both formats for compatibility", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        const dotEventHandler = vi.fn();
        const colonEventHandler = vi.fn();

        feed.on("items.seen", dotEventHandler);
        feed.on("items.*", colonEventHandler);

        await feed.markAsSeen(feedItem);

        expect(dotEventHandler).toHaveBeenCalledWith({ items: [feedItem] });
        expect(colonEventHandler).toHaveBeenCalledWith({ items: [feedItem] });
      } finally {
        cleanup();
      }
    });

    test("handles broadcast channel being null during event emission", async () => {
      const { knock, mockApiClient, cleanup } = getTestSetup();

      try {
        const feedItem = createUnreadFeedItem();
        const updatedItem = { ...feedItem, seen_at: new Date().toISOString() };

        mockApiClient.makeRequest.mockResolvedValue({
          statusCode: "ok",
          body: [updatedItem],
        });

        // Ensure no BroadcastChannel is available
        delete (global as unknown as Record<string, unknown>).BroadcastChannel;
        delete (global as unknown as Record<string, unknown>).self;

        const feed = new Feed(
          knock,
          "01234567-89ab-cdef-0123-456789abcdef",
          {},
          undefined,
        );

        // Should not throw even without BroadcastChannel
        const result = await feed.markAsSeen(feedItem);

        expect(result).toEqual([updatedItem]);
      } finally {
        cleanup();
      }
    });
  });
});
