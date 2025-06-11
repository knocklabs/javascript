import Feed from "../../src/clients/feed/feed";
import type { FeedItem, FeedMetadata } from "../../src/clients/feed/interfaces";

import { createMockFeedItem, createMockFeedMetadata } from "./fixtures";

export interface Arbitrary<T> {
  generate(): T;
  sample(count: number): T[];
}

// Basic generators
export const generators = {
  string: (minLength = 1, maxLength = 20): Arbitrary<string> => ({
    generate: () => {
      const length =
        Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      return Math.random()
        .toString(36)
        .substring(2, 2 + length);
    },
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.string(minLength, maxLength).generate(),
      ),
  }),

  number: (min = 0, max = 1000): Arbitrary<number> => ({
    generate: () => Math.floor(Math.random() * (max - min + 1)) + min,
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.number(min, max).generate(),
      ),
  }),

  boolean: (): Arbitrary<boolean> => ({
    generate: () => Math.random() < 0.5,
    sample: (count: number) =>
      Array.from({ length: count }, () => generators.boolean().generate()),
  }),

  oneOf: <T>(...options: T[]): Arbitrary<T> => ({
    generate: () => {
      if (options.length === 0)
        throw new Error("oneOf requires at least one option");
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex]!; // Use non-null assertion since we verified length > 0
    },
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.oneOf(...options).generate(),
      ),
  }),

  nullable: <T>(arbitrary: Arbitrary<T>): Arbitrary<T | null> => ({
    generate: () => (Math.random() < 0.3 ? null : arbitrary.generate()),
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.nullable(arbitrary).generate(),
      ),
  }),

  date: (startYear = 2020, endYear = 2024): Arbitrary<Date> => ({
    generate: () => {
      const start = new Date(startYear, 0, 1);
      const end = new Date(endYear, 11, 31);
      const randomTime =
        start.getTime() + Math.random() * (end.getTime() - start.getTime());
      return new Date(randomTime);
    },
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.date(startYear, endYear).generate(),
      ),
  }),

  isoString: (startYear = 2020, endYear = 2024): Arbitrary<string> => ({
    generate: () =>
      generators.date(startYear, endYear).generate().toISOString(),
    sample: (count: number) =>
      Array.from({ length: count }, () =>
        generators.isoString(startYear, endYear).generate(),
      ),
  }),
};

// FeedItem arbitrary generators
export const feedItemArbitrary = (): Arbitrary<FeedItem> => ({
  generate: () => {
    const baseItem = createMockFeedItem();
    const isRead = generators.boolean().generate();
    const isSeen = generators.boolean().generate();
    const isArchived = generators.boolean().generate();
    const isInteracted = generators.boolean().generate();

    return {
      ...baseItem,
      id: generators.string(8, 15).generate(),
      read_at: isRead ? generators.isoString().generate() : null,
      seen_at: isSeen ? generators.isoString().generate() : null,
      archived_at: isArchived ? generators.isoString().generate() : null,
      interacted_at: isInteracted ? generators.isoString().generate() : null,
      total_activities: generators.number(0, 10).generate(),
      total_actors: generators.number(0, 5).generate(),
    };
  },
  sample: (count: number) =>
    Array.from({ length: count }, () => feedItemArbitrary().generate()),
});

// Specialized feed item generators
export const unreadFeedItemArbitrary = (): Arbitrary<FeedItem> => ({
  generate: () => ({
    ...feedItemArbitrary().generate(),
    read_at: null,
    seen_at: generators.boolean().generate()
      ? generators.isoString().generate()
      : null,
  }),
  sample: (count: number) =>
    Array.from({ length: count }, () => unreadFeedItemArbitrary().generate()),
});

export const readFeedItemArbitrary = (): Arbitrary<FeedItem> => ({
  generate: () => ({
    ...feedItemArbitrary().generate(),
    read_at: generators.isoString().generate(),
    seen_at: generators.isoString().generate(),
  }),
  sample: (count: number) =>
    Array.from({ length: count }, () => readFeedItemArbitrary().generate()),
});

export const archivedFeedItemArbitrary = (): Arbitrary<FeedItem> => ({
  generate: () => ({
    ...feedItemArbitrary().generate(),
    archived_at: generators.isoString().generate(),
  }),
  sample: (count: number) =>
    Array.from({ length: count }, () => archivedFeedItemArbitrary().generate()),
});

// FeedMetadata arbitrary generator
export const feedMetadataArbitrary = (): Arbitrary<FeedMetadata> => ({
  generate: () => {
    const totalCount = generators.number(0, 1000).generate();
    const unreadCount = generators.number(0, totalCount).generate();
    const unseenCount = generators.number(0, totalCount).generate();

    return createMockFeedMetadata({
      total_count: totalCount,
      unread_count: unreadCount,
      unseen_count: unseenCount,
    });
  },
  sample: (count: number) =>
    Array.from({ length: count }, () => feedMetadataArbitrary().generate()),
});

// Property testing framework
export interface PropertyTest {
  forAll<T>(
    arbitrary: Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
  ): Promise<PropertyTestResult>;
  check(description: string): Promise<PropertyTestResult>;
}

export interface PropertyTestResult {
  success: boolean;
  counterExample?: unknown;
  numTests: number;
  description?: string;
}

export const property = {
  // Simple property testing implementation
  forAll: async <T>(
    arbitrary: Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    options: { numTests?: number; maxShrinks?: number } = {},
  ): Promise<PropertyTestResult> => {
    const numTests = options.numTests || 100;

    for (let i = 0; i < numTests; i++) {
      const value = arbitrary.generate();

      try {
        const result = await predicate(value);
        if (!result) {
          return {
            success: false,
            counterExample: value,
            numTests: i + 1,
          };
        }
      } catch (error) {
        return {
          success: false,
          counterExample: { value, error: (error as Error).message },
          numTests: i + 1,
        };
      }
    }

    return {
      success: true,
      numTests,
    };
  },
};

// Common property test patterns for Feed
export const feedProperties = {
  // Property: marking an item as read should always set read_at
  markAsReadSetsTimestamp: (feed: Feed) =>
    property.forAll(unreadFeedItemArbitrary(), async (item) => {
      await feed.markAsRead(item);
      const state = feed.getState();
      const updatedItem = state.items.find((i: FeedItem) => i.id === item.id);
      return updatedItem?.read_at !== null;
    }),

  // Property: marking an item as seen should always set seen_at
  markAsSeenSetsTimestamp: (feed: Feed) =>
    property.forAll(feedItemArbitrary(), async (item) => {
      await feed.markAsSeen(item);
      const state = feed.getState();
      const updatedItem = state.items.find((i: FeedItem) => i.id === item.id);
      return updatedItem?.seen_at !== null;
    }),

  // Property: archiving should always set archived_at
  markAsArchivedSetsTimestamp: (feed: Feed) =>
    property.forAll(feedItemArbitrary(), async (item) => {
      await feed.markAsArchived(item);
      const state = feed.getState();
      const updatedItem = state.items.find((i: FeedItem) => i.id === item.id);
      return updatedItem?.archived_at !== null;
    }),

  // Property: unread count should never be negative
  unreadCountNeverNegative: (feed: Feed) =>
    property.forAll(feedItemArbitrary(), async (item) => {
      await feed.markAsRead(item);
      const state = feed.getState();
      return state.metadata.unread_count >= 0;
    }),

  // Property: unseen count should never be negative
  unseenCountNeverNegative: (feed: Feed) =>
    property.forAll(feedItemArbitrary(), async (item) => {
      await feed.markAsSeen(item);
      const state = feed.getState();
      return state.metadata.unseen_count >= 0;
    }),

  // Property: total count should be consistent with items length
  totalCountConsistentWithItems: (feed: Feed) => {
    const state = feed.getState();
    return state.metadata.total_count >= state.items.length;
  },

  // Property: read items should also be seen (business rule)
  readItemsShouldBeSeen: (feed: Feed) => {
    const state = feed.getState();
    const readItems = state.items.filter(
      (item: FeedItem) => item.read_at !== null,
    );
    return readItems.every((item: FeedItem) => item.seen_at !== null);
  },
};

// Invariant testing utilities
export const invariants = {
  // Test that certain conditions always hold after operations
  checkInvariant: async <T>(
    setup: () => Promise<T>,
    operations: Array<(context: T) => Promise<void>>,
    invariant: (context: T) => boolean,
    description: string,
  ): Promise<PropertyTestResult> => {
    try {
      const context = await setup();

      // Apply all operations
      for (const operation of operations) {
        await operation(context);
      }

      // Check invariant
      const holds = invariant(context);

      return {
        success: holds,
        numTests: 1,
        description,
        counterExample: holds
          ? undefined
          : { context, operations: operations.length },
      };
    } catch (error) {
      return {
        success: false,
        numTests: 1,
        description,
        counterExample: { error: (error as Error).message },
      };
    }
  },

  // Test multiple scenarios
  checkInvariants: async <T>(
    setup: () => Promise<T>,
    operationSets: Array<Array<(context: T) => Promise<void>>>,
    invariant: (context: T) => boolean,
    description: string,
  ): Promise<PropertyTestResult> => {
    for (let i = 0; i < operationSets.length; i++) {
      const operations = operationSets[i];
      if (!operations) continue;

      const result = await invariants.checkInvariant(
        setup,
        operations,
        invariant,
        `${description} (scenario ${i + 1})`,
      );

      if (!result.success) {
        return {
          ...result,
          numTests: i + 1,
        };
      }
    }

    return {
      success: true,
      numTests: operationSets.length,
      description,
    };
  },
};

// Model-based testing utilities for state transitions
export const stateMachine = {
  // Define valid state transitions
  transitions: {
    unread: ["read", "seen", "archived"],
    read: ["unread", "archived"],
    seen: ["read", "archived"],
    archived: ["unarchived"],
    unarchived: ["read", "seen", "archived"],
  } as Record<string, string[]>,

  // Generate valid operation sequences
  generateOperationSequence: (
    maxLength = 10,
  ): Array<{ operation: string; state: string }> => {
    const sequence = [];
    let currentState = "unread";

    for (let i = 0; i < maxLength; i++) {
      const validTransitions = stateMachine.transitions[currentState] || [];
      if (validTransitions.length === 0) break;

      const nextState = generators.oneOf(...validTransitions).generate();
      sequence.push({ operation: `markAs${nextState}`, state: nextState });
      currentState = nextState;
    }

    return sequence;
  },

  // Test that all generated sequences are valid
  testValidSequences: async (
    feed: Feed,
    numSequences = 50,
  ): Promise<PropertyTestResult> => {
    for (let i = 0; i < numSequences; i++) {
      const sequence = stateMachine.generateOperationSequence();
      const item = feedItemArbitrary().generate();

      try {
        for (const step of sequence) {
          // Execute the operation - use type assertion with proper method lookup
          const method = (feed as unknown as Record<string, unknown>)[
            step.operation
          ];
          if (typeof method === "function") {
            await (method as (item: FeedItem) => Promise<unknown>).call(
              feed,
              item,
            );
          }
        }
      } catch (error) {
        return {
          success: false,
          counterExample: { sequence, error: (error as Error).message },
          numTests: i + 1,
        };
      }
    }

    return {
      success: true,
      numTests: numSequences,
    };
  },
};
