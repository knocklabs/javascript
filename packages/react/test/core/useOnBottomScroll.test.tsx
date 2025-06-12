import { fireEvent } from "@testing-library/react";
import React, { useRef } from "react";
import { describe, expect, test, vi } from "vitest";

import useOnBottomScroll from "../../src/modules/core/hooks/useOnBottomScroll";
import { renderWithProviders } from "../test-utils";

// Mock debounce so callback executes immediately
vi.mock("lodash.debounce", () => {
  return {
    default: (fn: unknown) => fn,
  };
});

describe("useOnBottomScroll", () => {
  function TestComponent({
    offset = 0,
    callback,
  }: {
    offset?: number;
    callback: () => void;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useOnBottomScroll({ ref, callback, offset });

    return (
      <div>
        <div
          data-testid="scroll-container"
          ref={ref}
          style={{ height: "100px", overflow: "auto" }}
        >
          {/* Tall inner content to enable scrolling */}
          <div style={{ height: "1000px" }} />
        </div>
      </div>
    );
  }

  test("invokes callback when scrolled to bottom", () => {
    const cb = vi.fn();
    const { getByTestId } = renderWithProviders(
      <TestComponent callback={cb} />,
    );
    const container = getByTestId("scroll-container");

    // Mock dimensions
    Object.defineProperty(container, "scrollHeight", {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(container, "clientHeight", {
      value: 100,
      writable: true,
    });
    // Scroll to bottom (>= scrollHeight - offset)
    container.scrollTop = 900;

    fireEvent.scroll(container);

    expect(cb).toHaveBeenCalled();
  });

  test("does not invoke callback when not at bottom", () => {
    const cb = vi.fn();
    const { getByTestId } = renderWithProviders(
      <TestComponent callback={cb} />,
    );
    const container = getByTestId("scroll-container");

    Object.defineProperty(container, "scrollHeight", {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(container, "clientHeight", {
      value: 100,
      writable: true,
    });
    container.scrollTop = 500; // not bottom

    fireEvent.scroll(container);

    expect(cb).not.toHaveBeenCalled();
  });
});
