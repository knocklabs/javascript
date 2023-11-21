import * as React from "react";

import {
  useKnockFeed,
  buildFeedProvider,
  KnockFeedProviderProps,
  KnockFeedProviderState,
} from "@knocklabs/react-headless";

import { KnockFeedContainer } from "./KnockFeedContainer";

const KnockFeedProvider: React.FC<KnockFeedProviderProps> =
  buildFeedProvider(KnockFeedContainer);

export {
  type KnockFeedProviderState,
  type KnockFeedProviderProps,
  KnockFeedProvider,
  useKnockFeed,
};
