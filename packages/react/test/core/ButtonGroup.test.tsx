import { describe, expect, test } from "vitest";

import { Button, ButtonGroup } from "../../src";
import { renderWithProviders } from "../test-utils";

const noop = () => {};

describe("ButtonGroup", () => {
  test("renders children and applies group class", () => {
    const { container, getByRole } = renderWithProviders(
      <ButtonGroup>
        <Button variant="primary" onClick={noop}>
          A
        </Button>
        <Button variant="secondary" onClick={noop}>
          B
        </Button>
      </ButtonGroup>,
    );

    const groupDiv = container.querySelector(".rnf-button-group");
    expect(groupDiv).toBeInTheDocument();
    // Two buttons rendered inside the group
    expect(getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(getByRole("button", { name: "B" })).toBeInTheDocument();
  });
});
