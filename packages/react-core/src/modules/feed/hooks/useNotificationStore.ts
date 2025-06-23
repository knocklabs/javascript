import { Feed, type FeedStoreState } from "@knocklabs/client";
import { type Store, useStore } from "@tanstack/react-store";

export type Selector<T> = (state: FeedStoreState) => T;

/**
 * Create a hook factory that provides access to the TanStack Store with optional selector support.
 * This pattern allows for flexible store access with or without selectors while maintaining
 * type safety. The selector can be passed either to useCreateNotificationStore or
 * useNotificationStore, with the latter taking precedence.
 */
function useCreateNotificationStore(feedClient: Feed) {
  return <T = FeedStoreState>(selector?: Selector<T>) => {
    // Keep selector optional for external use
    // useStore requires a selector so we'll pass in a default one when not provided
    return useStore(feedClient.store, selector ?? ((state) => state as T));
  };
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
function useNotificationStore(feedClient: Feed): FeedStoreState;
function useNotificationStore<T>(feedClient: Feed, selector: Selector<T>): T;
function useNotificationStore<T>(
  feedClient: Feed,
  selector?: Selector<T>,
): T | FeedStoreState {
  const useStoreLocal = useCreateNotificationStore(feedClient);
  return useStoreLocal(selector ?? ((state) => state as T));
}

export { useCreateNotificationStore };
export default useNotificationStore;
