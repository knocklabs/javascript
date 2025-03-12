import Knock, {
  Feed,
  FeedClientOptions,
  FeedStoreState,
} from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";
import type { StoreApi, UseBoundStore } from "zustand";

import { useKnockClient } from "../../core";
import { ColorMode } from "../../core/constants";
import { feedProviderKey } from "../../core/utils";
import { useCreateNotificationStore } from "../hooks";
import useNotifications from "../hooks/useNotifications";

export interface KnockFeedProviderState {
  knock: Knock;
  feedClient: Feed;
  useFeedStore: UseBoundStore<StoreApi<FeedStoreState>>;
  colorMode: ColorMode;
}

const FeedStateContext = React.createContext<
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
  const knock = useKnockClient();
  const feedClient = useNotifications(knock, feedId, defaultFeedOptions);
  const useFeedStore = useCreateNotificationStore(feedClient);

  return (
    <FeedStateContext.Provider
      key={feedProviderKey(knock.userId, feedId, defaultFeedOptions)}
      value={{
        knock,
        feedClient,
        useFeedStore,
        colorMode,
      }}
    >
      {children}
    </FeedStateContext.Provider>
  );
};

export const useKnockFeed = (): KnockFeedProviderState => {
  const context = React.useContext(FeedStateContext);

  if (!context) {
    throw new Error("useKnockFeed must be used within a KnockFeedProvider");
  }

  return context;
};
