import { fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { MarkAsRead } from "../../src/modules/feed/components/NotificationFeed/MarkAsRead";

// Mock useKnockFeed to provide feedClient and store
const markAllAsReadMock = vi.fn();

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockFeed: () => ({
      colorMode: "light",
      feedClient: { markAllAsRead: markAllAsReadMock },
      useFeedStore: (selector: (state: unknown) => unknown) =>
        selector({
          items: [
            { id: "1", read_at: null },
            { id: "2", read_at: null },
          ],
          metadata: { unread_count: 2 },
        }),
    }),
    useTranslations: () => ({ t: (k: string) => k }),
  };
});

describe("MarkAsRead", () => {
  test("click invokes feedClient.markAllAsRead and onClick callback", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<MarkAsRead onClick={onClick} />);
    const button = getByRole("button", { name: /markallasread/i });

    fireEvent.click(button);

    expect(markAllAsReadMock).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
  });
});
