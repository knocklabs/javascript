import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useEffect, useState } from "react";

import { useStableOptions } from "../../core";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const [feedClient, setFeedClient] = useState<Feed>();
  const stableOptions = useStableOptions(options);

  useEffect(() => {
    const newFeedClient = knock.feeds.initialize(feedChannelId, stableOptions);

    newFeedClient.store.subscribe((t) => newFeedClient.store.setState(t));

    newFeedClient.listenForUpdates();
    setFeedClient(newFeedClient);

    return () => {
      newFeedClient.dispose();
    };
  }, [knock, feedChannelId, stableOptions]);

  return feedClient;
}

export default useNotifications;
