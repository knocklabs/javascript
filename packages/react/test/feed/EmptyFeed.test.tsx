import React from "react";
import { describe, expect, test } from "vitest";
import { axe } from "vitest-axe";
import { toHaveNoViolations } from "vitest-axe/matchers";

import { EmptyFeed } from "../../src";
import { renderWithProviders } from "../test-utils";

expect.extend({ toHaveNoViolations });

describe("EmptyFeed", () => {
  test("renders as expected", () => {
    const { container } = renderWithProviders(<EmptyFeed />);
    const emptyFeed = container.querySelector(".rnf-empty-feed");

    expect(emptyFeed).toHaveClass("rnf-empty-feed--light");
    expect(emptyFeed).toHaveTextContent("No notifications yet");
  });

  test("has no a11y violations", async () => {
    const { container } = renderWithProviders(<EmptyFeed />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
