import { useSlackConnectionStatus } from "..";
import * as React from "react";
import { PropsWithChildren } from "react";

import { slackProviderKey } from "../../core";
import { useKnockClient } from "../../core";
import { ConnectionStatus } from "../hooks/useSlackConnectionStatus";

export interface KnockSlackProviderState {
  knockSlackChannelId: string;
  /**
   * @deprecated Use tenantId instead. This field will be removed in a future major release.
   * @internal This is kept as 'tenant' for backwards compatibility with existing consumers
   */
  tenant: string;
  /**
   * The ID of the tenant to use for Slack integration.
   * This is the preferred field over the deprecated 'tenant' field.
   */
  tenantId: string;
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
  // Use type guard to determine which prop is provided
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
        knockSlackChannelId,
        // Assign the same value to both tenant and tenantId for backwards compatibility
        tenant: tenantId,
        tenantId,
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
