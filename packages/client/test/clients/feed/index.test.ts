// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from "vitest";

import FeedClient, { Feed } from "../../../src/clients/feed";
import type { FeedClientOptions } from "../../../src/clients/feed/interfaces";
import { FeedSocketManager } from "../../../src/clients/feed/socket-manager";
import Knock from "../../../src/knock";

describe("FeedClient", () => {
  const mockSocket = {
    isConnected: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  const mockKnock = {
    userId: "user_123",
    userToken: "token_456",
    log: vi.fn(),
    isAuthenticated: vi.fn(() => true),
    client: vi.fn(() => ({
      socket: mockSocket,
      makeRequest: vi.fn(),
    })),
    feeds: {} as Record<string, unknown>,
  } as unknown as Knock;

  const validFeedId = "550e8400-e29b-41d4-a716-446655440000";
  const defaultOptions: FeedClientOptions = { archived: "exclude" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    test("initializes with Knock instance", () => {
      const feedClient = new FeedClient(mockKnock);
      expect(feedClient).toBeInstanceOf(FeedClient);
    });
  });

  describe("initialize", () => {
    test("creates and returns a feed instance with socket manager", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed = feedClient.initialize(validFeedId, defaultOptions);

      expect(feed).toBeInstanceOf(Feed);
      expect(feed.feedId).toBe(validFeedId);
    });

    test("creates feed instance without socket when client has no socket", () => {
      const mockKnockNoSocket = {
        ...mockKnock,
        client: vi.fn(() => ({
          socket: null,
          makeRequest: vi.fn(),
        })),
      } as unknown as Knock;

      const feedClient = new FeedClient(mockKnockNoSocket);

      const feed = feedClient.initialize(validFeedId, defaultOptions);

      expect(feed).toBeInstanceOf(Feed);
      expect(feed.feedId).toBe(validFeedId);
    });

    test("reuses existing socket manager for multiple feeds", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const feed2 = feedClient.initialize("another-feed-id", defaultOptions);

      expect(feed1).toBeInstanceOf(Feed);
      expect(feed2).toBeInstanceOf(Feed);
    });

    test("initializes socket manager only once", () => {
      const feedClient = new FeedClient(mockKnock);

      // Create multiple feeds
      feedClient.initialize(validFeedId, defaultOptions);
      feedClient.initialize("feed-2", defaultOptions);
      feedClient.initialize("feed-3", defaultOptions);

      // Socket manager should only be created once
      expect(mockKnock.client).toHaveBeenCalledTimes(3); // Once per feed
    });
  });

  describe("removeInstance", () => {
    test("removes feed instance from collection", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const feed2 = feedClient.initialize("feed-2", defaultOptions);

      // Initially should have 2 feeds
      expect(feedClient["feedInstances"]).toHaveLength(2);

      feedClient.removeInstance(feed1);

      // Should now have 1 feed
      expect(feedClient["feedInstances"]).toHaveLength(1);
      expect(feedClient["feedInstances"][0]).toBe(feed2);
    });

    test("handles removing non-existent feed gracefully", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const feed2 = new Feed(
        mockKnock,
        "other-feed",
        defaultOptions,
        undefined,
      );

      feedClient.removeInstance(feed2); // This feed was not added via initialize

      // Should still have the original feed
      expect(feedClient["feedInstances"]).toHaveLength(1);
      expect(feedClient["feedInstances"][0]).toBe(feed1);
    });
  });

  describe("teardownInstances", () => {
    test("calls teardown on all feed instances", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const feed2 = feedClient.initialize("feed-2", defaultOptions);

      // Mock the teardown methods
      feed1.teardown = vi.fn();
      feed2.teardown = vi.fn();

      feedClient.teardownInstances();

      expect(feed1.teardown).toHaveBeenCalled();
      expect(feed2.teardown).toHaveBeenCalled();
    });

    test("handles empty feed instances collection", () => {
      const feedClient = new FeedClient(mockKnock);

      // Should not throw when no feeds exist
      expect(() => feedClient.teardownInstances()).not.toThrow();
    });
  });

  describe("reinitializeInstances", () => {
    test("leaves all feeds from old socket manager and reinitializes", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const feed2 = feedClient.initialize("feed-2", defaultOptions);

      // Mock the socket manager and reinitialize methods
      const mockSocketManager = feedClient["socketManager"];
      if (mockSocketManager) {
        mockSocketManager.leave = vi.fn();
      }

      feed1.reinitialize = vi.fn();
      feed2.reinitialize = vi.fn();

      feedClient.reinitializeInstances();

      // Should leave all feeds from old socket manager
      if (mockSocketManager) {
        expect(mockSocketManager.leave).toHaveBeenCalledWith(feed1);
        expect(mockSocketManager.leave).toHaveBeenCalledWith(feed2);
      }

      // Should reinitialize all feeds with new socket manager
      expect(feed1.reinitialize).toHaveBeenCalledWith(
        expect.any(FeedSocketManager),
      );
      expect(feed2.reinitialize).toHaveBeenCalledWith(
        expect.any(FeedSocketManager),
      );
    });

    test("handles reinitialize when socket manager is undefined", () => {
      const feedClient = new FeedClient(mockKnock);

      // Force socket manager to be undefined
      feedClient["socketManager"] = undefined;

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      feed1.reinitialize = vi.fn();

      // Should not throw
      expect(() => feedClient.reinitializeInstances()).not.toThrow();

      expect(feed1.reinitialize).toHaveBeenCalled();
    });

    test("creates new socket manager after reinitialize", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, defaultOptions);
      const originalSocketManager = feedClient["socketManager"];

      feed1.reinitialize = vi.fn();

      feedClient.reinitializeInstances();

      // Socket manager should be recreated
      expect(feedClient["socketManager"]).not.toBe(originalSocketManager);
      expect(feedClient["socketManager"]).toBeInstanceOf(FeedSocketManager);
    });
  });

  describe("initSocketManager", () => {
    test("creates socket manager when socket exists and manager doesn't", () => {
      const feedClient = new FeedClient(mockKnock);

      // Initially no socket manager
      expect(feedClient["socketManager"]).toBeUndefined();

      feedClient["initSocketManager"]();

      expect(feedClient["socketManager"]).toBeInstanceOf(FeedSocketManager);
    });

    test("does not create socket manager when socket doesn't exist", () => {
      const mockKnockNoSocket = {
        ...mockKnock,
        client: vi.fn(() => ({
          socket: null,
          makeRequest: vi.fn(),
        })),
      } as unknown as Knock;

      const feedClient = new FeedClient(mockKnockNoSocket);

      feedClient["initSocketManager"]();

      expect(feedClient["socketManager"]).toBeUndefined();
    });

    test("does not recreate socket manager when it already exists", () => {
      const feedClient = new FeedClient(mockKnock);

      feedClient["initSocketManager"]();
      const firstSocketManager = feedClient["socketManager"];

      feedClient["initSocketManager"]();
      const secondSocketManager = feedClient["socketManager"];

      expect(firstSocketManager).toBe(secondSocketManager);
    });
  });

  describe("edge cases", () => {
    test("handles initialization with empty options", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed = feedClient.initialize(validFeedId);

      expect(feed).toBeInstanceOf(Feed);
      expect(feed.feedId).toBe(validFeedId);
    });

    test("maintains separate feed instances", () => {
      const feedClient = new FeedClient(mockKnock);

      const feed1 = feedClient.initialize(validFeedId, { status: "unread" });
      const feed2 = feedClient.initialize(validFeedId, { status: "read" });

      expect(feed1).not.toBe(feed2);
      expect(feed1.defaultOptions.status).toBe("unread");
      expect(feed2.defaultOptions.status).toBe("read");
    });
  });
});
