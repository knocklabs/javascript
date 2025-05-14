import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { useStableOptions } from "../../core";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
): Feed {
  const stableOptions = useStableOptions(options);
  const initFeedClient = useCallback(() => {
    const feedClient = knock.feeds.initialize(feedChannelId, stableOptions);

    // In development, we need to introduce this extra set state to force a render
    // for Zustand as otherwise the state doesn't get reflected correctly
    feedClient.store.subscribe((t) => feedClient.store.setState(t));

    feedClient.listenForUpdates();

    return feedClient;
  }, [knock, feedChannelId, stableOptions]);

  const [feedClient, setFeedClient] = useState<Feed | null>(null);

  useEffect(() => {
    const nextFeedClient = initFeedClient();
    setFeedClient(nextFeedClient);
    return () => {
      nextFeedClient.dispose();
    };
  }, [initFeedClient]);

  return feedClient;
}

export default useNotifications;
