import { Store as TanstackStore } from "@tanstack/store";

export type StoreListener<TState> = (event: {
  prevVal: TState;
  currentVal: TState;
}) => void;

/**
 * Ends a subscription. Call it directly, as with `@tanstack/store` 0.7, or
 * call its `unsubscribe` property, which `@tanstack/react-store` 0.9 and
 * later expect.
 */
export type StoreUnsubscribe = (() => void) & { unsubscribe: () => void };

type StateUpdater<TState> = (prevState: TState) => TState;

const isStateUpdater = <TState>(
  updater: TState | StateUpdater<TState>,
): updater is StateUpdater<TState> => typeof updater === "function";

/**
 * A store with the `@tanstack/store` 0.7 API, built on `@tanstack/store` 0.11.
 *
 * `knock.authStore`, `KnockGuideClient.store`, and `FeedStore.store` are
 * public, and apps and older `@knocklabs/react-core` versions call them with
 * the 0.7 API. In 0.11, `subscribe()` returns `{ unsubscribe }` instead of a
 * function, listeners receive the new state instead of
 * `{ prevVal, currentVal }`, and `prevState` and `listeners` are gone. This
 * class keeps the 0.7 behavior so upgrading is not a breaking change.
 */
export class Store<TState> {
  readonly listeners = new Set<StoreListener<TState>>();
  prevState: TState;
  private readonly store: TanstackStore<TState>;

  constructor(initialState: TState) {
    this.store = new TanstackStore<TState>(initialState);
    this.prevState = initialState;
  }

  get state(): TState {
    return this.store.state;
  }

  setState(updater: TState | StateUpdater<TState>): void {
    this.prevState = this.store.state;
    this.store.setState((prevState) =>
      isStateUpdater(updater) ? updater(prevState) : updater,
    );
  }

  // An arrow function, as in 0.7, so it still works when passed around
  // unbound. `@tanstack/react-store` 0.7 passes `store.subscribe` to React.
  subscribe = (listener: StoreListener<TState>): StoreUnsubscribe => {
    this.listeners.add(listener);
    const subscription = this.store.subscribe((currentVal) =>
      listener({ prevVal: this.prevState, currentVal }),
    );
    const unsubscribe = () => {
      subscription.unsubscribe();
      this.listeners.delete(listener);
    };
    return Object.assign(unsubscribe, { unsubscribe });
  };
}
