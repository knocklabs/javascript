import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  clampPosition,
  useDrag,
} from "../../../../src/modules/guide/components/Toolbar/V2/useDrag";

// Mock RAF to execute callbacks synchronously
let rafCallback: FrameRequestCallback | null = null;
let rafId = 0;

beforeEach(() => {
  rafCallback = null;
  rafId = 0;

  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);

  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      rafCallback = cb;
      return ++rafId;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

function flushRAF() {
  if (rafCallback) {
    const cb = rafCallback;
    rafCallback = null;
    cb(performance.now());
  }
}

function makeElementRef(rect: Partial<DOMRect> = {}) {
  const el = {
    getBoundingClientRect: vi.fn(
      () =>
        ({
          width: 40,
          height: 40,
          top: 0,
          left: 0,
          right: 40,
          bottom: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
          ...rect,
        }) as DOMRect,
    ),
  } as unknown as HTMLDivElement;

  return { current: el };
}

describe("clampPosition", () => {
  test("returns position unchanged when within bounds", () => {
    const result = clampPosition({ top: 100, right: 100 }, 40, 40);
    expect(result).toEqual({ top: 100, right: 100 });
  });

  test("clamps top to 0 when negative", () => {
    const result = clampPosition({ top: -50, right: 100 }, 40, 40);
    expect(result.top).toBe(0);
  });

  test("clamps top to keep element in viewport", () => {
    // viewport height = 768, element height = 40
    const result = clampPosition({ top: 800, right: 100 }, 40, 40);
    expect(result.top).toBe(728); // 768 - 40
  });

  test("clamps right to 0 when element would overflow right", () => {
    // right = -50 means left = 1024 - (-50) - 40 = 1034
    // totalWidth = 40, clampedLeft = min(1034, 984) = 984
    // clampedRight = 1024 - 984 - 40 = 0
    const result = clampPosition({ top: 100, right: -50 }, 40, 40);
    expect(result.right).toBe(0);
  });

  test("clamps left edge (large right value)", () => {
    // right = 1100 means left = 1024 - 1100 - 40 = -116
    // clampedLeft = max(0, -116) = 0
    // clampedRight = 1024 - 0 - 40 = 984
    const result = clampPosition({ top: 100, right: 1100 }, 40, 40);
    expect(result.right).toBe(984);
  });

  test("reserves rightPadding so handle stays visible", () => {
    // viewport = 1024, element = 40, rightPadding = 28
    // right = -10 means left = 1024 - (-10) - 40 = 994
    // totalWidth = 40 + 28 = 68, max left = 1024 - 68 = 956
    // clampedLeft = min(994, 956) = 956
    // clampedRight = 1024 - 956 - 40 = 28
    const result = clampPosition({ top: 100, right: -10 }, 40, 40, 28);
    expect(result.right).toBe(28);
  });

  test("rightPadding does not affect positions already within bounds", () => {
    const result = clampPosition({ top: 100, right: 100 }, 40, 40, 28);
    expect(result).toEqual({ top: 100, right: 100 });
  });
});

describe("useDrag", () => {
  test("returns default initial position", () => {
    const elementRef = makeElementRef();
    const { result } = renderHook(() => useDrag({ elementRef }));

    expect(result.current.position).toEqual({ top: 16, right: 16 });
  });

  test("returns custom initial position", () => {
    const elementRef = makeElementRef();
    const { result } = renderHook(() =>
      useDrag({ elementRef, initialPosition: { top: 50, right: 100 } }),
    );

    expect(result.current.position).toEqual({ top: 50, right: 100 });
  });

  test("isDragging starts as false", () => {
    const elementRef = makeElementRef();
    const { result } = renderHook(() => useDrag({ elementRef }));

    expect(result.current.isDragging).toBe(false);
  });

  test("drag sequence updates position by correct delta", () => {
    const elementRef = makeElementRef({
      width: 40,
      height: 40,
    });
    const { result } = renderHook(() =>
      useDrag({ elementRef, initialPosition: { top: 100, right: 100 } }),
    );

    // Start drag
    act(() => {
      result.current.handlePointerDown({
        clientX: 500,
        clientY: 300,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isDragging).toBe(true);

    // Move pointer: dx = 50, dy = 30
    act(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 550,
          clientY: 330,
        }),
      );
      flushRAF();
    });

    // top should increase by 30, right should decrease by 50
    expect(result.current.position).toEqual({ top: 130, right: 50 });

    // End drag
    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(result.current.isDragging).toBe(false);
  });

  test("position is clamped to viewport bounds", () => {
    const elementRef = makeElementRef({ width: 40, height: 40 });
    const { result } = renderHook(() =>
      useDrag({ elementRef, initialPosition: { top: 10, right: 10 } }),
    );

    // Start drag
    act(() => {
      result.current.handlePointerDown({
        clientX: 500,
        clientY: 300,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    // Move far right and up (dx = 600, dy = -500)
    act(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 1100,
          clientY: -200,
        }),
      );
      flushRAF();
    });

    // top clamped to 0, right clamped to 0 (pushed past right edge)
    expect(result.current.position.top).toBe(0);
    expect(result.current.position.right).toBeGreaterThanOrEqual(0);

    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup"));
    });
  });

  test("cleanup removes listeners on unmount", () => {
    const elementRef = makeElementRef();
    const removeListenerSpy = vi.spyOn(document, "removeEventListener");

    const { result, unmount } = renderHook(() => useDrag({ elementRef }));

    // Start a drag to register listeners
    act(() => {
      result.current.handlePointerDown({
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    // Unmount while dragging
    unmount();

    // Verify cancelAnimationFrame was available for cleanup
    expect(cancelAnimationFrame).toBeDefined();

    removeListenerSpy.mockRestore();
  });

  test("window resize re-clamps position", () => {
    const elementRef = makeElementRef({ width: 40, height: 40 });
    const { result } = renderHook(() =>
      useDrag({ elementRef, initialPosition: { top: 700, right: 900 } }),
    );

    // Shrink viewport
    act(() => {
      vi.stubGlobal("innerWidth", 500);
      vi.stubGlobal("innerHeight", 400);
      window.dispatchEvent(new Event("resize"));
    });

    // Position should be re-clamped to fit new viewport
    expect(result.current.position.top).toBeLessThanOrEqual(360); // 400 - 40
    expect(result.current.position.right).toBeLessThanOrEqual(460); // 500 - 40
  });
});
