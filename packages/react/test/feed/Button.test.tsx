import React from "react";
import { describe, expect, test } from "vitest";

import { Button } from "../../src";
import { axe, expectToHaveNoViolations } from "../axe";
import { renderWithProviders } from "../test-utils";

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

    expectToHaveNoViolations(await axe(container));
  });
});
