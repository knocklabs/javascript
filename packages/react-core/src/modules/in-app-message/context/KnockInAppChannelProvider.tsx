import {
  InAppChannelClient,
  InAppMessagesClientOptions,
} from "@knocklabs/client";
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

  defaultOptions?: InAppMessagesClientOptions;

  // Extra options
  colorMode?: ColorMode;
}

const InAppMessageContext = React.createContext<
  KnockInAppChannelProviderState | undefined
>(undefined);

export const KnockInAppChannelProvider: React.FC<
  React.PropsWithChildren<KnockInAppChannelProviderProps>
> = ({ children, channelId, colorMode = "light", defaultOptions }) => {
  // TODO: Catch knock error and resurface (same in KnockFeedProvider)
  const knock = useKnockClient();
  const inAppChannelClient = React.useMemo(() => {
    // TODO: Ensure this is stable when options are passed in
    return new InAppChannelClient(knock, channelId, defaultOptions);
  }, [knock, channelId, defaultOptions]);

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

export const useInAppChannel = (): KnockInAppChannelProviderState => {
  const context = React.useContext(InAppMessageContext);

  if (!context) {
    throw new Error(
      "useInAppChannel must be used within a KnockInAppChannelProvider",
    );
  }

  return context;
};
