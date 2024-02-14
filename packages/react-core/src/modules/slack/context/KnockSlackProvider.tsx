import { useSlackConnectionStatus } from "..";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { slackProviderKey } from "../../core";
import { useKnockClient } from "../../core";
import { ConnectionStatus } from "../hooks/useSlackConnectionStatus";

const queryClient = new QueryClient();

export interface KnockSlackProviderState {
  knockSlackChannelId: string;
  tenant: string;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (connectionStatus: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (label: string) => void;
  actionLabel: string | null;
  setActionLabel: (label: string) => void;
}

const SlackProviderStateContext =
  React.createContext<KnockSlackProviderState | null>(null);

export interface KnockSlackProviderProps {
  knockSlackChannelId: string;
  tenant: string;
  children?: React.ReactElement;
}

export const KnockSlackProvider: React.FC<KnockSlackProviderProps> = ({
  knockSlackChannelId,
  tenant,
  children,
}) => {
  const knock = useKnockClient();

  const {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  } = useSlackConnectionStatus(knock, knockSlackChannelId, tenant);

  return (
    <SlackProviderStateContext.Provider
      key={slackProviderKey({
        knockSlackChannelId,
        tenant,
        connectionStatus,
        errorLabel,
      })}
      value={{
        connectionStatus,
        setConnectionStatus,
        errorLabel,
        setErrorLabel,
        actionLabel,
        setActionLabel,
        knockSlackChannelId,
        tenant,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SlackProviderStateContext.Provider>
  );
};

export const useKnockSlackClient = (): KnockSlackProviderState => {
  const context = React.useContext(
    SlackProviderStateContext,
  ) as KnockSlackProviderState;
  if (context === undefined) {
    throw new Error(
      "useKnockSlackClient must be used within a KnockSlackProvider",
    );
  }
  return context as KnockSlackProviderState;
};
