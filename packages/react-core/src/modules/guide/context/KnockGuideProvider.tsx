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

export type KnockGuideProviderProps = {
  channelId: string;
  readyToTarget: boolean;
  listenForUpdates?: boolean;
  colorMode?: ColorMode;
  targetParams?: KnockGuideTargetParams;
  trackLocationFromWindow?: boolean;
  trackDebugParams?: boolean;
  orderResolutionDuration?: number; // in milliseconds
  throttleCheckInterval?: number; // in milliseconds
};

export const KnockGuideProvider: React.FC<
  React.PropsWithChildren<KnockGuideProviderProps>
> = ({
  channelId,
  readyToTarget,
  listenForUpdates = true,
  colorMode = "light",
  targetParams = {},
  trackLocationFromWindow = true,
  // Whether the guide client should look for debug params in url/local storage
  // to launch guide toolbar. Set to true if using toolbar v1.
  // TODO(KNO-11523): Remove this once we ship v2.
  trackDebugParams = false,
  // Default to 0 which works well for react apps as this "yields" to react for
  // one render cyle first and close the group stage.
  orderResolutionDuration = 0,
  throttleCheckInterval,
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
      trackDebugParams,
      orderResolutionDuration,
      throttleCheckInterval,
    });
  }, [
    knock,
    channelId,
    stableTargetParams,
    trackLocationFromWindow,
    trackDebugParams,
    orderResolutionDuration,
    throttleCheckInterval,
  ]);

  React.useEffect(() => {
    // When the toolbar v2 is visible, defer fetch/subscribe to the toolbar
    // so it can drive the debugging session lifecycle.
    const toolbarRunConfig = KnockGuideClient.getToolbarRunConfigFromUrl();

    if (readyToTarget && !toolbarRunConfig.isVisible) {
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
