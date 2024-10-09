import Knock, {
  InAppChannelClient,
  InAppMessagesClientOptions,
} from "@knocklabs/client";
import * as React from "react";

import { useKnockClient, useStableOptions } from "../../core";
import { ColorMode } from "../../core/constants";

export interface KnockInAppChannelProviderState {
  inAppChannelClient: InAppChannelClient;
  colorMode: ColorMode;
}

export interface KnockInAppChannelProviderProps {
  // In-App Message props
  channelId: string;
  defaultOptions?: InAppMessagesClientOptions;

  // Extra options
  colorMode?: ColorMode;
}

const KnockInAppMessageContext = React.createContext<
  KnockInAppChannelProviderState | undefined
>(undefined);

export const KnockInAppChannelProvider: React.FC<
  React.PropsWithChildren<KnockInAppChannelProviderProps>
> = ({ children, channelId, colorMode = "light", defaultOptions }) => {
  let knock: Knock;
  try {
    knock = useKnockClient();
  } catch (error) {
    throw new Error(
      "KnockInAppChannelProvider must be used within a KnockProvider.",
    );
  }

  const stableOptions = useStableOptions(defaultOptions);

  const inAppChannelClient = React.useMemo(() => {
    return new InAppChannelClient(knock, channelId, stableOptions);
  }, [knock, channelId, stableOptions]);

  return (
    <KnockInAppMessageContext.Provider
      value={{
        inAppChannelClient,
        colorMode,
      }}
    >
      {children}
    </KnockInAppMessageContext.Provider>
  );
};

export const useInAppChannel = (): KnockInAppChannelProviderState => {
  const context = React.useContext(KnockInAppMessageContext);
  if (!context) {
    throw new Error(
      "useInAppChannel must be used within a KnockInAppChannelProvider",
    );
  }

  return context;
};
