import React from "react";
import { describe, expect, test } from "vitest";

import { Button } from "../../src";
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
});
