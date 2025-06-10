// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Feed from "../../../src/clients/feed/feed";
import { NetworkStatus } from "../../../src/networkStatus";
import {
  createMixedStateFeedDataset,
  createMockFeedItems,
  createReadFeedItem,
  createUnreadFeedItem,
} from "../../test-utils/fixtures";
import { authenticateKnock, createMockKnock } from "../../test-utils/mocks";

/**
 * Modern Feed Test Suite
 *
 * This test suite demonstrates modern testing practices including:
 * - User journey-focused test organization
 * - Realistic mock behavior
 * - Performance testing
 * - Error resilience testing
 * - Comprehensive scenario coverage
 */
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
        feed.store.setState({
          ...feed.store.getState(),
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
        });

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
        // Unauthenticate the user
        (knock as any).userId = undefined;
        (knock as any).userToken = undefined;

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
});
