import { Feed, type FeedStoreState } from "@knocklabs/client";
import { useStore, type StoreApi, type UseBoundStore } from "zustand";

// A hook designed to create a `UseBoundStore` instance.
// https://zustand.docs.pmnd.rs/guides/typescript#bounded-usestore-hook-for-vanilla-stores
function useCreateNotificationStore(feedClient: Feed): UseBoundStore<StoreApi<FeedStoreState>>;
function useCreateNotificationStore<T>(feedClient: Feed, selector: (state: FeedStoreState) => T): T;
function useCreateNotificationStore<T, U = T>(feedClient: Feed, selector?: (state: FeedStoreState) => U) {
  return useStore(feedClient.store, selector!)
}

/**
 * A hook used to access content within the notification store.
 *
 * A selector can be used to access a subset of the store state.
 *
 * @example
 *
 * ```ts
 * const { items, metadata } = useNotificationStore(feedClient, (state) => ({
 *   items: state.items,
 *   metadata: state.metadata,
 * }));
 * ```
 */

function useNotificationStore(feedClient: Feed): UseBoundStore<StoreApi<FeedStoreState>>;
function useNotificationStore<T>(feedClient: Feed, selector: (state: FeedStoreState) => T): T;
function useNotificationStore<T, U = T>(feedClient: Feed, selector?: (state: FeedStoreState) => U) {
  return useCreateNotificationStore(feedClient, selector!);
}

export { useCreateNotificationStore };
export default useNotificationStore;
