import { FeedClientOptions } from "@knocklabs/client";
import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useNotifications from "../../src/modules/feed/hooks/useNotifications";

const TEST_FEED_CHANNEL_ID = "e84d5ddc-fd69-44ad-a431-68d784b8c306";

describe("useNotifications", () => {
  test("initializes and returns a new feed client", () => {
    // Create a mock Knock instance
    const mockKnock = {
      feeds: {
        initialize: vi.fn().mockReturnValue({
          dispose: vi.fn(),
          store: {
            subscribe: vi.fn(),
            setState: vi.fn(),
          },
          listenForUpdates: vi.fn(),
        }),
      },
    };

    const options: FeedClientOptions = {
      page_size: 10,
      status: "all",
    };

    // Render the hook
    const { result } = renderHook(() =>
      useNotifications(mockKnock as any, TEST_FEED_CHANNEL_ID, options),
    );

    // Verify that initialize was called with the correct parameters
    expect(mockKnock.feeds.initialize).toHaveBeenCalledWith(
      TEST_FEED_CHANNEL_ID,
      options,
    );

    const feedClient = result.current;
    expect(feedClient).toBeDefined();
    expect(feedClient.feedId).toEqual(TEST_FEED_CHANNEL_ID);
    expect(feedClient.defaultOptions).toEqual(options);
  });
});
