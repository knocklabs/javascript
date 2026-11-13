import { shallow, useSelector } from "@tanstack/react-store";

type StoreSource<T> = {
  get: () => T;
  subscribe: (listener: (value: T) => void) => { unsubscribe: () => void };
};

/**
 * Subscribes to a TanStack store (or atom) and returns the selected slice of
 * its state.
 *
 * This wraps `useSelector` from `@tanstack/react-store`, but compares selected
 * values with `shallow` by default. `@tanstack/react-store` before 0.11 always
 * used `shallow`; since 0.11 the default is `===`. Without `shallow`, a
 * selector that returns a new object or array re-renders the component on
 * every store update.
 *
 * @example
 * ```ts
 * const { guides } = useStore(client.store, (state) => ({
 *   guides: state.guides,
 * }));
 * ```
 */
export function useStore<TSource, TSelected = NoInfer<TSource>>(
  source: StoreSource<TSource>,
  selector?: (snapshot: TSource) => TSelected,
  compare: (a: TSelected, b: TSelected) => boolean = shallow,
): TSelected {
  return useSelector(source, selector, { compare });
}

export default useStore;
