import { fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { NotificationIconButton } from "../../src";

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({
      colorMode: "dark",
      useFeedStore: (selector: (state: unknown) => unknown) =>
        selector({
          metadata: { total_count: 2, unread_count: 2, unseen_count: 2 },
        }),
    }),
    formatBadgeCount: (count: number) => count,
  };
});

describe("NotificationIconButton", () => {
  test("renders bell icon, badge and applies color mode class", () => {
    const handleClick = vi.fn();
    const { container, getByRole } = render(
      <NotificationIconButton onClick={handleClick} />, // default badgeCountType
    );

    const button = getByRole("button", { name: /open notification feed/i });
    expect(button).toHaveClass("rnf-notification-icon-button--dark");

    // Unseen badge inside should display count 2
    const badge = container.querySelector(".rnf-unseen-badge__count");
    expect(badge?.textContent).toBe("2");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
