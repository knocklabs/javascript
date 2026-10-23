import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { UnseenBadge } from "../../src";

// Mock react-core useKnockFeed to supply metadata counts
vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({
      useFeedStore: (selector: (state: unknown) => unknown) =>
        selector({
          metadata: { total_count: 10, unread_count: 5, unseen_count: 3 },
        }),
    }),
    formatBadgeCount: (count: number) => count,
  };
});

function getBadge(container: HTMLElement) {
  return container.querySelector(".rnf-unseen-badge__count");
}

function getBadgeWrapper(container: HTMLElement) {
  return container.querySelector(".rnf-unseen-badge");
}

describe("UnseenBadge", () => {
  test("renders unseen count by default", () => {
    const { container } = render(<UnseenBadge />);
    expect(getBadge(container)?.textContent).toBe("3");
  });

  test("renders total count when badgeCountType is 'all'", () => {
    const { container } = render(<UnseenBadge badgeCountType="all" />);
    expect(getBadge(container)?.textContent).toBe("10");
  });

  test("has aria-label with unseen count for screen readers", () => {
    const { container } = render(<UnseenBadge />);
    expect(getBadgeWrapper(container)?.getAttribute("aria-label")).toBe(
      "3 unseen notifications",
    );
  });

  test("has aria-label with unread count for screen readers", () => {
    const { container } = render(<UnseenBadge badgeCountType="unread" />);
    expect(getBadgeWrapper(container)?.getAttribute("aria-label")).toBe(
      "5 unread notifications",
    );
  });

  test("has aria-label without qualifier when badgeCountType is 'all'", () => {
    const { container } = render(<UnseenBadge badgeCountType="all" />);
    expect(getBadgeWrapper(container)?.getAttribute("aria-label")).toBe(
      "10 notifications",
    );
  });

  test("has role='status' for live region announcements", () => {
    const { container } = render(<UnseenBadge />);
    expect(getBadgeWrapper(container)?.getAttribute("role")).toBe("status");
  });

  test("hides visual count from screen readers with aria-hidden", () => {
    const { container } = render(<UnseenBadge />);
    expect(getBadge(container)?.getAttribute("aria-hidden")).toBe("true");
  });
});
