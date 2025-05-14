import Knock, { Feed, FeedClientOptions } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { useStableOptions } from "../../core";

interface State {
  feedClient: Feed;
  options: FeedClientOptions;
}

function useNotifications(
  knock: Knock,
  feedChannelId: string,
  options: FeedClientOptions = {},
): Feed {
  const initFeedClient = useCallback(
    (feedChannelId: string, options: FeedClientOptions) => {
      const feedClient = knock.feeds.initialize(feedChannelId, options);

      // In development, we need to introduce this extra set state to force a render
      // for Zustand as otherwise the state doesn't get reflected correctly
      feedClient.store.subscribe((t) => feedClient.store.setState(t));

      feedClient.listenForUpdates();

      return feedClient;
    },
    [knock],
  );

  const stableOptions = useStableOptions(options);
  const [state, setState] = useState<State>(() => ({
    feedClient: initFeedClient(feedChannelId, stableOptions),
    options: stableOptions,
  }));

  useEffect(() => {
    const needsReinit =
      state.feedClient.feedId !== feedChannelId ||
      state.options !== stableOptions;

    if (needsReinit) {
      setState({
        feedClient: initFeedClient(feedChannelId, stableOptions),
        options: stableOptions,
      });
      return;
    }

    return () => state.feedClient.dispose();
  }, [initFeedClient, feedChannelId, stableOptions, state]);

  return state.feedClient;
}

export default useNotifications;
