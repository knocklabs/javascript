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

export interface KnockSlackProviderProps {
  knockSlackChannelId: string;
  /**
   * @deprecated Use tenantId instead. This prop will be removed in a future major release.
   */
  tenant?: string;
  /**
   * The ID of the tenant to use for Slack integration.
   * This replaces the deprecated 'tenant' prop for consistency with other providers.
   */
  tenantId?: string;
}

export const KnockSlackProvider: React.FC<
  PropsWithChildren<KnockSlackProviderProps>
> = ({ knockSlackChannelId, tenant, tenantId, children }) => {
  // Use tenantId if provided; otherwise fall back to tenant
  // At least one of tenant or tenantId must be provided
  if (!tenant && !tenantId) {
    throw new Error(
      "Either tenant or tenantId must be provided to KnockSlackProvider",
    );
  }

  // After the check above, we know that at least one of these is defined
  // TypeScript doesn't know this though, so we need to assert it
  const finalTenantId: string = tenantId ?? tenant ?? "";

  // Double check at runtime to be extra safe
  if (!finalTenantId) {
    throw new Error("Internal error: tenant ID is empty");
  }

  const knock = useKnockClient();

  const {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  } = useSlackConnectionStatus(knock, knockSlackChannelId, finalTenantId);

  return (
    <SlackProviderStateContext.Provider
      key={slackProviderKey({
        knockSlackChannelId,
        tenant: finalTenantId,
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
        tenant: finalTenantId,
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
