import { describe, expect, test } from "vitest";

import { Button } from "../../src";
import { renderWithProviders } from "../test-utils";
import { axe, expectToHaveNoViolations } from "../test-utils/axe";

describe("Button", () => {
  test("renders as expected", () => {
    const { getByRole } = renderWithProviders(
      <Button variant="primary" onClick={() => {}} />,
    );
    const button = getByRole("button");

    expect(button).toHaveClass("rnf-button");
    expect(button).toHaveClass("rnf-button--primary");
  });

  test("is accessible", async () => {
    const { container } = renderWithProviders(
      <Button variant="primary" onClick={() => {}}>
        Test
      </Button>,
    );

    expectToHaveNoViolations(await axe(container));
  });
});
