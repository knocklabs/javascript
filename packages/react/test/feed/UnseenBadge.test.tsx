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

describe("UnseenBadge", () => {
  test("renders unseen count by default", () => {
    const { container } = render(<UnseenBadge />);
    expect(getBadge(container)?.textContent).toBe("3");
  });

  test("renders total count when badgeCountType is 'all'", () => {
    const { container } = render(<UnseenBadge badgeCountType="all" />);
    expect(getBadge(container)?.textContent).toBe("10");
  });
});
