import { faker } from "@faker-js/faker";
import type { PageInfo } from "@knocklabs/types";

import type {
  FeedClientOptions,
  FeedItem,
  FeedMetadata,
} from "../../src/clients/feed/interfaces";
import type { NotificationSource } from "../../src/clients/messages/interfaces";
import type { Message } from "../../src/clients/messages/interfaces";
import type { PreferenceSet } from "../../src/clients/preferences/interfaces";
import type { User } from "../../src/interfaces";
import { NetworkStatus } from "../../src/networkStatus";

// Base fixture for feed items with sensible defaults
export const createMockFeedItem = (
  overrides?: Partial<FeedItem>,
): FeedItem => ({
  __cursor: `cursor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  activities: [],
  actors: [],
  blocks: [],
  id: `msg_${Math.random().toString(36).substr(2, 9)}`,
  archived_at: null,
  inserted_at: new Date().toISOString(),
  read_at: null,
  seen_at: null,
  clicked_at: null,
  interacted_at: null,
  link_clicked_at: null,
  source: createMockNotificationSource(),
  tenant: null,
  total_activities: 1,
  total_actors: 1,
  updated_at: new Date().toISOString(),
  data: null,
  ...overrides,
});

// Create multiple feed items with different states
export const createMockFeedItems = (
  count: number,
  overrides?: Partial<FeedItem>[],
): FeedItem[] => {
  const items: FeedItem[] = [];
  for (let i = 0; i < count; i++) {
    const override = overrides?.[i] || {};
    items.push(createMockFeedItem(override));
  }
  return items;
};

// Specialized feed item creators for different states
export const createUnreadFeedItem = (overrides?: Partial<FeedItem>): FeedItem =>
  createMockFeedItem({
    read_at: null,
    seen_at: null,
    ...overrides,
  });

export const createReadFeedItem = (overrides?: Partial<FeedItem>): FeedItem =>
  createMockFeedItem({
    read_at: new Date().toISOString(),
    seen_at: new Date().toISOString(),
    ...overrides,
  });

export const createSeenButUnreadFeedItem = (
  overrides?: Partial<FeedItem>,
): FeedItem =>
  createMockFeedItem({
    read_at: null,
    seen_at: new Date().toISOString(),
    ...overrides,
  });

export const createArchivedFeedItem = (
  overrides?: Partial<FeedItem>,
): FeedItem =>
  createMockFeedItem({
    archived_at: new Date().toISOString(),
    ...overrides,
  });

export const createInteractedFeedItem = (
  overrides?: Partial<FeedItem>,
): FeedItem =>
  createMockFeedItem({
    read_at: new Date().toISOString(),
    seen_at: new Date().toISOString(),
    interacted_at: new Date().toISOString(),
    ...overrides,
  });

// Feed metadata fixtures
export const createMockFeedMetadata = (
  overrides?: Partial<FeedMetadata>,
): FeedMetadata => ({
  total_count: 10,
  unread_count: 5,
  unseen_count: 3,
  ...overrides,
});

// Feed page info fixtures
export const createMockPageInfo = (
  overrides?: Partial<PageInfo>,
): PageInfo => ({
  after: null,
  before: null,
  page_size: 50,
  ...overrides,
});

// Notification source fixtures
export const createMockNotificationSource = (
  overrides?: Partial<NotificationSource>,
): NotificationSource => ({
  key: `source_${Math.random().toString(36).substr(2, 9)}`,
  version_id: `version_${Math.random().toString(36).substr(2, 9)}`,
  categories: [],
  ...overrides,
});

// Feed options fixtures
export const createMockFeedOptions = (
  overrides?: Partial<FeedClientOptions>,
): FeedClientOptions => ({
  archived: "exclude",
  page_size: 50,
  ...overrides,
});

// Complete feed state fixtures
export const createMockFeedState = (overrides?: {
  items?: FeedItem[];
  metadata?: Partial<FeedMetadata>;
  pageInfo?: Partial<PageInfo>;
  networkStatus?: NetworkStatus;
}) => ({
  items: overrides?.items || createMockFeedItems(5),
  metadata: createMockFeedMetadata(overrides?.metadata),
  pageInfo: createMockPageInfo(overrides?.pageInfo),
  networkStatus: overrides?.networkStatus || NetworkStatus.ready,
});

// Large dataset fixtures for performance testing
export const createLargeFeedDataset = (
  itemCount: number = 1000,
): {
  items: FeedItem[];
  metadata: FeedMetadata;
} => ({
  items: createMockFeedItems(itemCount),
  metadata: createMockFeedMetadata({
    total_count: itemCount,
    unread_count: Math.floor(itemCount * 0.3),
    unseen_count: Math.floor(itemCount * 0.5),
  }),
});

// Mixed state dataset for complex scenarios
export const createMixedStateFeedDataset = (): {
  items: FeedItem[];
  metadata: FeedMetadata;
} => {
  const unreadItems = createMockFeedItems(
    5,
    Array(5).fill({ read_at: null, seen_at: null }),
  );
  const readItems = createMockFeedItems(
    3,
    Array(3).fill({
      read_at: new Date().toISOString(),
      seen_at: new Date().toISOString(),
    }),
  );
  const seenButUnreadItems = createMockFeedItems(
    2,
    Array(2).fill({
      read_at: null,
      seen_at: new Date().toISOString(),
    }),
  );
  const archivedItems = createMockFeedItems(
    2,
    Array(2).fill({
      archived_at: new Date().toISOString(),
    }),
  );

  const allItems = [
    ...unreadItems,
    ...readItems,
    ...seenButUnreadItems,
    ...archivedItems,
  ];

  return {
    items: allItems,
    metadata: createMockFeedMetadata({
      total_count: allItems.length,
      unread_count: unreadItems.length + seenButUnreadItems.length,
      unseen_count: unreadItems.length,
    }),
  };
};

// Socket event payloads
export const createMockSocketPayload = (event: string, data?: unknown) => ({
  event,
  metadata: createMockFeedMetadata(),
  data: data || {},
});

// Error scenarios
export const createNetworkErrorResponse = () => ({
  statusCode: "error" as const,
  error: "Network connection failed",
});

export const createRateLimitErrorResponse = () => ({
  statusCode: "error" as const,
  error: "Rate limit exceeded",
  retryAfter: 60000,
});

export const createValidationErrorResponse = () => ({
  statusCode: "error" as const,
  error: "Invalid request parameters",
  details: {
    field: "status",
    message: "Invalid status value",
  },
});

// Success responses
export const createSuccessfulFeedResponse = (
  items?: FeedItem[],
  metadata?: Partial<FeedMetadata>,
  pageInfo?: Partial<PageInfo>,
) => ({
  statusCode: "ok" as const,
  body: {
    entries: items || createMockFeedItems(5),
    meta: createMockFeedMetadata(metadata),
    page_info: createMockPageInfo(pageInfo),
  },
});

// Time-based fixtures for testing temporal behaviors
export const createTimestampedFeedItem = (minutesAgo: number): FeedItem => {
  const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
  return createMockFeedItem({
    inserted_at: timestamp,
    updated_at: timestamp,
  });
};

export const createTemporalFeedDataset = (): FeedItem[] => [
  createTimestampedFeedItem(1), // 1 minute ago
  createTimestampedFeedItem(10), // 10 minutes ago
  createTimestampedFeedItem(60), // 1 hour ago
  createTimestampedFeedItem(1440), // 1 day ago
  createTimestampedFeedItem(10080), // 1 week ago
];

/**
 * Message fixtures for testing Message Client
 */
export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: faker.string.uuid(),
    channel_id: faker.string.uuid(),
    recipient: {
      id: faker.string.uuid(),
      collection: "users",
    },
    actors: [],
    inserted_at: faker.date.recent().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    read_at: null,
    seen_at: null,
    archived_at: null,
    clicked_at: null,
    interacted_at: null,
    link_clicked_at: null,
    tenant: null,
    status: "sent",
    engagement_statuses: [],
    source: {
      key: faker.lorem.word(),
      version_id: faker.string.uuid(),
      categories: [],
    },
    data: null,
    metadata: {},
    ...overrides,
  };
}

export function createReadMessage(overrides: Partial<Message> = {}): Message {
  return createMockMessage({
    read_at: faker.date.recent().toISOString(),
    seen_at: faker.date.recent().toISOString(),
    ...overrides,
  });
}

export function createUnreadMessage(overrides: Partial<Message> = {}): Message {
  return createMockMessage({
    read_at: null,
    seen_at: null,
    ...overrides,
  });
}

export function createArchivedMessage(
  overrides: Partial<Message> = {},
): Message {
  return createMockMessage({
    archived_at: faker.date.recent().toISOString(),
    ...overrides,
  });
}

export function createInteractedMessage(
  overrides: Partial<Message> = {},
): Message {
  return createMockMessage({
    interacted_at: faker.date.recent().toISOString(),
    clicked_at: faker.date.recent().toISOString(),
    ...overrides,
  });
}

export function createMockMessages(
  count: number,
  options: {
    readPercentage?: number;
    archivedPercentage?: number;
    interactedPercentage?: number;
  } = {},
): Message[] {
  const {
    readPercentage = 0.6,
    archivedPercentage = 0.2,
    interactedPercentage = 0.3,
  } = options;

  return Array.from({ length: count }, (_) => {
    const isRead = Math.random() < readPercentage;
    const isArchived = Math.random() < archivedPercentage;
    const isInteracted = Math.random() < interactedPercentage;

    let message = createMockMessage();

    if (isRead) {
      message = createReadMessage(message);
    }
    if (isArchived) {
      message = createArchivedMessage(message);
    }
    if (isInteracted) {
      message = createInteractedMessage(message);
    }

    return message;
  });
}

/**
 * User fixtures for testing Users Client
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone_number: faker.phone.number(),
    avatar: faker.image.avatar(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    properties: {
      department: faker.commerce.department(),
      role: faker.person.jobTitle(),
    },
    ...overrides,
  };
}

export function createMockUsers(count: number): User[] {
  return Array.from({ length: count }, () => createMockUser());
}

export function createMockUserPreferences(
  overrides: Partial<PreferenceSet> = {},
): PreferenceSet {
  return {
    id: faker.string.uuid(),
    categories: {
      [faker.lorem.word()]: {
        channel_types: {
          email: true,
          in_app_feed: true,
          sms: false,
          push: true,
        },
      },
      [faker.lorem.word()]: {
        channel_types: {
          email: false,
          in_app_feed: true,
          sms: true,
          push: false,
        },
      },
    },
    workflows: {
      [faker.string.uuid()]: {
        channel_types: {
          email: true,
          in_app_feed: true,
          sms: false,
          push: true,
        },
      },
    },
    channel_types: {
      email: true,
      in_app_feed: true,
      sms: false,
      push: true,
    },
    ...overrides,
  };
}

/**
 * API Response fixtures
 */
export function createPaginatedResponse<T extends FeedItem | unknown>(
  items: T[],
  options: {
    pageSize?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  } = {},
) {
  const {
    pageSize = 50,
    hasNextPage = false,
    hasPreviousPage = false,
  } = options;

  // Only calculate metadata if items are FeedItems
  const isFeedItemArray =
    items.length > 0 &&
    items[0] &&
    typeof items[0] === "object" &&
    "read_at" in items[0];

  const metadata = isFeedItemArray
    ? createMockFeedMetadata({
        total_count: items.length,
        unread_count: (items as FeedItem[]).filter((item) => !item.read_at)
          .length,
        unseen_count: (items as FeedItem[]).filter((item) => !item.seen_at)
          .length,
      })
    : createMockFeedMetadata({
        total_count: items.length,
      });

  return {
    entries: items.slice(0, pageSize),
    meta: metadata,
    page_info: {
      after: hasNextPage ? faker.string.alphanumeric(20) : null,
      before: hasPreviousPage ? faker.string.alphanumeric(20) : null,
      page_size: pageSize,
    },
  };
}

/**
 * Error fixtures for testing error scenarios
 */
export function createApiError(
  type:
    | "network"
    | "rate-limit"
    | "validation"
    | "server"
    | "not-found" = "server",
  message?: string,
) {
  const errors = {
    network: {
      message: message || "Network request failed",
      code: "NETWORK_ERROR",
      status: 0,
    },
    "rate-limit": {
      message: message || "Rate limit exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      status: 429,
    },
    validation: {
      message: message || "Validation failed",
      code: "VALIDATION_ERROR",
      status: 400,
      details: {
        field: "Invalid field value",
      },
    },
    server: {
      message: message || "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    },
    "not-found": {
      message: message || "Resource not found",
      code: "NOT_FOUND",
      status: 404,
    },
  };

  return new Error(errors[type].message);
}

/**
 * Authentication fixtures
 */
export function createMockAuthToken(
  userId = faker.string.uuid(),
  expiresInSeconds = 3600,
) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return {
    token: `jwt_${faker.string.alphanumeric(40)}`,
    payload: {
      sub: userId,
      exp,
      iat: Math.floor(Date.now() / 1000),
    },
  };
}

/**
 * Test scenarios - collections of related test data
 */
export function createUserJourneyScenario() {
  const user = createMockUser();
  const messages = createMockMessages(10, {
    readPercentage: 0.4,
    archivedPercentage: 0.1,
    interactedPercentage: 0.2,
  });

  return {
    user,
    messages,
    unreadMessages: messages.filter((m) => !m.read_at),
    readMessages: messages.filter((m) => m.read_at),
    archivedMessages: messages.filter((m) => m.archived_at),
  };
}

export function createBulkOperationScenario(itemCount = 100) {
  const messages = createMockMessages(itemCount);
  const users = createMockUsers(Math.floor(itemCount / 10));

  return {
    messages,
    users,
    messageIds: messages.map((m) => m.id),
    userIds: users.map((u) => u.id),
  };
}

export function createErrorRecoveryScenario() {
  const failingMessage = createMockMessage();
  const successfulMessage = createMockMessage();

  return {
    failingMessage,
    successfulMessage,
    networkError: createApiError("network"),
    serverError: createApiError("server"),
    validationError: createApiError("validation"),
  };
}
