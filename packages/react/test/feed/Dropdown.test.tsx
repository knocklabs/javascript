import { fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Dropdown } from "../../src/modules/feed/components/NotificationFeed/Dropdown";

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({ colorMode: "light" }),
  };
});

describe("Dropdown", () => {
  test("renders select with options and calls onChange", () => {
    const onChange = vi.fn();

    const { getByRole } = render(
      <Dropdown value="all" onChange={onChange}>
        <option value="all">All</option>
        <option value="unread">Unread</option>
      </Dropdown>,
    );

    const select = getByRole("combobox", {
      name: /select notification filter/i,
    });
    expect(select).toHaveValue("all");

    fireEvent.change(select, { target: { value: "unread" } });
    expect(onChange).toHaveBeenCalled();
  });
});
