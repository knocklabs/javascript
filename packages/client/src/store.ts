import {
  Observer,
  Subscription,
  Store as TanStackStore,
} from "@tanstack/store";

export type StoreUnsubscribe = (() => void) & Subscription;

/**
 * A TanStack store whose `subscribe` keeps returning an unsubscribe function,
 * as it did in @tanstack/store 0.7. The returned function also has the
 * `unsubscribe` method that @tanstack/react-store hooks call.
 */
export class Store<T> extends TanStackStore<T> {
  subscribe(
    observerOrFn: Observer<T> | ((value: T) => void),
  ): StoreUnsubscribe {
    const subscription = super.subscribe(observerOrFn);
    const unsubscribe = () => subscription.unsubscribe();
    return Object.assign(unsubscribe, { unsubscribe });
  }
}
