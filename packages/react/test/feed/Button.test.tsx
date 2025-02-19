import React from "react";
import { describe, expect, test } from "vitest";
import { axe } from "vitest-axe";
import { toHaveNoViolations } from "vitest-axe/matchers";

import { Button } from "../../src";
import { renderWithProviders } from "../test-utils";

expect.extend({ toHaveNoViolations });

describe("Button", () => {
  test("renders as expected", () => {
    const { getByRole } = renderWithProviders(
      <Button variant="primary" onClick={() => {}} />,
    );
    const button = getByRole("button");

    expect(button).toHaveClass("rnf-button");
    expect(button).toHaveClass("rnf-button--primary");
  });

  test("has no a11y violations", async () => {
    const { container } = renderWithProviders(
      <Button variant="primary" onClick={() => {}}>
        Test
      </Button>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
