import { describe, expect, test, vi } from "vitest";

import { Store } from "../src/store";

describe("Store", () => {
  test("calls listeners with the previous and current state", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();

    store.subscribe(listener);
    store.setState((state) => ({ count: state.count + 1 }));

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      prevVal: { count: 0 },
      currentVal: { count: 1 },
    });
  });

  test("subscribe returns a function that stops notifying the listener", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  test("the returned function also stops the listener through `unsubscribe`", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();

    store.subscribe(listener).unsubscribe();
    store.setState({ count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  test("subscribe works when called unbound", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();
    const { subscribe } = store;

    const unsubscribe = subscribe(listener);
    store.setState({ count: 1 });
    unsubscribe();
    store.setState({ count: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("setState accepts a state value as well as an updater function", () => {
    const store = new Store({ count: 0 });

    store.setState({ count: 5 });
    expect(store.state).toEqual({ count: 5 });

    store.setState((state) => ({ count: state.count * 2 }));
    expect(store.state).toEqual({ count: 10 });
  });

  test("tracks prevState and the subscribed listeners", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    expect(store.listeners.has(listener)).toBe(true);

    store.setState({ count: 1 });
    expect(store.prevState).toEqual({ count: 0 });

    unsubscribe();
    expect(store.listeners.has(listener)).toBe(false);
  });
});
