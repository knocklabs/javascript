import * as React from "react";
import { PropsWithChildren } from "react";

import { msTeamsProviderKey } from "../../core/utils";

export interface KnockMSTeamsProviderState {
  knockMSTeamsChannelId: string;
  tenantId: string;
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
  return (
    <MSTeamsProviderStateContext.Provider
      key={msTeamsProviderKey({
        knockMSTeamsChannelId,
        tenantId,
      })}
      value={{ knockMSTeamsChannelId, tenantId }}
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
