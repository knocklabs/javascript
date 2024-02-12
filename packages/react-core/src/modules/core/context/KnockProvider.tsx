import Knock from "@knocklabs/client";
import * as React from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";
import { useAuthenticatedKnockClient } from "../hooks";

export interface KnockProviderState {
  knock: Knock;
}

const ProviderStateContext = React.createContext<KnockProviderState | null>(
  null,
);

export interface KnockProviderProps {
  // Knock client props
  apiKey: string;
  host?: string;
  // Authentication props
  userId: string;
  userToken?: string;

  // Extra options
  children?: React.ReactElement;

  // i18n translations
  i18n?: I18nContent;
}

export const KnockProvider: React.FC<KnockProviderProps> = ({
  apiKey,
  host,
  userId,
  userToken,
  children,
  i18n,
}) => {
  const knock = useAuthenticatedKnockClient(apiKey, userId, userToken, {
    host,
  });

  return (
    <ProviderStateContext.Provider
      value={{
        knock,
      }}
    >
      <KnockI18nProvider i18n={i18n}>{children}</KnockI18nProvider>
    </ProviderStateContext.Provider>
  );
};

export const useKnockClient = (): Knock => {
  const context = React.useContext(ProviderStateContext) as KnockProviderState;
  if (context === undefined) {
    throw new Error("useKnock must be used within a KnockProvider");
  }
  return context.knock;
};
