import { shallow, useSelector } from "@tanstack/react-store";
import { useMemo } from "react";

type Unsubscribe = (() => void) | { unsubscribe: () => void };

type StoreSource<T> = {
  readonly state: T;
  subscribe: (listener: () => void) => Unsubscribe;
};

/**
 * Subscribes to a store and returns the selected slice of its state.
 *
 * This wraps `useSelector` from `@tanstack/react-store`, but compares selected
 * values with `shallow` by default. `@tanstack/react-store` before 0.9 always
 * used `shallow`; since 0.9 the default is `===`. Without `shallow`, a
 * selector that returns a new object or array re-renders the component on
 * every store update.
 *
 * It accepts stores whose `subscribe()` returns an unsubscribe function, like
 * the stores on `@knocklabs/client`, as well as `@tanstack/store` 0.9+ stores,
 * which return `{ unsubscribe }`.
 *
 * @example
 * ```ts
 * const { guides } = useStore(client.store, (state) => ({
 *   guides: state.guides,
 * }));
 * ```
 */
export const useStore = <TSource, TSelected = NoInfer<TSource>>(
  source: StoreSource<TSource>,
  selector?: (snapshot: TSource) => TSelected,
  compare: (a: TSelected, b: TSelected) => boolean = shallow,
): TSelected => {
  const selectionSource = useMemo(
    () => ({
      get: () => source.state,
      subscribe: (listener: (value: TSource) => void) => {
        const unsubscribe = source.subscribe(() => listener(source.state));
        return typeof unsubscribe === "function"
          ? { unsubscribe }
          : unsubscribe;
      },
    }),
    [source],
  );

  return useSelector(selectionSource, selector, { compare });
};
