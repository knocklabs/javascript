import { describe, expect, test } from "vitest";

import { EmptyFeed } from "../../src";
import { axe, expectToHaveNoViolations } from "../axe";
import { renderWithProviders } from "../test-utils";

describe("EmptyFeed", () => {
  test("renders as expected", () => {
    const { container } = renderWithProviders(<EmptyFeed />);
    const emptyFeed = container.querySelector(".rnf-empty-feed");

    expect(emptyFeed).toHaveClass("rnf-empty-feed--light");
    expect(emptyFeed).toHaveTextContent("No notifications yet");
  });

  test("is accessible", async () => {
    const { container } = renderWithProviders(<EmptyFeed />);

    expectToHaveNoViolations(await axe(container));
  });
});
