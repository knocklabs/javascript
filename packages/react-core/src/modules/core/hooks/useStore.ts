import { Store, useStore as useTanStackStore } from "@tanstack/react-store";
import { useMemo } from "react";

type SubscribableStore<TState> = {
  state: TState;
  subscribe: (listener: () => void) => () => void;
};

/**
 * `useStore` from @tanstack/react-store for Knock client stores. It calls
 * `subscribe` on the store itself, because @tanstack/react-store 0.7 calls it
 * unbound, which breaks the `subscribe` method of @tanstack/store 0.11 stores.
 */
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: SubscribableStore<TState>,
  selector?: (state: NoInfer<TState>) => TSelected,
): TSelected {
  const source = useMemo(
    () => ({
      get state() {
        return store.state;
      },
      subscribe: (listener: () => void) => store.subscribe(listener),
    }),
    [store],
  );

  return useTanStackStore(source as unknown as Store<TState>, selector);
}
