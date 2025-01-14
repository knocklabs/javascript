import { useSlackConnectionStatus } from "..";
import * as React from "react";
import { PropsWithChildren } from "react";

import { slackProviderKey } from "../../core";
import { useKnockClient } from "../../core";
import { ConnectionStatus } from "../hooks/useSlackConnectionStatus";

export interface KnockSlackProviderState {
  knockSlackChannelId: string;
  /**
   * The tenant ID for Slack integration.
   * @internal This is kept as 'tenant' for backwards compatibility with existing consumers
   */
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

export type KnockSlackProviderProps =
  | {
      knockSlackChannelId: string;
      /**
       * @deprecated Use tenantId instead. This prop will be removed in a future major release.
       */
      tenant: string;
    }
  | {
      knockSlackChannelId: string;
      /**
       * The ID of the tenant to use for Slack integration.
       * This replaces the deprecated 'tenant' prop for consistency with other providers.
       */
      tenantId: string;
    };

export const KnockSlackProvider: React.FC<
  PropsWithChildren<KnockSlackProviderProps>
> = (props) => {
  const { knockSlackChannelId, children } = props;
  const tenantId = "tenantId" in props ? props.tenantId : props.tenant;

  const knock = useKnockClient();

  const {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  } = useSlackConnectionStatus(knock, knockSlackChannelId, tenantId);

  return (
    <SlackProviderStateContext.Provider
      key={slackProviderKey({
        knockSlackChannelId,
        tenant: tenantId,
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
        tenant: tenantId,
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
