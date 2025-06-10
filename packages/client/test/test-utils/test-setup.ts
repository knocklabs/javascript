import { afterAll, afterEach, beforeEach, expect, vi } from "vitest";
import { describe, test } from "vitest";

import ApiClient from "../../src/api";
import Feed from "../../src/clients/feed/feed";
import type { FeedClientOptions } from "../../src/clients/feed/interfaces";
import type { FeedSocketManager } from "../../src/clients/feed/socket-manager";
import MessageClient from "../../src/clients/messages";
import UsersClient from "../../src/clients/users";
import Knock from "../../src/knock";
import { NetworkStatus } from "../../src/networkStatus";

import {
  createMockFeedItems,
  createMockFeedOptions,
  createMockFeedState,
} from "./fixtures";
import {
  createPerformanceMonitor,
  createRealisticBroadcastChannel,
  createRealisticDocumentMock,
  createRealisticEventEmitter,
  createRealisticKnockClient,
  createRealisticSocketManager,
  createTimingUtils,
} from "./mock-factories";

// Mock axios and axios-retry at the top level with proper factory functions
vi.mock("axios", () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock("axios-retry", () => ({
  default: vi.fn(),
  isNetworkError: vi.fn(),
  exponentialDelay: vi.fn(),
}));

// Mock phoenix Socket to prevent WebSocket issues
vi.mock("phoenix", () => ({
  Socket: vi.fn().mockImplementation((url: string, options?: any) => ({
    url,
    options,
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    channel: vi.fn().mockReturnValue({
      join: vi.fn(),
      leave: vi.fn(),
      push: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }),
  })),
}));

// Comprehensive network mocking to prevent any real network calls
const originalFetch = global.fetch;
const originalXMLHttpRequest = global.XMLHttpRequest;

// Mock global fetch to prevent any fetch calls
global.fetch = vi.fn().mockImplementation(async (url: any, options?: any) => {
  console.warn(`[TEST] Blocked fetch call to: ${url}`);
  return new Response(JSON.stringify({ mocked: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// Mock XMLHttpRequest to prevent any XMLHttpRequest calls
(global as any).XMLHttpRequest = vi.fn().mockImplementation(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  status: 200,
  statusText: "OK",
  response: JSON.stringify({ mocked: true }),
  responseText: JSON.stringify({ mocked: true }),
  readyState: 4,
  onreadystatechange: null,
}));

// Mock WebSocket to prevent real WebSocket connections
(global as any).WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
}));

// Mock EventSource to prevent Server-Sent Events
(global as any).EventSource = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  onopen: null,
  onmessage: null,
  onerror: null,
}));

// Clean up global mocks after all tests
afterAll(() => {
  global.fetch = originalFetch;
  (global as any).XMLHttpRequest = originalXMLHttpRequest;
});

// Global test environment state
interface TestEnvironment {
  mockKnock: Knock;
  mockSocketManager: FeedSocketManager;
  mockDocument: any;
  MockBroadcastChannel: any;
  performanceMonitor: any;
  timingUtils: any;
}

// Test environment factory
export const createTestEnvironment = (): TestEnvironment => {
  const mockKnock = createRealisticKnockClient();
  const mockSocketManager = createRealisticSocketManager();
  const mockDocument = createRealisticDocumentMock();
  const MockBroadcastChannel = createRealisticBroadcastChannel();
  const performanceMonitor = createPerformanceMonitor();
  const timingUtils = createTimingUtils();

  return {
    mockKnock,
    mockSocketManager,
    mockDocument,
    MockBroadcastChannel,
    performanceMonitor,
    timingUtils,
  };
};

// Feed test setup with comprehensive configuration
export interface FeedTestSetup {
  feed: Feed;
  mockKnock: Knock;
  mockSocketManager: FeedSocketManager;
  mockDocument: any;
  MockBroadcastChannel: any;
  performanceMonitor: any;
  timingUtils: any;
  cleanup: () => void;
}

export const setupFeedTest = (
  feedId?: string,
  options?: Partial<FeedClientOptions>,
  customMocks?: Partial<TestEnvironment>,
): FeedTestSetup => {
  const testEnv = createTestEnvironment();

  // Allow custom mocks to override defaults
  const finalEnv = { ...testEnv, ...customMocks };

  const validFeedId = feedId || "550e8400-e29b-41d4-a716-446655440000";
  const feedOptions = createMockFeedOptions(options);

  // Setup global mocks
  vi.stubGlobal("document", finalEnv.mockDocument);
  vi.stubGlobal("self", {
    BroadcastChannel: finalEnv.MockBroadcastChannel,
  });

  const feed = new Feed(
    finalEnv.mockKnock,
    validFeedId,
    feedOptions,
    finalEnv.mockSocketManager,
  );

  const cleanup = () => {
    feed.dispose();
    finalEnv.timingUtils.cleanup();
    finalEnv.performanceMonitor.reset();
    finalEnv.mockDocument.reset();
    finalEnv.MockBroadcastChannel.reset();
    vi.unstubAllGlobals();
  };

  return {
    feed,
    ...finalEnv,
    cleanup,
  };
};

// Batch setup for multiple feeds (useful for integration tests)
export const setupMultipleFeedTest = (
  feedConfigs: Array<{
    feedId?: string;
    options?: Partial<FeedClientOptions>;
  }>,
) => {
  const testEnv = createTestEnvironment();

  // Setup global mocks once
  vi.stubGlobal("document", testEnv.mockDocument);
  vi.stubGlobal("self", {
    BroadcastChannel: testEnv.MockBroadcastChannel,
  });

  const feeds = feedConfigs.map(({ feedId, options }) => {
    const validFeedId =
      feedId ||
      `550e8400-e29b-41d4-a716-${Math.random().toString().substr(2, 12)}`;
    const feedOptions = createMockFeedOptions(options);

    return new Feed(
      testEnv.mockKnock,
      validFeedId,
      feedOptions,
      testEnv.mockSocketManager,
    );
  });

  const cleanup = () => {
    feeds.forEach((feed) => feed.dispose());
    testEnv.timingUtils.cleanup();
    testEnv.performanceMonitor.reset();
    testEnv.mockDocument.reset();
    testEnv.MockBroadcastChannel.reset();
    vi.unstubAllGlobals();
  };

  return {
    feeds,
    ...testEnv,
    cleanup,
  };
};

// Performance test setup
export const setupPerformanceTest = (itemCount: number = 1000) => {
  const setup = setupFeedTest();

  // Pre-populate with large dataset
  const { items, metadata } = createMockFeedState({
    items: createMockFeedItems(itemCount),
    metadata: {
      total_count: itemCount,
      unread_count: Math.floor(itemCount * 0.3),
      unseen_count: Math.floor(itemCount * 0.5),
    },
  });

  setup.feed.store.setState({
    items,
    metadata,
    pageInfo: { after: null, before: null, page_size: 50 },
    networkStatus: "ready" as any,
  });

  return setup;
};

// Integration test setup with realistic delays and behaviors
export const setupIntegrationTest = () => {
  const setup = setupFeedTest();

  // Configure realistic network delays
  const httpClient = (setup.mockKnock as any).getHttpClient();
  httpClient.setDelay(50); // 50ms network delay

  return setup;
};

// Error scenario test setup
export const setupErrorScenarioTest = (
  errorType: "network" | "rate-limit" | "validation" = "network",
) => {
  const setup = setupFeedTest();

  // Pre-configure to simulate failures
  const httpClient = (setup.mockKnock as any).getHttpClient();
  httpClient.simulateFailure(errorType);

  return setup;
};

// Async behavior test setup with timing controls
export const setupAsyncTest = () => {
  const setup = setupFeedTest();

  // Use fake timers for controlled async testing
  vi.useFakeTimers();

  const originalCleanup = setup.cleanup;
  setup.cleanup = () => {
    vi.useRealTimers();
    originalCleanup();
  };

  return {
    ...setup,
    advanceTime: (ms: number) => vi.advanceTimersByTime(ms),
    runAllTimers: () => vi.runAllTimers(),
  };
};

// Cross-browser communication test setup
export const setupCrossBrowserTest = () => {
  const setup = setupMultipleFeedTest([
    { options: { __experimentalCrossBrowserUpdates: true } },
    { options: { __experimentalCrossBrowserUpdates: true } },
  ]);

  return {
    ...setup,
    simulateCrossBrowserEvent: (eventType: string, payload: any) => {
      // Simulate broadcast between instances
      const channel = new setup.MockBroadcastChannel("feed-channel");
      channel.postMessage({ type: eventType, payload });
    },
  };
};

// Common beforeEach/afterEach patterns
export const useFeedTestHooks = (setupFn: () => FeedTestSetup) => {
  let testSetup: FeedTestSetup;

  beforeEach(() => {
    vi.clearAllMocks();
    testSetup = setupFn();
  });

  afterEach(() => {
    testSetup?.cleanup();
  });

  return () => testSetup;
};

// Assertion helpers for common test patterns
export const expectFeedState = (feed: Feed) => {
  const state = feed.getState();

  return {
    toHaveItemCount: (count: number) => {
      expect(state.items).toHaveLength(count);
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveUnreadCount: (count: number) => {
      expect(state.metadata.unread_count).toBe(count);
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveUnseenCount: (count: number) => {
      expect(state.metadata.unseen_count).toBe(count);
      return expectFeedState(feed); // Return chainable helper
    },

    toBeInState: (networkStatus: string) => {
      expect(state.networkStatus).toBe(networkStatus);
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveItemWithId: (itemId: string) => {
      expect(state.items.find((item) => item.id === itemId)).toBeDefined();
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveReadItem: (itemId: string) => {
      const item = state.items.find((item) => item.id === itemId);
      expect(item?.read_at).toBeTruthy();
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveSeenItem: (itemId: string) => {
      const item = state.items.find((item) => item.id === itemId);
      expect(item?.seen_at).toBeTruthy();
      return expectFeedState(feed); // Return chainable helper
    },

    toHaveArchivedItem: (itemId: string) => {
      const item = state.items.find((item) => item.id === itemId);
      expect(item?.archived_at).toBeTruthy();
      return expectFeedState(feed); // Return chainable helper
    },
  };
};

// Event assertion helpers
export const expectEventEmission = (eventEmitter: any) => {
  return {
    toHaveEmitted: (eventName: string, times = 1) => {
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        eventName,
        expect.any(Object),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(times);
    },

    toHaveEmittedWith: (eventName: string, payload: any) => {
      expect(eventEmitter.emit).toHaveBeenCalledWith(eventName, payload);
    },
  };
};

// HTTP request assertion helpers
export const expectHttpRequests = (httpClient: any) => {
  return {
    toHaveBeenCalled: (times = 1) => {
      expect(httpClient.makeRequest).toHaveBeenCalledTimes(times);
    },

    toHaveBeenCalledWith: (expectedRequest: any) => {
      expect(httpClient.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining(expectedRequest),
      );
    },

    toHaveRequestCount: (count: number) => {
      expect(httpClient.getRequestCount()).toBe(count);
    },
  };
};

// Socket assertion helpers
export const expectSocketBehavior = (socketManager: any) => {
  return {
    toHaveJoined: (feed: Feed) => {
      expect(socketManager.join).toHaveBeenCalledWith(feed);
    },

    toHaveLeft: (feed: Feed) => {
      expect(socketManager.leave).toHaveBeenCalledWith(feed);
    },

    toHaveJoinedFeedCount: (count: number) => {
      expect(socketManager.getJoinedFeeds()).toHaveLength(count);
    },
  };
};

/**
 * Setup for API Client tests
 */
export type ApiTestSetup = {
  apiClient: ApiClient;
  mockAxios: any;
  cleanup: () => void;
};

export function setupApiTest(
  options: {
    host?: string;
    apiKey?: string;
    userToken?: string;
  } = {},
): ApiTestSetup {
  // Create a mock axios instance that's callable as a function
  const mockAxiosInstance = vi.fn();

  // Ensure it's always callable and returns a promise
  mockAxiosInstance.mockImplementation(() =>
    Promise.resolve({
      status: 200,
      data: { success: true },
    }),
  );

  // Also add the promise methods for when tests call mockResolvedValue/mockRejectedValue
  mockAxiosInstance.mockResolvedValue({
    status: 200,
    data: { success: true },
  });

  // Try to set up the module mocks (for the constructor)
  const axios = require("axios");
  const axiosRetry = require("axios-retry");

  // Ensure axios.create returns our mock function during construction
  const createMock = vi.fn(() => mockAxiosInstance);
  axios.default.create = createMock;

  // Configure axios-retry mocks to be no-ops
  axiosRetry.default = vi.fn(() => ({}));
  axiosRetry.isNetworkError = vi.fn(() => false);
  axiosRetry.exponentialDelay = vi.fn(() => 1000);

  const config = {
    host: "https://api.knock.app",
    apiKey: "pk_test_12345",
    userToken: "user_token_123",
    ...options,
  };

  // Create ApiClient instance
  const apiClient = new ApiClient(config);

  // DIRECTLY replace the axiosClient property to ensure it's our mock
  (apiClient as any).axiosClient = mockAxiosInstance;

  const cleanup = () => {
    mockAxiosInstance.mockClear();
    createMock.mockClear();
  };

  return {
    apiClient,
    mockAxios: {
      instance: mockAxiosInstance,
    },
    cleanup,
  };
}

/**
 * Setup for Knock client tests
 */
export type KnockTestSetup = {
  knock: Knock;
  mockApiClient: any;
  cleanup: () => void;
};

export function setupKnockTest(apiKey = "pk_test_12345"): KnockTestSetup {
  const knock = new Knock(apiKey);

  const mockApiClient = {
    makeRequest: vi.fn(),
    socket: {
      isConnected: vi.fn(() => false),
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
  };

  vi.spyOn(knock, "client").mockReturnValue(mockApiClient as any);

  const cleanup = () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    knock.teardown();
  };

  return {
    knock,
    mockApiClient,
    cleanup,
  };
}

/**
 * Setup for Message Client tests
 */
export type MessageClientTestSetup = {
  messageClient: MessageClient;
  mockKnock: Knock;
  mockApiClient: any;
  cleanup: () => void;
};

export function setupMessageClientTest(): MessageClientTestSetup {
  const { knock, mockApiClient, cleanup: knockCleanup } = setupKnockTest();
  const messageClient = new MessageClient(knock);

  const cleanup = () => {
    knockCleanup();
  };

  return {
    messageClient,
    mockKnock: knock,
    mockApiClient,
    cleanup,
  };
}

/**
 * Setup for Users Client tests
 */
export type UsersClientTestSetup = {
  usersClient: UsersClient;
  mockKnock: Knock;
  mockApiClient: any;
  cleanup: () => void;
};

export function setupUsersClientTest(): UsersClientTestSetup {
  const { knock, mockApiClient, cleanup: knockCleanup } = setupKnockTest();
  const usersClient = new UsersClient(knock);

  const cleanup = () => {
    knockCleanup();
  };

  return {
    usersClient,
    mockKnock: knock,
    mockApiClient,
    cleanup,
  };
}

/**
 * API Response expectations and utilities
 */
export type ApiResponse<T = any> = {
  statusCode: "ok" | "error";
  body?: T;
  error?: any;
  status?: number;
};

export function createSuccessResponse<T>(
  data: T,
  status = 200,
): ApiResponse<T> {
  return {
    statusCode: "ok",
    body: data,
    status,
  };
}

export function createErrorResponse(error: any, status = 500): ApiResponse {
  return {
    statusCode: "error",
    error,
    status,
  };
}

/**
 * HTTP request expectation utilities
 */
export function expectApiRequest(mockApiClient: any) {
  return {
    toHaveBeenCalledWith: (expectedRequest: {
      method: string;
      url: string;
      data?: any;
    }) => {
      expect(mockApiClient.makeRequest).toHaveBeenCalledWith(expectedRequest);
    },
    toHaveBeenCalledTimes: (times: number) => {
      expect(mockApiClient.makeRequest).toHaveBeenCalledTimes(times);
    },
    toHaveLastBeenCalledWith: (expectedRequest: {
      method: string;
      url: string;
      data?: any;
    }) => {
      expect(mockApiClient.makeRequest).toHaveBeenLastCalledWith(
        expectedRequest,
      );
    },
  };
}

/**
 * Authentication test utilities
 */
export function setupAuthenticatedTest(
  userId = "user_123",
  userToken = "token_123",
) {
  const { knock, mockApiClient, cleanup } = setupKnockTest();

  knock.authenticate(userId, userToken);

  return {
    knock,
    mockApiClient,
    userId,
    userToken,
    cleanup,
  };
}

/**
 * Error scenario testing utilities
 */
export function setupErrorScenario(
  errorType: "network" | "rate-limit" | "server" | "not-found",
  customError?: any,
) {
  const errorConfigs = {
    network: {
      error: new Error("Network Error"),
      status: 0,
    },
    "rate-limit": {
      error: new Error("Rate Limit Exceeded"),
      status: 429,
    },
    server: {
      error: new Error("Internal Server Error"),
      status: 500,
    },
    "not-found": {
      error: new Error("Not Found"),
      status: 404,
    },
  };

  const config = customError || errorConfigs[errorType];

  return createErrorResponse(config.error, config.status);
}

/**
 * Async operation testing utilities
 */
export function setupAsyncOperation() {
  let resolvePromise: (value?: any) => void;
  let rejectPromise: (reason?: any) => void;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise!,
    reject: rejectPromise!,
  };
}

/**
 * Test data validation utilities
 */
export function expectValidResponse<T>(
  response: T,
  validator: (data: T) => boolean | void,
) {
  if (typeof validator === "function") {
    const result = validator(response);
    if (result === false) {
      throw new Error("Response validation failed");
    }
  }
  expect(response).toBeDefined();
}

/**
 * Batch operation testing utilities
 */
export function setupBatchOperationTest<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
) {
  const results: Array<{ item: T; result: "success" | "error"; error?: any }> =
    [];

  const executeBatch = async () => {
    const promises = items.map(async (item) => {
      try {
        await operation(item);
        results.push({ item, result: "success" });
      } catch (error) {
        results.push({ item, result: "error", error });
      }
    });

    await Promise.allSettled(promises);
    return results;
  };

  return {
    executeBatch,
    getResults: () => results,
    getSuccessCount: () => results.filter((r) => r.result === "success").length,
    getErrorCount: () => results.filter((r) => r.result === "error").length,
  };
}

/**
 * Enhanced test hooks that work with all client types
 */
export function useTestHooks<T extends { cleanup: () => void }>(
  setupFn: () => T,
) {
  let setup: T | null = null;

  beforeEach(() => {
    setup = setupFn();
  });

  afterEach(() => {
    if (setup) {
      setup.cleanup();
      setup = null;
    }
  });

  return () => {
    if (!setup) {
      throw new Error(
        "Test setup not initialized. Make sure to call this within a test.",
      );
    }
    return setup;
  };
}

/**
 * Retry and resilience testing utilities
 */
export function setupRetryTest(maxRetries = 3) {
  let attemptCount = 0;

  const mockOperation = vi.fn().mockImplementation(() => {
    attemptCount++;
    if (attemptCount <= maxRetries - 1) {
      throw new Error(`Attempt ${attemptCount} failed`);
    }
    return { success: true, attempts: attemptCount };
  });

  const reset = () => {
    attemptCount = 0;
    mockOperation.mockClear();
  };

  return {
    operation: mockOperation,
    getAttempts: () => attemptCount,
    reset,
  };
}

/**
 * Time-based testing utilities
 */
export function setupTimerTest() {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  return {
    advanceTime: (ms: number) => vi.advanceTimersByTime(ms),
    runAllTimers: () => vi.runAllTimers(),
  };
}

/**
 * Environment simulation utilities
 */
export function simulateBrowserEnvironment() {
  const originalWindow = globalThis.window;
  const originalWebSocket = globalThis.WebSocket;
  const originalBroadcastChannel = globalThis.BroadcastChannel;

  // Mock browser environment
  globalThis.window = {
    WebSocket: class MockWebSocket {
      constructor(
        public url: string,
        public protocols?: string | string[],
      ) {}
      close = vi.fn();
      send = vi.fn();
      readyState = 1; // OPEN
      onopen: any = null;
      onclose: any = null;
      onmessage: any = null;
      onerror: any = null;
    },
    BroadcastChannel: class MockBroadcastChannel {
      constructor(public name: string) {}
      postMessage = vi.fn();
      close = vi.fn();
      onmessage: any = null;
    },
  } as any;

  globalThis.WebSocket = globalThis.window.WebSocket as any;
  globalThis.BroadcastChannel = globalThis.window.BroadcastChannel as any;

  const cleanup = () => {
    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }

    if (originalWebSocket) {
      globalThis.WebSocket = originalWebSocket;
    } else {
      delete (globalThis as any).WebSocket;
    }

    if (originalBroadcastChannel) {
      globalThis.BroadcastChannel = originalBroadcastChannel;
    } else {
      delete (globalThis as any).BroadcastChannel;
    }
  };

  return { cleanup };
}

export function simulateServerEnvironment() {
  const originalWindow = globalThis.window;
  const originalWebSocket = globalThis.WebSocket;
  const originalBroadcastChannel = globalThis.BroadcastChannel;

  // Remove browser globals to simulate server environment
  delete (globalThis as any).window;
  delete (globalThis as any).WebSocket;
  delete (globalThis as any).BroadcastChannel;

  const cleanup = () => {
    if (originalWindow) {
      globalThis.window = originalWindow;
    }
    if (originalWebSocket) {
      globalThis.WebSocket = originalWebSocket;
    }
    if (originalBroadcastChannel) {
      globalThis.BroadcastChannel = originalBroadcastChannel;
    }
  };

  return { cleanup };
}
