import React from "react";
import { describe, test, expect } from "vitest";
import { EmptyFeed } from "../../src";
import { renderWithProviders } from "../test-utils";

describe("Button", () => {
  test("renders as expected", () => {
    const { container } = renderWithProviders(<EmptyFeed />);
    const emptyFeed = container.querySelector(".rnf-empty-feed");

    expect(emptyFeed).toHaveClass("rnf-empty-feed--light");
    expect(emptyFeed).toHaveTextContent("No notifications yet");
  });
});
