import { InAppChannelClient } from "@knocklabs/client";
import * as React from "react";

import { useKnockClient } from "../../core";
import { ColorMode } from "../../core/constants";

export interface KnockInAppMessageChannelProviderState {
  inAppChannelClient: InAppChannelClient;
  colorMode: ColorMode;
}

export interface KnockInAppMessageChannelProviderProps {
  // In-App Message props
  channelId: string;

  // Extra options
  colorMode?: ColorMode;
}

const InAppMessageContext = React.createContext<
  KnockInAppMessageChannelProviderState | undefined
>(undefined);

export const KnockInAppMessageChannelProvider: React.FC<
  React.PropsWithChildren<KnockInAppMessageChannelProviderProps>
> = ({ children, channelId, colorMode = "light" }) => {
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

export const useInAppMessageChannel =
  (): KnockInAppMessageChannelProviderState => {
    const context = React.useContext(InAppMessageContext);

    if (!context) {
      throw new Error(
        "useInAppMessageChannel must be used within a KnockInAppMessageChannelProvider",
      );
    }

    return context;
  };
