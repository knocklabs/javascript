import { fireEvent, render } from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { NotificationFeedPopover } from "../../src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover";

// Mock PopperJS createPopper
vi.mock("@popperjs/core", () => ({
  createPopper: () => ({ destroy: vi.fn() }),
}));

// Mock react-core hooks
vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({
      colorMode: "light",
      feedClient: {
        markAllAsSeen: vi.fn(),
        fetch: vi.fn(),
        fetchNextPage: vi.fn(),
      },
      useFeedStore: () => ({
        metadata: { unseen_count: 0 },
        pageInfo: {},
        items: [],
        networkStatus: 0,
      }),
    }),
    useTranslations: () => ({ t: (k: string) => k }),
    useFeedSettings: () => ({
      settings: { features: { branding_required: false } },
    }),
  };
});

describe("NotificationFeedPopover", () => {
  test("visibility styles toggle based on isVisible prop", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const { container, rerender } = render(
      <>
        <button ref={buttonRef}>toggle</button>
        <NotificationFeedPopover
          isVisible={false}
          onClose={() => {}}
          buttonRef={buttonRef}
        />
      </>,
    );

    const popover = container.querySelector(
      ".rnf-notification-feed-popover",
    ) as HTMLElement;
    expect(popover.style.visibility).toBe("hidden");

    rerender(
      <>
        <button ref={buttonRef}>toggle</button>
        <NotificationFeedPopover
          isVisible={true}
          onClose={() => {}}
          buttonRef={buttonRef}
        />
      </>,
    );

    expect(popover.style.visibility).toBe("visible");
  });

  test("onClose is not called when clicking the button but is called when clicking outside", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const onClose = vi.fn();

    const { container } = render(
      <>
        <button ref={buttonRef}>toggle</button>
        <NotificationFeedPopover
          isVisible={true}
          onClose={onClose}
          buttonRef={buttonRef}
        />
        <div data-testid="outside">Outside element</div>
      </>,
    );

    // Click the button - onClose should not be called
    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(onClose).not.toHaveBeenCalled();

    // Click outside - onClose should be called
    const outsideElement = container.querySelector("[data-testid='outside']");
    fireEvent.click(outsideElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
