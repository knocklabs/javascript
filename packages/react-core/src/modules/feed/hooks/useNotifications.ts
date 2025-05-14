import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useCallback, useEffect, useRef } from "react";

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

  const feedClientRef = useRef<Feed | null>(null);

  // See https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
  if (feedClientRef.current === null) {
    feedClientRef.current = initFeedClient();
  }

  const disposedRef = useRef(false);

  useEffect(() => {
    if (disposedRef.current) {
      feedClientRef.current = initFeedClient();
      disposedRef.current = false;
    }

    const feedClient = feedClientRef.current;
    const isDisposed = disposedRef.current;

    return () => {
      if (!isDisposed && feedClient) {
        feedClient.dispose();
        disposedRef.current = true;
      }
    };
  }, [initFeedClient]);

  return feedClientRef.current;
}

export default useNotifications;
