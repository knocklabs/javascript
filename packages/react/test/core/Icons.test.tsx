import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { BellIcon, ChevronDown } from "../../src";

function getSvg(container: HTMLElement) {
  return container.querySelector("svg");
}

describe("Icon components", () => {
  test("BellIcon renders with default size", () => {
    const { container } = render(<BellIcon aria-hidden />);
    const svg = getSvg(container);
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  test("BellIcon accepts custom size", () => {
    const { container } = render(
      <BellIcon width={32} height={32} aria-hidden />,
    );
    const svg = getSvg(container);
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  test("ChevronDown is accessible", () => {
    const { container } = render(<ChevronDown aria-hidden={false} />);
    const svg = getSvg(container);
    // aria-hidden should be explicitly set to "false" when aria-hidden={false}
    expect(svg).toHaveAttribute("aria-hidden", "false");
  });
});
