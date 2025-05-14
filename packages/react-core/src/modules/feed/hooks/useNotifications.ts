import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const feedClientRef = useRef<Feed>(initFeedClient());
  const [disposed, setDisposed] = useState(false);

  useEffect(() => {
    if (disposed) {
      feedClientRef.current = initFeedClient();
      setDisposed(false);
    }

    const feedClient = feedClientRef.current;
    return () => {
      if (!disposed && feedClient) {
        feedClient.dispose();
        setDisposed(true);
      }
    };
  }, [disposed, initFeedClient]);

  return feedClientRef.current;
}

export default useNotifications;
