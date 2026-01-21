import * as React from "react";
import { PropsWithChildren, useRef } from "react";

import { useKnockClient } from "../../core";
import { msTeamsProviderKey } from "../../core/utils";
import { useMsTeamsConnectionStatus } from "../hooks";
import { ConnectionStatus } from "../hooks/useMsTeamsConnectionStatus";

export interface KnockMsTeamsProviderState {
  knockMsTeamsChannelId: string;
  tenantId: string;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (connectionStatus: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (label: string) => void;
  actionLabel: string | null;
  setActionLabel: (label: string | null) => void;
  popupWindowRef: React.MutableRefObject<Window | null>;
}

const MsTeamsProviderStateContext =
  React.createContext<KnockMsTeamsProviderState | null>(null);

export interface KnockMsTeamsProviderProps {
  knockMsTeamsChannelId: string;
  tenantId: string;
}

export const KnockMsTeamsProvider: React.FC<
  PropsWithChildren<KnockMsTeamsProviderProps>
> = ({ knockMsTeamsChannelId, tenantId, children }) => {
  const knock = useKnockClient();
  const popupWindowRef = useRef<Window | null>(null);

  const {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  } = useMsTeamsConnectionStatus(knock, knockMsTeamsChannelId, tenantId);

  return (
    <MsTeamsProviderStateContext.Provider
      key={msTeamsProviderKey({
        knockMsTeamsChannelId,
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
        knockMsTeamsChannelId,
        tenantId,
        popupWindowRef,
      }}
    >
      {children}
    </MsTeamsProviderStateContext.Provider>
  );
};

export const useKnockMsTeamsClient = (): KnockMsTeamsProviderState => {
  const context = React.useContext(MsTeamsProviderStateContext);
  if (!context) {
    throw new Error(
      "useKnockMsTeamsClient must be used within a KnockMsTeamsProvider",
    );
  }
  return context;
};
