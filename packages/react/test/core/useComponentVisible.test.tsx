import { fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import { describe, expect, test } from "vitest";

import useComponentVisible from "../../src/modules/core/hooks/useComponentVisible";
import { renderWithProviders } from "../test-utils";

describe("useComponentVisible", () => {
  function TestComponent({
    closeOnClickOutside = true,
  }: {
    closeOnClickOutside?: boolean;
  }) {
    const [visible, setVisible] = useState(true);
    const handleClick = () => {
      setVisible(false);
    };

    const { ref } = useComponentVisible(visible, handleClick, {
      closeOnClickOutside,
    });

    return (
      <div data-testid="outside">
        {visible && (
          <div data-testid="inside" ref={ref}>
            inside
          </div>
        )}
      </div>
    );
  }

  test("calls onClose when Escape key pressed", () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    const outside = getByTestId("outside");

    fireEvent.keyDown(outside, { key: "Escape" });

    // onClose is called and component unmounted (inside gone)
    expect(
      getByTestId("outside").querySelector("[data-testid='inside']"),
    ).not.toBeInTheDocument();
  });

  test("calls onClose when clicking outside", () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    const outside = getByTestId("outside");

    fireEvent.click(outside);

    expect(
      getByTestId("outside").querySelector("[data-testid='inside']"),
    ).not.toBeInTheDocument();
  });

  test("does not close when clicking inside", () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    const inside = getByTestId("inside");

    fireEvent.click(inside);

    expect(getByTestId("inside")).toBeInTheDocument();
  });
});
