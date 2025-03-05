import { Feed, type FeedStoreState } from "@knocklabs/client";
import { useStore, type StoreApi, type UseBoundStore } from "zustand";

export type Selector<T> = (state: FeedStoreState) => T;

/**
 * Access a Bounded Store instance by converting our vanilla store to a UseBoundStore
 * https://zustand.docs.pmnd.rs/guides/typescript#bounded-usestore-hook-for-vanilla-stores
 * Allow passing a selector down from useCreateNotificationStore OR useNotificationStore
 * We'll favor the the one passed later outside of useCreateNotificationStore instantiation
 */
function useCreateNotificationStore<T>(
  feedClient: Feed
): UseBoundStore<StoreApi<FeedStoreState>> {
  // Keep selector optional for external use
  // useStore requires a selector so we'll pass in a default one when not provided
  const storeHook = (selector?: Selector<T>) => useStore(feedClient.store, selector ?? ((state) => state as T));
  return storeHook as UseBoundStore<StoreApi<FeedStoreState>>;
}

/**
 * A hook used to access content within the notification store.
 *
 * @example
 *
 * ```ts
 * const { items, metadata } = useNotificationStore(feedClient);
 * ```
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
function useNotificationStore(
  feedClient: Feed,
): FeedStoreState;
function useNotificationStore<T>(
  feedClient: Feed,
  selector: Selector<T>,
): T;
function useNotificationStore<T>(
  feedClient: Feed,
  selector?: Selector<T>,
): T | FeedStoreState {
  const useStoreLocal = useCreateNotificationStore(feedClient);
  return useStoreLocal(selector ?? ((state) => state as T));
}

export { useCreateNotificationStore };
export default useNotificationStore;
