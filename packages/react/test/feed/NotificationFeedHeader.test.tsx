import { FilterStatus } from "@knocklabs/react-core";
import { fireEvent, render } from "@testing-library/react";
import React, { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import { NotificationFeedHeader } from "../../src/modules/feed/components/NotificationFeed/NotificationFeedHeader";

// Mock translations
vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useTranslations: () => ({ t: (k: string) => k }),
    useKnockFeed: () => ({
      colorMode: "light",
      feedClient: { markAllAsRead: vi.fn() },
      useFeedStore: (selector: (state: unknown) => unknown) =>
        selector({ metadata: { unread_count: 0 }, items: [] }),
    }),
  };
});

function Wrapper() {
  const [status, setStatus] = useState<FilterStatus>(FilterStatus.All);
  return (
    <NotificationFeedHeader
      filterStatus={status}
      setFilterStatus={setStatus}
      onMarkAllAsReadClick={vi.fn()}
    />
  );
}

describe("NotificationFeedHeader", () => {
  test("changing dropdown updates filter status", () => {
    const { getByRole } = render(<Wrapper />);
    const dropdown = getByRole("combobox", {
      name: /select notification filter/i,
    });
    expect(dropdown).toHaveValue(FilterStatus.All);

    fireEvent.change(dropdown, { target: { value: FilterStatus.Unread } });
    expect(dropdown).toHaveValue(FilterStatus.Unread);
  });
});
