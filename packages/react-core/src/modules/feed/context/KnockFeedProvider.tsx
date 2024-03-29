import Knock, {
  Feed,
  FeedClientOptions,
  FeedStoreState,
} from "@knocklabs/client";
import * as React from "react";
import create, { UseBoundStore } from "zustand";

import { useKnockClient } from "../../core";
import { ColorMode } from "../../core/constants";
import { feedProviderKey } from "../../core/utils";
import useNotifications from "../hooks/useNotifications";

export interface KnockFeedProviderState {
  knock: Knock;
  feedClient: Feed;
  useFeedStore: UseBoundStore<FeedStoreState>;
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
  const useFeedStore = create<FeedStoreState>(feedClient.store);

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
