import { Feed, FeedStoreState } from "@knocklabs/client";
import * as React from "react";
import type { DispatchWithoutAction } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// A hook designed to create a `UseBoundStore` instance
function useCreateNotificationStore(feedClient: Feed) {

  // Warning: this is a hack that will cause any components downstream to re-render
  // as a result of the store updating.
  const [, forceUpdate] = React.useReducer((c) => c + 1, 0) as [
    never,
    () => void,
  ];

  useIsomorphicLayoutEffect(() => {
    const rerender = forceUpdate as DispatchWithoutAction;
    const unsubscribe = feedClient.store.subscribe(rerender);

    rerender();

    return unsubscribe;
  }, [feedClient]);

  return feedClient.store;
}

// Maintain type flexibility from older Zustand versions
// I don't know how important or "correct" this is, but it maintains functionality
// and typing from our older SDK versions.
type StateSelector<T, U> = (state: T) => U;
type FeedStoreStateSelector = StateSelector<FeedStoreState, FeedStoreState>;

// A hook used to access content *within* the notification store
function useNotificationStore(
  feedClient: Feed,
  selector?: FeedStoreStateSelector,
): FeedStoreState {
  const useStore = useCreateNotificationStore(feedClient);
  return selector ? selector(useStore()) : useStore();
}

export { useCreateNotificationStore };
export default useNotificationStore;
