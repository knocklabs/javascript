import { Store } from "@tanstack/react-store";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStore } from "../../src";

describe("useStore", () => {
  it("does not re-render when the selector returns a shallow-equal object", () => {
    const store = new Store({ a: 1, b: 1 });
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useStore(store, (state) => ({ a: state.a }));
    });

    expect(renderCount).toBe(1);

    // `b` is not selected, so the selected `{ a: 1 }` is shallow-equal to the
    // previous one and the component must not re-render.
    act(() => store.setState((state) => ({ ...state, b: 2 })));
    expect(renderCount).toBe(1);

    act(() => store.setState((state) => ({ ...state, a: 2 })));
    expect(renderCount).toBe(2);
    expect(result.current).toEqual({ a: 2 });
  });

  it("works with a store whose subscribe returns an unsubscribe function", () => {
    let state = { a: 1 };
    const listeners = new Set<() => void>();
    const unsubscribe = vi.fn();
    const store = {
      get state() {
        return state;
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          unsubscribe();
          listeners.delete(listener);
        };
      },
    };

    const { result, unmount } = renderHook(() =>
      useStore(store, (s) => s.a),
    );

    act(() => {
      state = { a: 2 };
      listeners.forEach((listener) => listener());
    });
    expect(result.current).toBe(2);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("uses the compare function when one is given", () => {
    const store = new Store({ a: 1, b: 1 });
    let renderCount = 0;

    renderHook(() => {
      renderCount++;
      return useStore(
        store,
        (state) => ({ a: state.a }),
        (prev, next) => prev === next,
      );
    });

    act(() => store.setState((state) => ({ ...state, b: 2 })));
    expect(renderCount).toBe(2);
  });
});
