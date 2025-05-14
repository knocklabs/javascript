import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useEffect, useMemo, useRef } from "react";

import { useStableOptions } from "../../core";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
): Feed {
  const feedClientRef = useRef<Feed>();
  const disposedRef = useRef(false);
  const stableOptions = useStableOptions(options);

  useEffect(() => {
    return () => {
      const isDisposed = disposedRef.current;
      if (!isDisposed) {
        feedClientRef.current?.dispose();
        disposedRef.current = true;
      }
    };
  }, []);

  return useMemo(() => {
    const isDisposed = disposedRef.current;
    if (!isDisposed && feedClientRef.current) {
      feedClientRef.current.dispose();
      disposedRef.current = true;
    }

    feedClientRef.current = knock.feeds.initialize(
      feedChannelId,
      stableOptions,
    );
    disposedRef.current = false;

    // In development, we need to introduce this extra set state to force a render
    // for Zustand as otherwise the state doesn't get reflected correctly
    feedClientRef.current.store.subscribe((t) =>
      feedClientRef?.current?.store.setState(t),
    );

    feedClientRef.current.listenForUpdates();

    return feedClientRef.current;
  }, [knock, feedChannelId, stableOptions]);
}

export default useNotifications;
