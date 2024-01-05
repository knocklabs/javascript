import * as React from "react";
import Knock, {
  Feed,
  FeedClientOptions,
  FeedStoreState,
} from "@knocklabs/client";
import create, { StoreApi, UseStore } from "zustand";

import { ColorMode } from "../../core/constants";
import useNotifications from "../hooks/useNotifications";
import { feedProviderKey } from "../../core/utils";
import { useKnockClient } from "../../core";

export interface KnockFeedProviderState {
  knock: Knock;
  feedClient: Feed;
  useFeedStore: UseStore<FeedStoreState>;
  colorMode: ColorMode;
}

const FeedStateContext = React.createContext<KnockFeedProviderState | null>(
  null,
);

export interface KnockFeedProviderProps {
  // Feed props
  feedId: string;

  // Extra options
  children?: React.ReactElement;
  colorMode?: ColorMode;

  // Feed client options
  defaultFeedOptions?: FeedClientOptions;
}

export const KnockFeedProvider: React.FC<KnockFeedProviderProps> = ({
  feedId,
  children,
  defaultFeedOptions = {},
  colorMode = "light",
}) => {
  const knock = useKnockClient();

  const feedClient = useNotifications(knock, feedId, defaultFeedOptions);
  const useFeedStore = create(feedClient.store as StoreApi<FeedStoreState>);

  return (
    <FeedStateContext.Provider
      key={feedProviderKey(feedId, defaultFeedOptions)}
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
  if (context === undefined) {
    throw new Error("useKnockFeed must be used within a KnockFeedProvider");
  }
  return context as KnockFeedProviderState;
};
