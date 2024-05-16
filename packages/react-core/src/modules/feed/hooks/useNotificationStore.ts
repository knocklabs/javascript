import { Feed, FeedStoreState } from "@knocklabs/client";
import { useEffect, useLayoutEffect, useMemo, useReducer } from "react";
import type { DispatchWithoutAction, Reducer } from "react";
import type {
  EqualityChecker,
  StateSelector,
  StoreApi,
  UseBoundStore,
} from "zustand";

// For server-side rendering: https://github.com/pmndrs/zustand/pull/34
// Deno support: https://github.com/pmndrs/zustand/issues/347
const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

function useNotificationStore<TState extends FeedStoreState>(
  feedClient: Feed,
  selector: StateSelector<TState, StateSlice> = feedClient.getState as any,
): UseBoundStore<FeedStoreState, StoreApi<FeedStoreState>> {
  const { store } = feedClient;

  const useStore: any = <StateSlice>(
    selector: StateSelector<TState, StateSlice>,
    equalityFn: EqualityChecker<StateSlice> = Object.is,
  ) => {
    const state = store.getState();

    const slice = useMemo(() => selector(state), [state, selector]);
    const [[sliceFromReducer, storeFromReducer], rerender] = useReducer<
      Reducer<
        readonly [StateSlice, StoreApi<FeedStoreState>],
        boolean | undefined
      >,
      undefined
    >(
      (prev, fromSelf?: boolean) => {
        if (fromSelf) {
          return [slice, store];
        }
        const nextState = store.getState();
        if (Object.is(state, nextState) && prev[1] === store) {
          return prev;
        }
        const nextSlice = selector(nextState);
        if (areEqual(prev[0], nextSlice) && prev[1] === store) {
          return prev;
        }
        return [nextSlice, store];
      },
      undefined,
      () => [slice, store],
    );

    useIsomorphicLayoutEffect(() => {
      const unsubscribe = store.subscribe(rerender as DispatchWithoutAction);
      (rerender as DispatchWithoutAction)();
      return unsubscribe;
    }, [store]);

    if (storeFromReducer !== store) {
      rerender(true);
      return slice as any;
    }

    return sliceFromReducer as any;
  };

  return useStore;
}

export default useNotificationStore;
