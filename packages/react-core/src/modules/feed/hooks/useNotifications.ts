import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useMemo, useRef } from "react";

import { useStableOptions } from "../../core";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const feedClientRef = useRef<Feed | null>();
  const stableOptions = useStableOptions(options);

  return useMemo(() => {
    if (feedClientRef.current) {
      feedClientRef.current.dispose();
    }

    feedClientRef.current = knock.feeds.initialize(
      feedChannelId,
      stableOptions,
    );

    feedClientRef.current.listenForUpdates();
    // feedClientRef.current.store.subscribe((t) =>
    //   feedClientRef?.current?.store.setState(t),
    // );

    return feedClientRef.current;
  }, [knock, feedChannelId, stableOptions]);
}

export default useNotifications;
