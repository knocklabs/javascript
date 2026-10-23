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
  /**
   * Whether the targeting parameters for guide selection are loaded and ready.
   * When `true`, the provider fetches guides and subscribes to real-time updates.
   *
   * This is independent of authentication. Effective guide activity requires
   * **both** an authenticated user (i.e. a `KnockProvider` with a user and
   * `enabled` not set to `false`) **and** `readyToTarget`:
   *
   * | `enabled` (auth) | `readyToTarget` | Guides fetch/subscribe? |
   * | ---------------- | --------------- | ----------------------- |
   * | `false`          | `false`         | No                      |
   * | `false`          | `true`          | No (client no-ops)      |
   * | `true`           | `false`         | No                      |
   * | `true`           | `true`          | Yes                     |
   *
   * `readyToTarget` means "my targeting params are loaded"; auth means "there is
   * a user". When there is no user, the underlying guide client fetches/subscribes
   * are safe no-ops (they neither throw nor hit the network), so it is fine to
   * render `KnockGuideProvider` with `readyToTarget` while unauthenticated.
   */
  readyToTarget: boolean;
  listenForUpdates?: boolean;
  colorMode?: ColorMode;
  targetParams?: KnockGuideTargetParams;
  trackLocationFromWindow?: boolean;
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
      orderResolutionDuration,
      throttleCheckInterval,
    });
  }, [
    knock,
    channelId,
    stableTargetParams,
    trackLocationFromWindow,
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
