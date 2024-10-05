import { InAppChannelClient } from "@knocklabs/client";
import * as React from "react";

import { useKnockClient } from "../../core";
import { ColorMode } from "../../core/constants";

export interface KnockInAppChannelProviderState {
  inAppChannelClient: InAppChannelClient;
  colorMode: ColorMode;
}

export interface KnockInAppChannelProviderProps {
  // In-App Message props
  channelId: string;

  // TODO: Support default props which will get passed down

  // Extra options
  colorMode?: ColorMode;
}

const InAppMessageContext = React.createContext<
  KnockInAppChannelProviderState | undefined
>(undefined);

export const KnockInAppChannelProvider: React.FC<
  React.PropsWithChildren<KnockInAppChannelProviderProps>
> = ({ children, channelId, colorMode = "light" }) => {
  // TODO: Catch knock error and resurface (same in KnockFeedProvider)
  const knock = useKnockClient();
  const inAppChannelClient = React.useMemo(() => {
    return new InAppChannelClient(knock, channelId);
  }, [knock, channelId]);

  return (
    <InAppMessageContext.Provider
      value={{
        inAppChannelClient,
        colorMode,
      }}
    >
      {children}
    </InAppMessageContext.Provider>
  );
};

export const useInAppMessageChannel = (): KnockInAppChannelProviderState => {
  const context = React.useContext(InAppMessageContext);

  if (!context) {
    throw new Error(
      "useInAppMessageChannel must be used within a KnockInAppChannelProvider",
    );
  }

  return context;
};
