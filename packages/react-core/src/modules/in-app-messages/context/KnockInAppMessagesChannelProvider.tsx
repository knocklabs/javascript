import Knock, {
  InAppMessagesChannelClient,
  InAppMessagesClientOptions,
} from "@knocklabs/client";
import * as React from "react";

import { useKnockClient, useStableOptions } from "../../core";
import { ColorMode } from "../../core/constants";

export interface KnockInAppMessagesChannelProviderState {
  inAppMessagesChannelClient: InAppMessagesChannelClient;
  colorMode: ColorMode;
}

export interface KnockInAppMessagesChannelProviderProps {
  // In-App Message props
  channelId: string;
  defaultOptions?: InAppMessagesClientOptions;

  // Extra options
  colorMode?: ColorMode;
}

const KnockInAppMessagesContext = React.createContext<
  KnockInAppMessagesChannelProviderState | undefined
>(undefined);

export const KnockInAppMessagesChannelProvider: React.FC<
  React.PropsWithChildren<KnockInAppMessagesChannelProviderProps>
> = ({ children, channelId, colorMode = "light", defaultOptions }) => {
  let knock: Knock;
  try {
    knock = useKnockClient();
  } catch (_) {
    throw new Error(
      "KnockInAppMessagesChannelProvider must be used within a KnockProvider.",
    );
  }

  const stableOptions = useStableOptions(defaultOptions);

  const inAppMessagesChannelClient = React.useMemo(() => {
    return new InAppMessagesChannelClient(knock, channelId, stableOptions);
  }, [knock, channelId, stableOptions]);

  return (
    <KnockInAppMessagesContext.Provider
      value={{
        inAppMessagesChannelClient,
        colorMode,
      }}
    >
      {children}
    </KnockInAppMessagesContext.Provider>
  );
};

export const useInAppMessagesChannel =
  (): KnockInAppMessagesChannelProviderState => {
    const context = React.useContext(KnockInAppMessagesContext);
    if (!context) {
      throw new Error(
        "useInAppMessagesChannel must be used within a KnockInAppMessagesChannelProvider",
      );
    }

    return context;
  };
