import Knock, { FeedClientOptions } from "@knocklabs/client";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import useNotifications from "../../src/modules/feed/hooks/useNotifications";

const TEST_FEED_CHANNEL_ID = "e84d5ddc-fd69-44ad-a431-68d784b8c306";

describe("useNotifications", () => {
  let knock: Knock;

  beforeEach(() => {
    knock = new Knock("test_api_key");
  });

  test("initializes and returns a new feed client", () => {
    vi.spyOn(knock.feeds, "initialize");

    const options: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
    };

    const { result } = renderHook(() =>
      useNotifications(knock, TEST_FEED_CHANNEL_ID, options),
    );

    expect(knock.feeds.initialize).toHaveBeenCalledExactlyOnceWith(
      TEST_FEED_CHANNEL_ID,
      options,
    );

    const feedClient = result.current;
    expect(feedClient).toBeDefined();
    expect(feedClient.feedId).toEqual(TEST_FEED_CHANNEL_ID);
    expect(feedClient.defaultOptions).toEqual(options);
  });

  test("disposes existing feed client when options change", () => {
    vi.spyOn(knock.feeds, "initialize");
    vi.spyOn(knock.feeds, "removeInstance");

    const options1: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
    };

    const options2: FeedClientOptions = {
      archived: "exclude",
      page_size: 10,
      status: "read",
    };

    const { result, rerender } = renderHook(
      (options: FeedClientOptions) =>
        useNotifications(knock, TEST_FEED_CHANNEL_ID, options),
      { initialProps: options1 },
    );

    const feedClient1 = result.current;
    rerender(options2);
    const feedClient2 = result.current;

    // The old feed client should be disposed
    expect(knock.feeds.removeInstance).toHaveBeenCalledExactlyOnceWith(
      feedClient1,
    );

    expect(knock.feeds.initialize).toHaveBeenCalledTimes(2);
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(
      2,
      TEST_FEED_CHANNEL_ID,
      options2,
    );

    // A new feed client should be created
    expect(feedClient2).toBeDefined();
    expect(feedClient2).not.toBe(feedClient1);
    expect(feedClient2.feedId).toEqual(TEST_FEED_CHANNEL_ID);
    expect(feedClient2.defaultOptions).toEqual(options2);
  });
});
