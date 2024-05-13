import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useMemo, useRef  } from "react";

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

    feedClientRef.current = knock.feeds.initialize(feedChannelId, options);
    feedClientRef.current.listenForUpdates();
    feedClientRef.current.store.subscribe((t) =>
      feedClientRef?.current?.store.setState(t),
    );

    return feedClientRef.current;
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
