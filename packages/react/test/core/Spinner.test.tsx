import { describe, expect, test } from "vitest";

import { Spinner } from "../../src";
import { renderWithProviders } from "../test-utils";

// Mock debounce in case Spinner eventually pulls it (defensive)

describe("Spinner", () => {
  test("renders with default props", () => {
    const { container, getByTitle } = renderWithProviders(<Spinner />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("height", "1em");
    expect(svg).toHaveAttribute("width", "1em");
    // animation-duration comes from inline style
    expect(svg?.getAttribute("style")).toContain("animation-duration: 750ms");

    // Accessibility label exists
    expect(getByTitle(/circle loading spinner/i)).toBeInTheDocument();
  });

  test("respects custom props", () => {
    const { container } = renderWithProviders(
      <Spinner size="32px" color="#ff0000" thickness={2} speed="fast" />,
    );
    const svg = container.querySelector("svg");
    const circle = container.querySelector("circle");

    expect(svg).toHaveAttribute("height", "32px");
    expect(svg).toHaveAttribute("width", "32px");
    expect(svg?.getAttribute("style")).toContain("animation-duration: 600ms");
    expect(circle).toHaveAttribute("stroke", "#ff0000");
    expect(circle).toHaveAttribute("stroke-width", "2");
  });
});
