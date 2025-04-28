import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useMemo, useRef } from "react";

import { useStableOptions } from "../../core";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const feedClientRef = useRef<Feed>();
  const stableOptions = useStableOptions(options);

  return useMemo(() => {
    if (feedClientRef.current) {
      feedClientRef.current.dispose();
    }

    feedClientRef.current = knock.feeds.initialize(
      feedChannelId,
      stableOptions,
    );

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
