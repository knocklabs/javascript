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
});
