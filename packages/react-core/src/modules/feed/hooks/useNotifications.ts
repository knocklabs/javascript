import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useEffect, useRef } from "react";

import { useStableOptions } from "../../core";

function initializeFeedClient(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const feedClient = knock.feeds.initialize(feedChannelId, options);
  feedClient.store.subscribe((t) => feedClient.store.setState(t));
  feedClient.listenForUpdates();
  return feedClient;
}

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const feedClientRef = useRef<Feed>(
    initializeFeedClient(knock, feedChannelId, options),
  );
  const stableOptions = useStableOptions(options);

  useEffect(() => {
    feedClientRef.current = initializeFeedClient(
      knock,
      feedChannelId,
      stableOptions,
    );

    return () => {
      feedClientRef.current.dispose();
    };
  }, [knock, feedChannelId, stableOptions]);

  return feedClientRef.current;
}

export default useNotifications;
