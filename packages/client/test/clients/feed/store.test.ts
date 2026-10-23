import { describe, expect, test, vi } from "vitest";

import type {
  FeedItem,
  FeedMetadata,
} from "../../../src/clients/feed/interfaces";
import createStore, {
  initialStoreState,
} from "../../../src/clients/feed/store";
import { NetworkStatus } from "../../../src/networkStatus";

describe("feed store", () => {
  describe("createStore", () => {
    test("initializes with default state", () => {
      const store = createStore();
      const state = store.getState();

      // Check only the data properties, not the methods
      expect(state.items).toEqual([]);
      expect(state.metadata).toEqual({
        total_count: 0,
        unread_count: 0,
        unseen_count: 0,
      });
      expect(state.pageInfo).toEqual({
        before: null,
        after: null,
        page_size: 50,
      });
      expect(state.networkStatus).toBe(NetworkStatus.ready);
      expect(state.loading).toBe(false);

      // Verify that store methods exist
      expect(typeof state.setNetworkStatus).toBe("function");
      expect(typeof state.setResult).toBe("function");
      expect(typeof state.setMetadata).toBe("function");
      expect(typeof state.resetStore).toBe("function");
      expect(typeof state.setItemAttrs).toBe("function");
    });
    test("getInitialState returns the initial state", () => {
      const store = createStore();
      const initialState = store.getInitialState();

      expect(initialState).toEqual(initialStoreState);
    });
    test("subscribe calls the listener with the current state", () => {
      const store = createStore();
      const listener = vi.fn();

      store.subscribe((state) => {
        listener(state);
      });

      store.setState(initialStoreState);

      expect(listener).toHaveBeenCalledWith(initialStoreState);
    });
  });

  describe("setNetworkStatus", () => {
    test("sets network status and loading state", () => {
      const store = createStore();

      store.getState().setNetworkStatus(NetworkStatus.loading);

      const state = store.getState();
      expect(state.networkStatus).toBe(NetworkStatus.loading);
      expect(state.loading).toBe(true);
    });

    test("sets loading to false for non-loading states", () => {
      const store = createStore();

      store.getState().setNetworkStatus(NetworkStatus.ready);

      const state = store.getState();
      expect(state.networkStatus).toBe(NetworkStatus.ready);
      expect(state.loading).toBe(false);
    });

    test("handles error status", () => {
      const store = createStore();

      store.getState().setNetworkStatus(NetworkStatus.error);

      const state = store.getState();
      expect(state.networkStatus).toBe(NetworkStatus.error);
      expect(state.loading).toBe(false);
    });
  });

  describe("setResult", () => {
    const mockItems: FeedItem[] = [
      {
        id: "1",
        __cursor: "cursor_1",
        activities: [],
        actors: [],
        blocks: [],
        archived_at: null,
        inserted_at: "2023-01-02T00:00:00Z",
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: { key: "test", version_id: "v1", categories: [] },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: "2023-01-02T00:00:00Z",
        data: null,
      },
      {
        id: "2",
        __cursor: "cursor_2",
        activities: [],
        actors: [],
        blocks: [],
        archived_at: null,
        inserted_at: "2023-01-01T00:00:00Z",
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: { key: "test", version_id: "v1", categories: [] },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: "2023-01-01T00:00:00Z",
        data: null,
      },
    ];

    const mockMetadata: FeedMetadata = {
      total_count: 2,
      unread_count: 1,
      unseen_count: 1,
    };

    const mockPageInfo = {
      before: "cursor_0",
      after: "cursor_2",
      page_size: 50,
    };

    test("sets result with default options", () => {
      const store = createStore();

      store.getState().setResult({
        entries: mockItems,
        meta: mockMetadata,
        page_info: mockPageInfo,
      });

      const state = store.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items[0]!.id).toBe("1"); // Should be sorted by inserted_at desc
      expect(state.items[1]!.id).toBe("2");
      expect(state.metadata).toEqual(mockMetadata);
      expect(state.pageInfo).toEqual(mockPageInfo);
      expect(state.loading).toBe(false);
      expect(state.networkStatus).toBe(NetworkStatus.ready);
    });

    test("appends items when shouldAppend is true", () => {
      const store = createStore();

      // Set initial items
      store.getState().setResult({
        entries: [mockItems[0]!],
        meta: mockMetadata,
        page_info: mockPageInfo,
      });

      // Append more items
      store.getState().setResult(
        {
          entries: [mockItems[1]!],
          meta: mockMetadata,
          page_info: mockPageInfo,
        },
        { shouldAppend: true, shouldSetPage: true },
      );

      const state = store.getState();
      expect(state.items).toHaveLength(2);
      expect(state.items[0]!.id).toBe("1"); // Should be sorted
      expect(state.items[1]!.id).toBe("2");
    });

    test("does not set page info when shouldSetPage is false", () => {
      const store = createStore();

      const originalPageInfo = store.getState().pageInfo;

      store.getState().setResult(
        {
          entries: mockItems,
          meta: mockMetadata,
          page_info: mockPageInfo,
        },
        { shouldAppend: false, shouldSetPage: false },
      );

      const state = store.getState();
      expect(state.pageInfo).toEqual(originalPageInfo);
      expect(state.items).toHaveLength(2);
    });

    test("handles duplicate items during append", () => {
      const store = createStore();

      // Set initial items
      store.getState().setResult({
        entries: mockItems,
        meta: mockMetadata,
        page_info: mockPageInfo,
      });

      // Append duplicate item
      store.getState().setResult(
        {
          entries: [mockItems[0]!], // Duplicate item
          meta: mockMetadata,
          page_info: mockPageInfo,
        },
        { shouldAppend: true, shouldSetPage: true },
      );

      const state = store.getState();
      expect(state.items).toHaveLength(2); // Should deduplicate
    });
  });

  describe("setMetadata", () => {
    test("updates metadata", () => {
      const store = createStore();

      const newMetadata: FeedMetadata = {
        total_count: 5,
        unread_count: 3,
        unseen_count: 2,
      };

      store.getState().setMetadata(newMetadata);

      const state = store.getState();
      expect(state.metadata).toEqual(newMetadata);
    });
  });

  describe("resetStore", () => {
    test("resets to initial state with default metadata", () => {
      const store = createStore();

      // Modify the store first
      store.getState().setResult({
        entries: [
          {
            id: "test",
            __cursor: "cursor_test",
            activities: [],
            actors: [],
            blocks: [],
            archived_at: null,
            inserted_at: "2023-01-01T00:00:00Z",
            read_at: null,
            seen_at: null,
            clicked_at: null,
            interacted_at: null,
            link_clicked_at: null,
            source: { key: "test", version_id: "v1", categories: [] },
            tenant: null,
            total_activities: 0,
            total_actors: 0,
            updated_at: "2023-01-01T00:00:00Z",
            data: null,
          },
        ],
        meta: { total_count: 1, unread_count: 1, unseen_count: 1 },
        page_info: { before: "test", after: "test", page_size: 10 },
      });

      store.getState().resetStore();

      const state = store.getState();
      expect(state.items).toEqual([]);
      expect(state.metadata).toEqual({
        total_count: 0,
        unread_count: 0,
        unseen_count: 0,
      });
      expect(state.pageInfo).toEqual({
        before: null,
        after: null,
        page_size: 50,
      });
    });

    test("resets to initial state with custom metadata", () => {
      const store = createStore();

      const customMetadata: FeedMetadata = {
        total_count: 10,
        unread_count: 5,
        unseen_count: 3,
      };

      store.getState().resetStore(customMetadata);

      const state = store.getState();
      expect(state.items).toEqual([]);
      expect(state.metadata).toEqual(customMetadata);
    });

    test("preserves function implementations when resetting store", () => {
      const store = createStore();

      // Capture original function references
      const {
        setResult: originalSetResult,
        setMetadata: originalSetMetadata,
        setNetworkStatus: originalSetNetworkStatus,
        resetStore: originalResetStore,
        setItemAttrs: originalSetItemAttrs,
      } = store.getState();

      // Perform a reset
      store.getState().resetStore();

      // Obtain the state again after the reset
      const {
        setResult,
        setMetadata,
        setNetworkStatus,
        resetStore: newResetStore,
        setItemAttrs,
      } = store.getState();

      // All function references should remain identical (not replaced by no-ops)
      expect(setResult).toBe(originalSetResult);
      expect(setMetadata).toBe(originalSetMetadata);
      expect(setNetworkStatus).toBe(originalSetNetworkStatus);
      expect(newResetStore).toBe(originalResetStore);
      expect(setItemAttrs).toBe(originalSetItemAttrs);

      // And the implementations should still work – e.g. setMetadata should mutate state
      const updatedMetadata: FeedMetadata = {
        total_count: 42,
        unread_count: 21,
        unseen_count: 13,
      };
      setMetadata(updatedMetadata);

      expect(store.getState().metadata).toEqual(updatedMetadata);
    });
  });

  describe("setItemAttrs", () => {
    test("updates attributes for specified items", () => {
      const store = createStore();

      const mockItems: FeedItem[] = [
        {
          id: "1",
          __cursor: "cursor_1",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-01T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-01T00:00:00Z",
          data: null,
        },
        {
          id: "2",
          __cursor: "cursor_2",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-02T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-02T00:00:00Z",
          data: null,
        },
      ];

      // Set initial items
      store.getState().setResult({
        entries: mockItems,
        meta: { total_count: 2, unread_count: 2, unseen_count: 2 },
        page_info: { before: null, after: null, page_size: 50 },
      });

      // Update attributes for specific items
      const now = new Date().toISOString();
      store.getState().setItemAttrs(["1"], { read_at: now, seen_at: now });

      const state = store.getState();
      const updatedItem = state.items.find((item) => item.id === "1");
      const unchangedItem = state.items.find((item) => item.id === "2");

      expect(updatedItem!.read_at).toBe(now);
      expect(updatedItem!.seen_at).toBe(now);
      expect(unchangedItem!.read_at).toBeNull();
      expect(unchangedItem!.seen_at).toBeNull();
    });

    test("updates multiple items", () => {
      const store = createStore();

      const mockItems: FeedItem[] = [
        {
          id: "1",
          __cursor: "cursor_1",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-01T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-01T00:00:00Z",
          data: null,
        },
        {
          id: "2",
          __cursor: "cursor_2",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-02T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-02T00:00:00Z",
          data: null,
        },
      ];

      // Set initial items
      store.getState().setResult({
        entries: mockItems,
        meta: { total_count: 2, unread_count: 2, unseen_count: 2 },
        page_info: { before: null, after: null, page_size: 50 },
      });

      // Update attributes for multiple items
      const now = new Date().toISOString();
      store.getState().setItemAttrs(["1", "2"], { archived_at: now });

      const state = store.getState();
      expect(state.items[0]!.archived_at).toBe(now);
      expect(state.items[1]!.archived_at).toBe(now);
    });

    test("does not update items not in the list", () => {
      const store = createStore();

      const mockItem: FeedItem = {
        id: "1",
        __cursor: "cursor_1",
        activities: [],
        actors: [],
        blocks: [],
        archived_at: null,
        inserted_at: "2023-01-01T00:00:00Z",
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: { key: "test", version_id: "v1", categories: [] },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: "2023-01-01T00:00:00Z",
        data: null,
      };

      // Set initial item
      store.getState().setResult({
        entries: [mockItem],
        meta: { total_count: 1, unread_count: 1, unseen_count: 1 },
        page_info: { before: null, after: null, page_size: 50 },
      });

      // Try to update non-existent item
      const now = new Date().toISOString();
      store.getState().setItemAttrs(["nonexistent"], { read_at: now });

      const state = store.getState();
      expect(state.items[0]!.read_at).toBeNull(); // Should remain unchanged
    });
  });
});
