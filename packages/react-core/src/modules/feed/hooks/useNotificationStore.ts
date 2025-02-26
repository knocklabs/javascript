import { Feed, type FeedStoreState } from "@knocklabs/client";

// A hook designed to create a `UseBoundStore` instance.
// We used to have to do some extra work to do this, but
// with zustand updated we can just use the feedClient.store
// directly.
function useCreateNotificationStore(feedClient: Feed) {
  return feedClient.store;
}

/**
 * Below we do some typing to specify that if a selector is provided,
 * the return type will be the type returned by the selector.
 *
 * This is important because the store state type is not always the same as the
 * return type of the selector.
 *
 */

type StateSelector<T, U> = (state: T) => U;
type FeedStoreStateSelector<T> = StateSelector<FeedStoreState, T>;

// Function overload for when no selector is provided
function useNotificationStore(feedClient: Feed): FeedStoreState;

// Function overload for when a selector is provided
function useNotificationStore<T>(
  feedClient: Feed,
  selector: FeedStoreStateSelector<T>,
): T;

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
function useNotificationStore<T>(
  feedClient: Feed,
  selector?: FeedStoreStateSelector<T>,
): T | FeedStoreState {
  const useStore = useCreateNotificationStore(feedClient);
  const storeState = useStore();
  return selector ? selector(storeState) : storeState;
}

export { useCreateNotificationStore };
export default useNotificationStore;
