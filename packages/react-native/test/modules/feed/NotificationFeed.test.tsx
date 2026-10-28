import { NetworkStatus } from "@knocklabs/client";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { NotificationFeed } from "../../../src/modules/feed/components/NotificationFeedComponents/NotificationFeed";

const { feedState, mockFeedClient } = vi.hoisted(() => ({
  feedState: {
    items: [] as unknown[],
    networkStatus: "ready",
    pageInfo: { after: null, before: null, page_size: 50 },
    metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
  },
  mockFeedClient: {
    fetch: vi.fn(),
    fetchNextPage: vi.fn(),
    markAllAsSeen: vi.fn(),
    markAllAsRead: vi.fn(),
    markAllReadAsArchived: vi.fn(),
  },
}));

vi.mock("@knocklabs/react-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@knocklabs/react-core")>()),
  useKnockFeed: () => ({
    feedClient: mockFeedClient,
    useFeedStore: () => feedState,
  }),
  useFeedSettings: () => ({
    settings: { features: { branding_required: false } },
  }),
}));

// These load native code that can't run under jsdom. Cells are never rendered
// here because every test uses an empty feed.
vi.mock("react-native-svg", () => ({ default: () => null, Path: () => null }));
vi.mock(
  "../../../src/modules/feed/components/NotificationFeedComponents/NotificationFeedCell",
  () => ({ NotificationFeedCell: () => null }),
);

describe("NotificationFeed", () => {
  beforeEach(() => {
    feedState.items = [];
  });

  test("shows the empty state once an empty feed has loaded", () => {
    feedState.networkStatus = NetworkStatus.ready;

    render(<NotificationFeed />);

    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  test("hides the empty state while the first page is loading", () => {
    feedState.networkStatus = NetworkStatus.loading;

    render(<NotificationFeed />);

    expect(screen.queryByText("No notifications yet")).not.toBeInTheDocument();
  });

  test("shows a spinner at the end of the list while fetching more", () => {
    feedState.networkStatus = NetworkStatus.fetchMore;

    render(<NotificationFeed />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("does not show the end-of-list spinner when the feed is ready", () => {
    feedState.networkStatus = NetworkStatus.ready;

    render(<NotificationFeed />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
