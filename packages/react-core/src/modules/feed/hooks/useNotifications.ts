import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useMemo, useRef } from "react";

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
) {
  const feedClientRef = useRef<Feed | null>();

  return useMemo(() => {
    if (feedClientRef.current) {
      feedClientRef.current.dispose();
    }

    const feedClient = knock.feeds.initialize(feedChannelId, options);

    feedClient.listenForUpdates();
    feedClientRef.current = feedClient;

    return feedClient;
  }, [
    knock,
    feedChannelId,
    options.source,
    options.tenant,
    options.has_tenant,
    options.archived,
  ]);
}

export default useNotifications;
