import EventEmitter from "eventemitter2";
import { vi } from "vitest";

import type { FeedItem, FeedMetadata } from "../../src/clients/feed/interfaces";
import type { FeedSocketManager } from "../../src/clients/feed/socket-manager";
import type Knock from "../../src/knock";
import { NetworkStatus } from "../../src/networkStatus";

import {
  createMockFeedItem,
  createMockFeedMetadata,
  createNetworkErrorResponse,
  createSuccessfulFeedResponse,
} from "./fixtures";

// Realistic EventEmitter that actually works
export const createRealisticEventEmitter = () => {
  const emitter = new EventEmitter();
  return {
    on: vi
      .fn()
      .mockImplementation((event, listener) => emitter.on(event, listener)),
    off: vi
      .fn()
      .mockImplementation((event, listener) => emitter.off(event, listener)),
    emit: vi
      .fn()
      .mockImplementation((event, ...args) => emitter.emit(event, ...args)),
    removeAllListeners: vi
      .fn()
      .mockImplementation(() => emitter.removeAllListeners()),
  };
};

// Realistic Socket Manager that tracks state
export const createRealisticSocketManager = (): FeedSocketManager => {
  const joinedFeeds = new Set();
  const eventHandlers = new Map();

  return {
    join: vi.fn().mockImplementation((feed) => {
      joinedFeeds.add(feed);

      // Store the event handler for this feed
      const handler = (event: any) => {
        // Simulate realistic socket event processing
        if (event.event === "new-message" && event.data?.entries) {
          const currentState = feed.getState();
          feed.store.setState({
            ...currentState,
            items: [...currentState.items, ...event.data.entries],
            metadata: event.metadata || currentState.metadata,
          });
        }
      };

      eventHandlers.set(feed, handler);

      // Simulate async socket events immediately (no delay for fast tests)
      const storedHandler = eventHandlers.get(feed);
      if (storedHandler) {
        storedHandler({
          event: "new-message",
          data: { test: "data" },
          metadata: createMockFeedMetadata(),
        });
      }

      const unsubscribe = vi.fn().mockImplementation(() => {
        joinedFeeds.delete(feed);
        eventHandlers.delete(feed);
      });

      return unsubscribe;
    }),

    leave: vi.fn().mockImplementation((feed) => {
      joinedFeeds.delete(feed);
      eventHandlers.delete(feed);
    }),

    // Test utility methods
    getJoinedFeeds: () => Array.from(joinedFeeds),
    simulateSocketEvent: (feed: any, event: any) => {
      const handler = eventHandlers.get(feed);
      if (handler) {
        handler(event);
      }
    },

    setEventHandler: (feed: any, handler: any) => {
      eventHandlers.set(feed, handler);
    },
  } as any;
};

// Realistic HTTP client that can simulate various network conditions
export const createRealisticHttpClient = () => {
  let requestCount = 0;
  let shouldFailNextRequest = false;
  let failureType: "network" | "rate-limit" | "validation" = "network";
  let responseDelay = 0;

  const mockClient = {
    makeRequest: vi.fn().mockImplementation(async (options) => {
      requestCount++;

      // Simulate network delay only if explicitly set (default to 0 for fast tests)
      if (responseDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, responseDelay));
      }

      // Simulate failures
      if (shouldFailNextRequest) {
        shouldFailNextRequest = false;

        switch (failureType) {
          case "network":
            return createNetworkErrorResponse();
          case "rate-limit":
            return {
              statusCode: "error" as const,
              error: "Rate limit exceeded",
              retryAfter: 60000,
            };
          case "validation":
            return {
              statusCode: "error" as const,
              error: "Invalid request parameters",
            };
          default:
            return createNetworkErrorResponse();
        }
      }

      // Simulate different endpoints
      if (options.url.includes("/feeds/")) {
        const pageSize = options.params?.page_size || 50;
        const items = Array.from({ length: Math.min(pageSize, 20) }, () =>
          createMockFeedItem(),
        );

        return createSuccessfulFeedResponse(items, {
          total_count: 100,
          unread_count: 30,
          unseen_count: 50,
        });
      }

      return createSuccessfulFeedResponse();
    }),

    // Test utility methods
    getRequestCount: () => requestCount,
    simulateFailure: (
      type: "network" | "rate-limit" | "validation" = "network",
    ) => {
      shouldFailNextRequest = true;
      failureType = type;
    },
    setDelay: (ms: number) => {
      responseDelay = ms;
    },
    reset: () => {
      requestCount = 0;
      shouldFailNextRequest = false;
      responseDelay = 0;
    },
  };

  return mockClient;
};

// Realistic Knock client
export const createRealisticKnockClient = (): Knock => {
  const httpClient = createRealisticHttpClient();
  const socketManager = createRealisticSocketManager();

  return {
    log: vi.fn().mockImplementation((message, isError = false) => {
      if (isError) {
        console.error(`[Knock] ${message}`);
      } else {
        console.log(`[Knock] ${message}`);
      }
    }),

    isAuthenticated: vi.fn().mockReturnValue(true),

    client: vi.fn().mockReturnValue(httpClient),

    userId: `user_${Math.random().toString(36).substr(2, 9)}`,

    feeds: {
      removeInstance: vi.fn(),
    },

    messages: {
      batchUpdateStatuses: vi.fn().mockImplementation(async ({ status }) => {
        // Simulate realistic batch update behavior without delay
        return { status: "ok" };
      }),

      bulkUpdateAllStatusesInChannel: vi
        .fn()
        .mockImplementation(async ({ status }) => {
          // Simulate realistic bulk update behavior without delay
          return { status: "ok" };
        }),

      updateStatus: vi.fn().mockImplementation(async (messageId, status) => {
        // Return immediately without delay
        return { status: "ok" };
      }),
    },

    // Test utilities
    getHttpClient: () => httpClient,
    getSocketManager: () => socketManager,
  } as any;
};

// Create realistic BroadcastChannel mock
export const createRealisticBroadcastChannel = () => {
  const channels = new Map();

  return class MockBroadcastChannel {
    public name: string;
    public onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
      if (!channels.has(name)) {
        channels.set(name, new Set());
      }
      channels.get(name).add(this);
    }

    postMessage(data: any) {
      const channelInstances = channels.get(this.name);
      if (channelInstances) {
        channelInstances.forEach((instance: any) => {
          if (instance !== this && instance.onmessage) {
            // Simulate message delivery immediately (no delay for fast tests)
            instance.onmessage({ data });
          }
        });
      }
    }

    close() {
      const channelInstances = channels.get(this.name);
      if (channelInstances) {
        channelInstances.delete(this);
      }
    }

    // Test utilities
    static getChannels() {
      return channels;
    }

    static reset() {
      channels.clear();
    }
  };
};

// Create realistic document visibility mock
export const createRealisticDocumentMock = () => {
  let visibilityState: "visible" | "hidden" = "visible";
  const listeners = new Map();

  return {
    visibilityState,
    hidden: false,

    addEventListener: vi.fn().mockImplementation((event, listener) => {
      if (event === "visibilitychange") {
        if (!listeners.has("visibilitychange")) {
          listeners.set("visibilitychange", new Set());
        }
        listeners.get("visibilitychange").add(listener);
      }
    }),

    removeEventListener: vi.fn().mockImplementation((event, listener) => {
      if (event === "visibilitychange" && listeners.has("visibilitychange")) {
        listeners.get("visibilitychange").delete(listener);
      }
    }),

    // Test utilities
    simulateVisibilityChange: (newState: "visible" | "hidden") => {
      visibilityState = newState;
      const visibilityListeners = listeners.get("visibilitychange");
      if (visibilityListeners) {
        visibilityListeners.forEach((listener: any) => {
          listener();
        });
      }
    },

    getVisibilityState: () => visibilityState,

    reset: () => {
      visibilityState = "visible";
      listeners.clear();
    },
  };
};

// Performance monitoring utilities
export const createPerformanceMonitor = () => {
  const measurements = new Map();

  return {
    start: (name: string) => {
      measurements.set(name, { start: performance.now() });
    },

    end: (name: string) => {
      const measurement = measurements.get(name);
      if (measurement) {
        measurement.end = performance.now();
        measurement.duration = measurement.end - measurement.start;
      }
      return measurement;
    },

    getDuration: (name: string) => {
      const measurement = measurements.get(name);
      return measurement?.duration || 0;
    },

    reset: () => {
      measurements.clear();
    },

    getAllMeasurements: () => Object.fromEntries(measurements),
  };
};

// Realistic timing utilities
export const createTimingUtils = () => {
  const timers = new Set<NodeJS.Timeout>();

  return {
    delay: (ms: number) => {
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        timers.add(timer);
      });
    },

    flushTimers: () => {
      vi.runAllTimers();
    },

    cleanup: () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    },
  };
};

// Race condition simulation utilities
export const createRaceConditionSimulator = () => {
  const pendingOperations = new Set();

  return {
    simulateRace: async (operations: (() => Promise<any>)[]) => {
      const promises = operations.map(async (op, index) => {
        const delay = Math.random() * 100; // Random delay 0-100ms
        await new Promise((resolve) => setTimeout(resolve, delay));
        return { index, result: await op() };
      });

      return Promise.allSettled(promises);
    },

    simulateConcurrentUpdates: async (feed: any, items: FeedItem[]) => {
      const operations = items.map((item) => () => feed.markAsRead(item));

      return await Promise.allSettled(operations.map((op) => op()));
    },
  };
};
