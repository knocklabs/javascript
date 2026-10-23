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

  test("initializes and returns a new feed client (strict mode off)", () => {
    vi.spyOn(knock.feeds, "initialize");

    const options: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
      mode: "rich",
    };

    const { result } = renderHook(
      () => useNotifications(knock, TEST_FEED_CHANNEL_ID, options),
      { reactStrictMode: false },
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

  test("initializes and returns a new feed client (strict mode on)", () => {
    vi.spyOn(knock.feeds, "initialize");
    vi.spyOn(knock.feeds, "removeInstance");

    const options: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
    };

    const { result } = renderHook(
      () => useNotifications(knock, TEST_FEED_CHANNEL_ID, options),
      { reactStrictMode: true },
    );

    const feedClient = result.current;

    // useState initializers and useEffect hooks run twice in strict mode,
    // so we should see 3 calls to initialize (2 in the useState initializer,
    // 1 in the useEffect hook when the disposed feed is reinitialized)

    expect(knock.feeds.initialize).toHaveBeenCalledTimes(3);
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(
      1,
      TEST_FEED_CHANNEL_ID,
      options,
    );
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(
      2,
      TEST_FEED_CHANNEL_ID,
      options,
    );
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(
      3,
      TEST_FEED_CHANNEL_ID,
      options,
    );

    expect(knock.feeds.removeInstance).toHaveBeenCalledTimes(1);
    const disposedFeedClient = vi.mocked(knock.feeds.removeInstance).mock
      .calls?.[0]?.[0];
    // The disposed feed client should have the same feed ID,
    // but should *not* be the same feed client instance
    expect(disposedFeedClient?.feedId).toEqual(TEST_FEED_CHANNEL_ID);
    expect(disposedFeedClient).not.toBe(feedClient);
  });

  test("disposes feed client on unmount", () => {
    vi.spyOn(knock.feeds, "initialize");
    vi.spyOn(knock.feeds, "removeInstance");

    const options: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
    };

    const { result, unmount } = renderHook(() =>
      useNotifications(knock, TEST_FEED_CHANNEL_ID, options),
    );

    const feedClient = result.current;

    // A feed client was initialized
    expect(knock.feeds.initialize).toHaveBeenCalledTimes(1);
    expect(feedClient).toBeDefined();

    unmount();

    // The feed client was disposed
    expect(knock.feeds.removeInstance).toHaveBeenCalledExactlyOnceWith(
      feedClient,
    );

    // No additional feed clients were initialized
    expect(knock.feeds.initialize).toHaveBeenCalledTimes(1);
  });

  test("disposes existing feed client when feed ID changes", () => {
    vi.spyOn(knock.feeds, "initialize");
    vi.spyOn(knock.feeds, "removeInstance");

    const feedId1 = TEST_FEED_CHANNEL_ID;
    const feedId2 = "86784a77-b9ea-4683-85b3-7362b426e810";

    const options: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
      mode: "rich",
    };

    const { result, rerender } = renderHook(
      (feedId: string) => useNotifications(knock, feedId, options),
      { initialProps: feedId1 },
    );

    const feedClient1 = result.current;
    rerender(feedId2);
    const feedClient2 = result.current;

    // The old feed client should be disposed
    expect(knock.feeds.removeInstance).toHaveBeenCalledExactlyOnceWith(
      feedClient1,
    );

    expect(knock.feeds.initialize).toHaveBeenCalledTimes(2);
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(1, feedId1, options);
    expect(knock.feeds.initialize).toHaveBeenNthCalledWith(2, feedId2, options);

    // A new feed client should be created
    expect(feedClient2).toBeDefined();
    expect(feedClient2).not.toBe(feedClient1);
    expect(feedClient2.feedId).toEqual(feedId2);
    expect(feedClient2.defaultOptions).toEqual(options);
  });

  test("disposes existing feed client when options change", () => {
    vi.spyOn(knock.feeds, "initialize");
    vi.spyOn(knock.feeds, "removeInstance");

    const options1: FeedClientOptions = {
      archived: "include",
      page_size: 10,
      status: "all",
      mode: "compact",
    };

    const options2: FeedClientOptions = {
      archived: "exclude",
      page_size: 10,
      status: "read",
      mode: "rich",
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
      1,
      TEST_FEED_CHANNEL_ID,
      options1,
    );
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
