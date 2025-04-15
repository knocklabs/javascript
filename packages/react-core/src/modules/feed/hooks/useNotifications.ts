import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useEffect, useState } from "react";

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
  const [feedClient, setFeedClient] = useState<Feed>(
    initializeFeedClient(knock, feedChannelId, options),
  );
  const stableOptions = useStableOptions(options);

  useEffect(() => {
    const feedClient = initializeFeedClient(
      knock,
      feedChannelId,
      stableOptions,
    );
    setFeedClient(feedClient);

    return () => {
      feedClient.dispose();
    };
  }, [knock, feedChannelId, stableOptions]);

  return feedClient;
}

export default useNotifications;
