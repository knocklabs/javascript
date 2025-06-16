import type { FeedItem } from "@knocklabs/client";
import { fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { NotificationCell } from "../../src/modules/feed/components/NotificationCell/NotificationCell";

// Mock react-core utilities
vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({
      colorMode: "light",
      feedClient: { markAsInteracted: vi.fn() },
    }),
    formatTimestamp: () => "now",
  };
});

describe("NotificationCell", () => {
  const feedItem = {
    id: "1",
    inserted_at: "2023-01-01T00:00:00Z",
    read_at: null,
    actors: [{ name: "Jane Doe", avatar: null }],
    blocks: [
      {
        name: "body",
        rendered: "<p>Hello world</p>",
        type: "markdown" as const,
      },
    ],
  } as unknown as FeedItem;

  test("renders body and avatar initials", () => {
    const { getByText, container } = render(
      <NotificationCell item={feedItem} />, // minimal props
    );

    expect(container.querySelector(".rnf-avatar__initials")?.textContent).toBe(
      "JD",
    );
    expect(getByText(/hello world/i)).toBeInTheDocument();
  });

  test("calls onItemClick handler when clicked", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <NotificationCell item={feedItem} onItemClick={onItemClick} />,
    );

    const cell = container.querySelector(
      ".rnf-notification-cell",
    ) as HTMLElement;
    fireEvent.click(cell);

    expect(onItemClick).toHaveBeenCalledWith(feedItem);
  });
});
