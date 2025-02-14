import { Feed, FeedStoreState } from "@knocklabs/client";
import * as React from "react";
import type { DispatchWithoutAction } from "react";
import { create } from "zustand";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// A hook designed to create a `UseBoundStore` instance
function useCreateNotificationStore(feedClient: Feed) {
  const useStore = React.useMemo(
    () => create(() => feedClient.store.getState()),
    [feedClient],
  );

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

  return useStore;
}

// A hook used to access content *within* the notification store
function useNotificationStore<T = FeedStoreState>(
  feedClient: Feed,
  selector?: (state: FeedStoreState) => T
) {
  const useStore = useCreateNotificationStore(feedClient);
  return useStore(selector ?? ((state) => state as T));
}

export { useCreateNotificationStore };
export default useNotificationStore;
