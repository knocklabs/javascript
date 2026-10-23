import { render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { KnockFeedProvider, KnockProvider, useKnockClient } from "../../src";

// The feed provider opens a phoenix socket once authenticated; jsdom has no
// WebSocket/BroadcastChannel, so provide inert stubs.
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: (() => void) | null = null;
  onerror: (() => void) | null = null;
  binaryType = "";
  constructor(public url: string) {}
  send() {}
  close() {}
}
class MockBroadcastChannel {
  onmessage: (() => void) | null = null;
  constructor(public name: string) {}
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

beforeAll(() => {
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const FEED_ID = "01234567-89ab-cdef-0123-456789abcdef";

describe("KnockProvider enabled -> feed reload", () => {
  test("builds a fresh authenticated client and remounts the feed subtree when enabled flips true", async () => {
    let feedMountCount = 0;
    const seenKnocks: unknown[] = [];

    // Counts how many times the feed subtree mounts. A remount (not just a
    // re-render) is the observable outcome that drives the feed to refetch.
    const FeedChild = () => {
      useEffect(() => {
        feedMountCount += 1;
      }, []);
      return null;
    };
    const CaptureKnock = () => {
      seenKnocks.push(useKnockClient());
      return null;
    };

    const tree = (enabled: boolean) => (
      <KnockProvider
        apiKey="pk_test_12345"
        user={{ id: "user_1" }}
        userToken="token_1"
        enabled={enabled}
      >
        <CaptureKnock />
        <KnockFeedProvider feedId={FEED_ID}>
          <FeedChild />
        </KnockFeedProvider>
      </KnockProvider>
    );

    const { rerender } = render(tree(false));

    // Disabled: the client is unauthenticated and the feed mounted exactly once.
    const disabledKnock = seenKnocks.at(-1) as {
      isAuthenticated: () => boolean;
    };
    expect(disabledKnock.isAuthenticated()).toBe(false);
    await waitFor(() => expect(feedMountCount).toBe(1));

    // Enable -> a brand-new authenticated client, and the feed subtree remounts
    // (its `feedProviderKey` now includes the userId), which is what makes it
    // refetch on login.
    rerender(tree(true));

    await waitFor(() => expect(feedMountCount).toBe(2));
    const enabledKnock = seenKnocks.at(-1) as {
      isAuthenticated: () => boolean;
    };
    expect(enabledKnock).not.toBe(disabledKnock);
    expect(enabledKnock.isAuthenticated()).toBe(true);
  });
});
