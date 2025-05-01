import Knock, {
  KnockGuideClient,
  KnockGuideTargetParams,
} from "@knocklabs/client";
import * as React from "react";

import { useKnockClient, useStableOptions } from "../../core";
import { ColorMode } from "../../core/constants";

type KnockGuideProviderValue = {
  client: KnockGuideClient;
  colorMode: ColorMode;
};

export const KnockGuideContext = React.createContext<
  KnockGuideProviderValue | undefined
>(undefined);

type Props = {
  channelId: string;
  readyToTarget: boolean;
  listenForUpdates?: boolean;
  colorMode?: ColorMode;
  targetParams?: KnockGuideTargetParams;
  trackLocationFromWindow?: boolean;
};

export const KnockGuideProvider: React.FC<React.PropsWithChildren<Props>> = ({
  channelId,
  readyToTarget,
  listenForUpdates = true,
  colorMode = "light",
  targetParams = {},
  trackLocationFromWindow = true,
  children,
}) => {
  let knock: Knock;

  try {
    knock = useKnockClient();
  } catch (_) {
    throw new Error("KnockGuideProvider must be used within a KnockProvider");
  }

  const stableTargetParams = useStableOptions(targetParams);

  const knockGuideClient = React.useMemo(() => {
    return new KnockGuideClient(knock, channelId, stableTargetParams, {
      trackLocationFromWindow,
    });
  }, [knock, channelId, stableTargetParams, trackLocationFromWindow]);

  React.useEffect(() => {
    if (readyToTarget) {
      knockGuideClient.fetch();
      if (listenForUpdates) knockGuideClient.subscribe();
    }

    return () => knockGuideClient.cleanup();
  }, [readyToTarget, listenForUpdates, knockGuideClient]);

  return (
    <KnockGuideContext.Provider
      value={{
        client: knockGuideClient,
        colorMode,
      }}
    >
      {children}
    </KnockGuideContext.Provider>
  );
};
