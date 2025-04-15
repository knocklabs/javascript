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
  const stableOptions = useStableOptions(options);
  const feedClientRef = useRef<Feed>();

  if (!feedClientRef.current) {
    feedClientRef.current = initializeFeedClient(
      knock,
      feedChannelId,
      stableOptions,
    );
  }

  useEffect(() => {
    return () => {
      feedClientRef.current?.dispose();
    };
  }, []);

  return feedClientRef.current;
}

export default useNotifications;
