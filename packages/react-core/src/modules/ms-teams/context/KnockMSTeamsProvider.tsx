import * as React from "react";
import { PropsWithChildren } from "react";

import { useKnockClient } from "../../core";
import { msTeamsProviderKey } from "../../core/utils";
import { useMSTeamsConnectionStatus } from "../hooks";
import { ConnectionStatus } from "../hooks/useMSTeamsConnectionStatus";

export interface KnockMSTeamsProviderState {
  knockMSTeamsChannelId: string;
  tenantId: string;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (connectionStatus: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (label: string) => void;
  actionLabel: string | null;
  setActionLabel: (label: string | null) => void;
}

const MSTeamsProviderStateContext =
  React.createContext<KnockMSTeamsProviderState | null>(null);

export interface KnockMSTeamsProviderProps {
  knockMSTeamsChannelId: string;
  tenantId: string;
}

export const KnockMSTeamsProvider: React.FC<
  PropsWithChildren<KnockMSTeamsProviderProps>
> = ({ knockMSTeamsChannelId, tenantId, children }) => {
  const knock = useKnockClient();

  const {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  } = useMSTeamsConnectionStatus(knock, knockMSTeamsChannelId, tenantId);

  return (
    <MSTeamsProviderStateContext.Provider
      key={msTeamsProviderKey({
        knockMSTeamsChannelId,
        tenantId,
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
        knockMSTeamsChannelId,
        tenantId,
      }}
    >
      {children}
    </MSTeamsProviderStateContext.Provider>
  );
};

export const useKnockMSTeamsClient = (): KnockMSTeamsProviderState => {
  const context = React.useContext(MSTeamsProviderStateContext);
  if (!context) {
    throw new Error(
      "useKnockMSTeamsClient must be used within a KnockMSTeamsProvider",
    );
  }
  return context;
};
