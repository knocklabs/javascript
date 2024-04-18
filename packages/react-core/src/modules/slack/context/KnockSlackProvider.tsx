import { useSlackConnectionStatus } from "..";
import * as React from "react";
import { PropsWithChildren } from "react";

import { slackProviderKey } from "../../core";
import { useKnockClient } from "../../core";
import { ConnectionStatus } from "../hooks/useSlackConnectionStatus";

export interface KnockSlackProviderState {
  knockSlackChannelId: string;
  tenant: string;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (connectionStatus: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (label: string) => void;
  actionLabel: string | null;
  setActionLabel: (label: string | null) => void;
}

const SlackProviderStateContext =
  React.createContext<KnockSlackProviderState | null>(null);

export interface KnockSlackProviderProps {
  knockSlackChannelId: string;
  tenant: string;
}

export const KnockSlackProvider: React.FC<
  PropsWithChildren<KnockSlackProviderProps>
> = ({ knockSlackChannelId, tenant, children }) => {
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
      {children}
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
