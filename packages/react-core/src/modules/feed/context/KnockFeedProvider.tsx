import Knock, {
  Feed,
  FeedClientOptions,
  FeedStoreState,
} from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";
import { UseBoundStore } from "zustand";

import { useKnockClient } from "../../core";
import { ColorMode } from "../../core/constants";
import { feedProviderKey } from "../../core/utils";
import { useCreateNotificationStore } from "../hooks";
import useNotifications from "../hooks/useNotifications";

export interface KnockFeedProviderState {
  knock: Knock;
  feedClient: Feed;
  useFeedStore: UseBoundStore<FeedStoreState>;
  colorMode: ColorMode;
}

const KnockFeedContext = React.createContext<
  KnockFeedProviderState | undefined
>(undefined);

export interface KnockFeedProviderProps {
  // Feed props
  feedId: string;

  // Extra options
  colorMode?: ColorMode;

  // Feed client options
  defaultFeedOptions?: FeedClientOptions;
}

export const KnockFeedProvider: React.FC<
  PropsWithChildren<KnockFeedProviderProps>
> = ({ feedId, children, defaultFeedOptions = {}, colorMode = "light" }) => {
  let knock: Knock;
  try {
    knock = useKnockClient();
  } catch (_) {
    throw new Error("KnockFeedProvider must be used within a KnockProvider.");
  }

  const feedClient = useNotifications(knock, feedId, defaultFeedOptions);
  const useFeedStore = useCreateNotificationStore(feedClient);

  return (
    <KnockFeedContext.Provider
      key={feedProviderKey(knock.userId, feedId, defaultFeedOptions)}
      value={{
        knock,
        feedClient,
        useFeedStore,
        colorMode,
      }}
    >
      {children}
    </KnockFeedContext.Provider>
  );
};

export const useKnockFeed = (): KnockFeedProviderState => {
  const context = React.useContext(KnockFeedContext);
  if (!context) {
    throw new Error("useKnockFeed must be used within a KnockFeedProvider");
  }

  return context;
};
