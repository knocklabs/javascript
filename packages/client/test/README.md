# Testing Guide for Knock Client

This directory contains all tests for the Knock JavaScript client. This guide will help you understand our testing patterns, utilities, and how to write effective tests.

## 📁 Test Structure

```
test/
├── README.md               # This guide
├── setup.ts                # Global test configuration
├── test-utils/             # Shared testing utilities
│   ├── fixtures.ts         # Test data generators
│   ├── mocks.ts            # Mock factories
│   └── property-testing.ts # Property-based testing tools
├── clients/                # Client-specific tests
│   ├── feed/               # Feed client tests
│   ├── messages/           # Messages client tests
│   ├── users/              # Users client tests
│   └── ...                 # Other client tests
├── knock.test.ts           # Main Knock class tests
├── api.test.ts             # API client tests
├── helpers.test.ts         # Utility functions tests
└── ...                     # Other core tests
```

## 🚀 Quick Start: Writing Your First Test

Here's a simple test to get you started:

```typescript
import { describe, expect, test } from "vitest";

import { createMockKnock } from "./test-utils/mocks";

describe("My Feature", () => {
  test("should do something", () => {
    const { knock } = createMockKnock();

    // Your test logic here
    expect(knock).toBeDefined();
  });
});
```

**Important:** Always add `` at the top of test files.

## 🛠 Test Utilities

### 1. Fixtures (`test-utils/fixtures.ts`)

Fixtures create realistic test data. Use them instead of manually creating objects.

**Feed Items:**

```typescript
import {
  createArchivedFeedItem,
  createMockFeedItem,
  createReadFeedItem,
  createUnreadFeedItem,
} from "./test-utils/fixtures";

// Create a basic feed item
const item = createMockFeedItem();

// Create specific states
const unreadItem = createUnreadFeedItem();
const readItem = createReadFeedItem({
  read_at: "2024-01-01T00:00:00Z",
});

// Create multiple items
const items = createMockFeedItems(5);
```

**Messages:**

```typescript
import {
  createMockMessage,
  createReadMessage,
  createUnreadMessage,
} from "./test-utils/fixtures";

const message = createMockMessage({
  id: "custom-id",
});
```

**Users:**

```typescript
import { createMockUser, createMockUsers } from "./test-utils/fixtures";

const user = createMockUser({ name: "John Doe" });
const users = createMockUsers(10);
```

**Complex Scenarios:**

```typescript
import {
  createBulkOperationScenario,
  createErrorRecoveryScenario,
  createUserJourneyScenario,
} from "./test-utils/fixtures";

// Pre-built realistic test scenarios
const scenario = createUserJourneyScenario();
```

### 2. Mocks (`test-utils/mocks.ts`)

Mocks handle external dependencies and API calls.

**Basic Setup:**

```typescript
import { authenticateKnock, createMockKnock } from "./test-utils/mocks";

test("my test", () => {
  const { knock, mockApiClient } = createMockKnock();

  // Authenticate if needed
  authenticateKnock(knock);

  // Your test logic
});
```

**API Mocking:**

```typescript
import {
  mockNetworkError,
  mockNetworkFailure,
  mockNetworkSuccess,
} from "./test-utils/mocks";

test("handles successful API call", async () => {
  const { knock, mockApiClient } = createMockKnock();

  // Mock successful response
  mockNetworkSuccess(mockApiClient, { data: "success" });

  // Test your code
});

test("handles API error", async () => {
  const { knock, mockApiClient } = createMockKnock();

  // Mock error response
  mockNetworkError(mockApiClient, 400, "Bad Request");

  // Test error handling
});

test("handles network failure", async () => {
  const { knock, mockApiClient } = createMockKnock();

  // Mock network failure
  mockNetworkFailure(mockApiClient, new Error("Network down"));

  // Test failure handling
});
```

**Feed Mocking:**

```typescript
import { createMockFeed } from "./test-utils/mocks";

test("feed operations", () => {
  const { feed, mockApiClient, mockSocketManager } = createMockFeed(
    "test-feed-id",
    { page_size: 25 },
  );

  // Test feed operations
});
```

### 3. Property Testing (`test-utils/property-testing.ts`)

Property testing helps find edge cases by testing with generated data.

```typescript
import {
  feedItemArbitrary,
  generators,
  property,
} from "./test-utils/property-testing";

test("property: all feed items should have valid IDs", async () => {
  const result = await property.forAll(
    feedItemArbitrary(),
    (item) => item.id.length > 0,
  );

  expect(result.success).toBe(true);
});

test("property: numbers are always positive", async () => {
  const result = await property.forAll(
    generators.number(1, 1000),
    (num) => num > 0,
  );

  expect(result.success).toBe(true);
});
```

## 📝 Testing Patterns

### 1. Test Organization

**Use descriptive describe blocks:**

```typescript
describe("Feed Client", () => {
  describe("Initialization", () => {
    test("creates feed with valid options", () => {
      // Test initialization
    });
  });

  describe("Data Operations", () => {
    test("fetches feed items successfully", () => {
      // Test data fetching
    });
  });

  describe("Error Handling", () => {
    test("handles network errors gracefully", () => {
      // Test error scenarios
    });
  });
});
```

### 2. Setup and Cleanup

**Use consistent setup:**

```typescript
import { afterEach, beforeEach, describe, test, vi } from "vitest";

describe("My Feature", () => {
  const getTestSetup = () => {
    const { knock, mockApiClient } = createMockKnock();
    authenticateKnock(knock);

    return {
      knock,
      mockApiClient,
      cleanup: () => vi.clearAllMocks(),
    };
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("my test", () => {
    const { knock, mockApiClient, cleanup } = getTestSetup();

    try {
      // Your test logic
    } finally {
      cleanup();
    }
  });
});
```

### 3. Async Testing

**Handle promises correctly:**

```typescript
test("async operation succeeds", async () => {
  const { knock, mockApiClient } = createMockKnock();

  mockNetworkSuccess(mockApiClient, { success: true });

  const result = await knock.someAsyncOperation();

  expect(result).toEqual({ success: true });
});

test("async operation fails", async () => {
  const { knock, mockApiClient } = createMockKnock();

  mockNetworkFailure(mockApiClient, new Error("Failed"));

  await expect(knock.someAsyncOperation()).rejects.toThrow("Failed");
});
```

### 4. State Testing

**Test different states:**

```typescript
test("handles unread items", () => {
  const items = [
    createUnreadFeedItem(),
    createReadFeedItem(),
    createUnreadFeedItem(),
  ];

  const unreadCount = items.filter((item) => !item.read_at).length;
  expect(unreadCount).toBe(2);
});
```

## 🎯 Testing Specific Clients

### Feed Client Tests

```typescript
import { createMockFeedItems } from "./test-utils/fixtures";
import { createMockFeed } from "./test-utils/mocks";

test("feed fetches items", async () => {
  const { feed, mockApiClient } = createMockFeed();
  const items = createMockFeedItems(5);

  mockNetworkSuccess(mockApiClient, {
    entries: items,
    page_info: { page_size: 50 },
  });

  await feed.fetch();

  expect(feed.store.items).toHaveLength(5);
});
```

### Messages Client Tests

```typescript
import { createMockMessage } from "./test-utils/fixtures";

test("messages client gets message", async () => {
  const { knock, mockApiClient } = createMockKnock();
  const message = createMockMessage();

  mockNetworkSuccess(mockApiClient, message);

  const result = await knock.messages.get(message.id);

  expect(result).toEqual(message);
});
```

### User Client Tests

```typescript
test("user client identifies user", async () => {
  const { knock, mockApiClient } = createMockKnock();

  mockNetworkSuccess(mockApiClient, { success: true });

  await knock.user.identify("user_123", { name: "John" });

  expect(mockApiClient.makeRequest).toHaveBeenCalledWith({
    method: "PUT",
    url: "/v1/users/user_123",
    data: { name: "John" },
  });
});
```

## 🧪 Advanced Testing

### Error Scenarios

```typescript
test("handles rate limiting", async () => {
  const { knock, mockApiClient } = createMockKnock();

  mockNetworkError(mockApiClient, 429, "Rate limited");

  await expect(knock.someOperation()).rejects.toThrow();
});

test("retries on network failure", async () => {
  const { knock, mockApiClient } = createMockKnock();

  // First call fails, second succeeds
  mockApiClient.makeRequest
    .mockRejectedValueOnce(new Error("Network error"))
    .mockResolvedValueOnce({ statusCode: "ok", body: { success: true } });

  const result = await knock.someRetryableOperation();

  expect(result).toEqual({ success: true });
  expect(mockApiClient.makeRequest).toHaveBeenCalledTimes(2);
});
```

### Performance Testing

```typescript
import { createLargeFeedDataset } from "./test-utils/fixtures";

test("handles large datasets efficiently", () => {
  const { items, metadata } = createLargeFeedDataset(10000);

  const startTime = performance.now();

  // Test operation
  const result = processLargeDataset(items);

  const endTime = performance.now();

  expect(result).toBeDefined();
  expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1s
});
```

## 🔧 Configuration

### Global Setup (`setup.ts`)

The setup file handles:

- Environment polyfills
- Console output suppression during tests
- Global error handling
- Browser API mocks (localStorage, sessionStorage)

You usually don't need to modify this file.

### Environment

All tests should run in Node environment:

```typescript

```

## 🚨 Common Issues & Solutions

### 1. Unhandled Promise Rejections

**Problem:** Tests fail with unhandled promise rejections.

**Solution:** Always handle promises properly:

```typescript
// ❌ Bad
test("test", () => {
  someAsyncFunction(); // Promise not handled
});

// ✅ Good
test("test", async () => {
  await someAsyncFunction();
});

// ✅ Also good
test("test", () => {
  return someAsyncFunction();
});
```

### 2. Mock Cleanup

**Problem:** Mocks from one test affect another.

**Solution:** Always clean up:

```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

### 3. Authentication Required

**Problem:** Tests fail because client isn't authenticated.

**Solution:** Use `authenticateKnock`:

```typescript
test("authenticated operation", () => {
  const { knock } = createMockKnock();
  authenticateKnock(knock); // Add this line

  // Now test authenticated operations
});
```

### 4. Network Mocking

**Problem:** Real network calls in tests.

**Solution:** Always mock network calls:

```typescript
test("API operation", async () => {
  const { knock, mockApiClient } = createMockKnock();

  // Mock the expected response
  mockNetworkSuccess(mockApiClient, expectedData);

  const result = await knock.apiOperation();

  expect(result).toEqual(expectedData);
});
```

## 📚 Examples

### Complete Test File Example

```typescript
import { afterEach, describe, expect, test, vi } from "vitest";

import { createMockFeedItem } from "./test-utils/fixtures";
import {
  authenticateKnock,
  createMockKnock,
  mockNetworkSuccess,
} from "./test-utils/mocks";

describe("My Feature", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Operations", () => {
    test("performs basic operation", () => {
      const { knock } = createMockKnock();

      expect(knock).toBeDefined();
    });
  });

  describe("Authenticated Operations", () => {
    test("performs authenticated operation", async () => {
      const { knock, mockApiClient } = createMockKnock();
      authenticateKnock(knock);

      const expectedData = { success: true };
      mockNetworkSuccess(mockApiClient, expectedData);

      const result = await knock.authenticatedOperation();

      expect(result).toEqual(expectedData);
    });
  });

  describe("Data Operations", () => {
    test("processes feed item", () => {
      const item = createMockFeedItem({
        read_at: null, // Unread item
      });

      const result = processItem(item);

      expect(result.isUnread).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("handles errors gracefully", async () => {
      const { knock, mockApiClient } = createMockKnock();

      mockApiClient.makeRequest.mockRejectedValue(new Error("API Error"));

      await expect(knock.faultyOperation()).rejects.toThrow("API Error");
    });
  });
});
```

## 🎉 You're Ready!

With this guide and the provided utilities, you should be able to write comprehensive tests for any part of the Knock client. Remember:

1. **Use the test utilities** - they handle the complex setup for you
2. **Follow the patterns** - consistent structure makes tests easier to understand
3. **Test both success and failure cases** - robust testing catches more bugs
4. **Clean up after yourself** - prevent test pollution

Happy testing! 🧪
