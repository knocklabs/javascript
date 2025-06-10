import { vi } from "vitest";

// Import AFTER the Phoenix mock is set up
import ApiClient from "../../src/api";
import Feed from "../../src/clients/feed/feed";
import type { FeedClientOptions } from "../../src/clients/feed/interfaces";
import Knock from "../../src/knock";

/**
 * Simplified Test Setup & Mock Utilities
 *
 * This combines simple mock factories with focused test setup utilities.
 * Each function has a clear responsibility and minimal abstraction.
 */

// Simple mock factories - no complex state management
export const createMockApiClient = () => {
  const makeRequest = vi.fn().mockResolvedValue({
    statusCode: "ok",
    body: { success: true },
    status: 200,
  });

  // Ensure promise rejections are properly handled
  makeRequest.mockRejectedValue = (error: any) => {
    const rejectedMock = vi.fn().mockRejectedValue(error);
    // Handle the rejection to prevent unhandled promise rejections
    rejectedMock().catch(() => {
      // Silently catch to prevent unhandled rejections during setup
    });
    return makeRequest.mockImplementation(() => Promise.reject(error));
  };

  return {
    makeRequest,
    socket: undefined,
  };
};

export const createMockKnock = (apiKey = "pk_test_12345") => {
  const knock = new Knock(apiKey);
  const mockApiClient = createMockApiClient();

  vi.spyOn(knock, "client").mockReturnValue(mockApiClient as any);
  vi.spyOn(knock, "log").mockImplementation(() => {});

  return { knock, mockApiClient };
};

// Simple feed setup without complex environment mocking
export const createMockFeed = (
  feedId = "test-feed-id",
  options: Partial<FeedClientOptions> = {},
) => {
  const { knock, mockApiClient } = createMockKnock();

  const defaultOptions: FeedClientOptions = {
    auto_manage_socket_connection: false,
    ...options,
  };

  // Simple socket manager mock
  const mockSocketManager = {
    join: vi.fn().mockReturnValue(vi.fn()), // returns unsubscribe function
    leave: vi.fn(),
  };

  const feed = new Feed(
    knock,
    feedId,
    defaultOptions,
    mockSocketManager as any,
  );

  return {
    feed,
    knock,
    mockApiClient,
    mockSocketManager,
  };
};

// Network mocking utilities - applied per test, not globally
export const mockNetworkSuccess = (
  mockApiClient: any,
  data: any = { success: true },
) => {
  mockApiClient.makeRequest.mockResolvedValue({
    statusCode: "ok",
    body: data,
    status: 200,
  });
};

export const mockNetworkError = (
  mockApiClient: any,
  status = 500,
  error = "Server error",
) => {
  mockApiClient.makeRequest.mockResolvedValue({
    statusCode: "error",
    error,
    status,
  });
};

export const mockNetworkFailure = (
  mockApiClient: any,
  error = new Error("Network failure"),
) => {
  // Properly handle rejected promises to prevent unhandled rejections
  const rejectedPromise = Promise.reject(error);
  rejectedPromise.catch(() => {
    // Catch to prevent unhandled rejection warnings during setup
  });

  mockApiClient.makeRequest.mockImplementation(() => rejectedPromise);
};

// Simple authentication helper
export const authenticateKnock = (
  knock: Knock,
  userId = "user_123",
  userToken = "test-token",
) => {
  knock.authenticate(userId, userToken);
  return { userId, userToken };
};

// Test cleanup utility
export const createCleanup = (...cleanupFns: (() => void)[]) => {
  return () => {
    cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.warn("Cleanup error:", error);
      }
    });
    vi.clearAllMocks();
  };
};

// Simple test data generators
export const createMockFeedItem = (overrides: any = {}) => ({
  __cursor: `cursor-${Math.random().toString(36).substr(2, 9)}`,
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  activities: [],
  actors: [],
  blocks: [],
  data: {},
  inserted_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  read_at: null,
  seen_at: null,
  clicked_at: null,
  archived_at: null,
  interacted_at: null,
  link_clicked_at: null,
  total_activities: 1,
  total_actors: 1,
  source: { key: "test-source" },
  tenant: null,
  ...overrides,
});

export const createMockFeedMetadata = (overrides: any = {}) => ({
  total_count: 10,
  unread_count: 5,
  unseen_count: 3,
  ...overrides,
});

// Environment setup - choose one consistently
export const setupNodeEnvironment = () => {
  // Minimal node environment setup
  return {
    cleanup: () => {
      // Any node-specific cleanup
    },
  };
};

export const setupBrowserEnvironment = () => {
  // Mock only essential browser APIs without global pollution
  const originalWebSocket = global.WebSocket;
  const originalBroadcastChannel = global.BroadcastChannel;

  (global as any).WebSocket = vi.fn();
  (global as any).BroadcastChannel = vi.fn();

  return {
    cleanup: () => {
      global.WebSocket = originalWebSocket;
      global.BroadcastChannel = originalBroadcastChannel;
    },
  };
};

// Simple axios mock for API testing
export const createAxiosMock = () => {
  const mockAxios = vi.fn();

  // Default successful response
  mockAxios.mockResolvedValue({
    status: 200,
    data: { success: true },
  });

  // Helper methods for common scenarios
  const mockSuccess = (data: any, status = 200) => {
    mockAxios.mockResolvedValue({ status, data });
  };

  const mockError = (status: number, message = "Error") => {
    mockAxios.mockResolvedValue({
      status,
      data: { error: message },
    });
  };

  const mockFailure = (error: Error) => {
    mockAxios.mockRejectedValue(error);
  };

  return {
    axios: mockAxios,
    mockSuccess,
    mockError,
    mockFailure,
    reset: () => mockAxios.mockClear(),
  };
};

// Simple WebSocket mock
export const createWebSocketMock = () => {
  const mockWebSocket = {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
  };

  return mockWebSocket;
};

// Simple BroadcastChannel mock
export const createBroadcastChannelMock = () => {
  const channels = new Map();

  return class MockBroadcastChannel {
    constructor(public name: string) {
      channels.set(name, this);
    }

    postMessage = vi.fn();
    close = vi.fn();
    onmessage: ((event: MessageEvent) => void) | null = null;

    // Test utility to simulate message
    simulateMessage(data: any) {
      if (this.onmessage) {
        this.onmessage(new MessageEvent("message", { data }));
      }
    }

    // Test utility to get all channels
    static getChannels() {
      return channels;
    }

    static reset() {
      channels.clear();
    }
  };
};

// Simple socket manager mock
export const createSocketManagerMock = () => ({
  join: vi.fn().mockReturnValue(vi.fn()), // returns unsubscribe function
  leave: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn().mockReturnValue(false),
});

// Simple event emitter mock
export const createEventEmitterMock = () => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  removeAllListeners: vi.fn(),
});

// Simple document mock for browser APIs
export const createDocumentMock = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  visibilityState: "visible",
  hidden: false,
});

// Module-level mocks for common dependencies
export const mockAxios = () => {
  vi.mock("axios", () => ({
    default: {
      create: vi.fn(() => createAxiosMock().axios),
    },
  }));
};

export const mockAxiosRetry = () => {
  vi.mock("axios-retry", () => ({
    default: vi.fn(),
    isNetworkError: vi.fn().mockReturnValue(false),
    exponentialDelay: vi.fn().mockReturnValue(1000),
  }));
};

export const mockJwtDecode = () => {
  vi.mock("jwt-decode", () => ({
    jwtDecode: vi.fn().mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    }),
  }));
};
